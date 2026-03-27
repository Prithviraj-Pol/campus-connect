import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type Role = "admin" | "hod" | "student";

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: Role | null;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  requested_by: string;
  requester_name?: string;
  status: "pending" | "approved" | "rejected";
}

interface AppContextType {
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: Role) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  events: Event[];
  refreshEvents: () => Promise<void>;
  addEvent: (event: { title: string; date: string; venue: string; category: string }) => Promise<{ success: boolean; message: string }>;
  updateEventStatus: (id: string, status: "approved" | "rejected") => Promise<void>;
  registrations: string[];
  registerForEvent: (eventId: string) => Promise<void>;
  isRegistered: (eventId: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<string[]>([]);

  const loadUserProfile = useCallback(async (supaUser: SupabaseUser) => {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("user_id", supaUser.id).single(),
      supabase.from("user_roles").select("role").eq("user_id", supaUser.id).single(),
    ]);

    setUser({
      id: supaUser.id,
      email: supaUser.email || "",
      fullName: profileRes.data?.full_name || supaUser.email || "",
      role: (roleRes.data?.role as Role) || null,
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const signUp = async (email: string, password: string, fullName: string, role: Role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      // Assign role
      await supabase.from("user_roles").insert({ user_id: data.user.id, role });
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEvents([]);
    setRegistrations([]);
  };

  const refreshEvents = useCallback(async () => {
    const { data } = await supabase
      .from("events")
      .select("*, profiles!events_requested_by_fkey(full_name)")
      .order("created_at", { ascending: false });

    if (data) {
      setEvents(
        data.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          venue: e.venue,
          category: e.category,
          requested_by: e.requested_by,
          requester_name: e.profiles?.full_name || "Unknown",
          status: e.status as "pending" | "approved" | "rejected",
        }))
      );
    }
  }, []);

  // Load registrations for current user
  const refreshRegistrations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("registrations")
      .select("event_id")
      .eq("student_id", user.id);
    if (data) setRegistrations(data.map((r) => r.event_id));
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshEvents();
      refreshRegistrations();
    }
  }, [user, refreshEvents, refreshRegistrations]);

  const addEvent = async (event: { title: string; date: string; venue: string; category: string }) => {
    if (!user) return { success: false, message: "Not authenticated" };

    const { error } = await supabase.from("events").insert({
      title: event.title,
      date: event.date,
      venue: event.venue,
      category: event.category,
      requested_by: user.id,
    });

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: `Venue Conflict: "${event.venue}" is already booked on ${event.date}. Please choose another slot.` };
      }
      return { success: false, message: error.message };
    }

    await refreshEvents();
    return { success: true, message: "Event request submitted successfully!" };
  };

  const updateEventStatus = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("events").update({ status }).eq("id", id);
    await refreshEvents();
  };

  const registerForEvent = async (eventId: string) => {
    if (!user) return;
    await supabase.from("registrations").insert({ event_id: eventId, student_id: user.id });
    await refreshRegistrations();
  };

  const isRegistered = (eventId: string) => registrations.includes(eventId);

  return (
    <AppContext.Provider
      value={{ user, loading, signUp, signIn, signOut, events, refreshEvents, addEvent, updateEventStatus, registrations, registerForEvent, isRegistered }}
    >
      {children}
    </AppContext.Provider>
  );
};
