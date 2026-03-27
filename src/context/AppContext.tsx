import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
// Supabase removed - fake auth

export type Role = "admin" | "hod" | "student";

export interface College {
  id: string;
  name: string;
}

export interface Venue {
  id: string;
  college_id: string;
  name: string;
  capacity: number;
  facilities: string[];
}

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: Role | null;
  college_id: string | null;
  college_name?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  venue_id: string;
  category: string;
  requested_by: string;
  requester_name?: string;
  status: "pending" | "approved" | "rejected";
  college_id: string;
  registration_fee: number;
  max_capacity: number;
  external_link?: string;
  registration_count?: number;
}

interface AppContextType {
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: Role, collegeId: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  colleges: College[];
  events: Event[];
  venues: Venue[];
  refreshEvents: () => Promise<void>;
  refreshVenues: () => Promise<void>;
  addEvent: (event: { title: string; date: string; venue_id: string; category: string; registration_fee: number; max_capacity: number; external_link?: string }) => Promise<{ success: boolean; message: string }>;
  updateEventStatus: (id: string, status: "approved" | "rejected") => Promise<void>;
  addVenue: (venue: { name: string; capacity: number; facilities: string[] }) => Promise<{ success: boolean; message: string }>;
  deleteVenue: (id: string) => Promise<void>;
  registrations: string[];
  registerForEvent: (eventId: string, phone: string, semester: string, paymentStatus: string) => Promise<{ registrationId: string | null }>;
  isRegistered: (eventId: string) => boolean;
  getRegistrationCount: (eventId: string) => number;
  resetPassword: (email: string) => Promise<{ error: string | null }>;

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
  const [colleges, setColleges] = useState<College[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [registrations, setRegistrations] = useState<string[]>([]);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});

  // Load colleges on mount
  useEffect(() => {
    supabase.from("colleges").select("id, name").then(({ data }) => {
      if (data) setColleges(data);
    });
  }, []);

  // Fake loadUserProfile - not used

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

  const signUp = async (email: string, password: string, fullName: string, role: Role, collegeId: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, college_id: collegeId } },
    });
    if (error) return { error: error.message };
    if (data.user) {
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
    setVenues([]);
    setRegistrations([]);
  };

  const refreshVenues = useCallback(async () => {
    const { data } = await supabase.from("venues").select("*").order("name");
    if (data) setVenues(data as unknown as Venue[]);
  }, []);

  const refreshEvents = useCallback(async () => {
    const { data } = await supabase
      .from("events")
      .select("*, venues(name), profiles!events_requested_by_fkey(full_name)")
      .order("created_at", { ascending: false });

    if (data) {
      type RawEvent = {
        id: string;
        title: string;
        date: string;
        venues?: { name?: string };
        venue?: string;
        venue_id?: string;
        category?: string;
        requested_by?: string;
        profiles?: { full_name?: string };
        status?: "pending" | "approved" | "rejected";
        college_id?: string;
        registration_fee?: string | number;
        max_capacity?: number;
        external_link?: string;
      };

      const eventsData = data as RawEvent[];

      setEvents(
        eventsData.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          venue: e.venues?.name || e.venue || "Unknown",
          venue_id: e.venue_id || "",
          category: e.category || "",
          requested_by: e.requested_by || "",
          requester_name: e.profiles?.full_name || "Unknown",
          status: e.status || "pending",
          college_id: e.college_id || "",
          registration_fee: Number(e.registration_fee) || 0,
          max_capacity: e.max_capacity || 100,
          external_link: e.external_link,
        }))
      );
    }

    // Fetch registration counts
    const { data: regData } = await supabase.from("registrations").select("event_id");
    if (regData) {
      const counts: Record<string, number> = {};
      const regDataTyped = regData as Array<{ event_id: string }>;
      regDataTyped.forEach((r) => {
        counts[r.event_id] = (counts[r.event_id] || 0) + 1;
      });
      setRegCounts(counts);
    }
  }, []);

  const refreshRegistrations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("registrations").select("event_id").eq("student_id", user.id);
    if (data) setRegistrations(data.map((r) => r.event_id));
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshEvents();
      refreshVenues();
      refreshRegistrations();
    }
  }, [user, refreshEvents, refreshVenues, refreshRegistrations]);

  const addEvent = async (event: { title: string; date: string; venue_id: string; category: string; registration_fee: number; max_capacity: number; external_link?: string }) => {
    if (!user || !user.college_id) return { success: false, message: "Not authenticated" };

    const { error } = await supabase.from("events").insert({
      title: event.title,
      date: event.date,
      venue_id: event.venue_id,
      venue: "", // legacy column
      category: event.category,
      requested_by: user.id,
      college_id: user.college_id,
      registration_fee: event.registration_fee,
      max_capacity: event.max_capacity,
      external_link: event.external_link || null,
    });

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: `Venue Conflict: This venue is already booked on ${event.date}. Please choose another slot.` };
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

  const addVenue = async (venue: { name: string; capacity: number; facilities: string[] }) => {
    if (!user || !user.college_id) return { success: false, message: "Not authenticated" };
    const { error } = await supabase.from("venues").insert({
      name: venue.name,
      capacity: venue.capacity,
      facilities: venue.facilities,
      college_id: user.college_id,
    });
    if (error) return { success: false, message: error.message };
    await refreshVenues();
    return { success: true, message: "Venue added!" };
  };

  const deleteVenue = async (id: string) => {
    await supabase.from("venues").delete().eq("id", id);
    await refreshVenues();
  };

  const registerForEvent = async (eventId: string, phone: string, semester: string, paymentStatus: string) => {
    if (!user) return { registrationId: null };
    const { data, error } = await supabase.from("registrations").insert({
      event_id: eventId,
      student_id: user.id,
      phone,
      semester,
      payment_status: paymentStatus,
    }).select("id").single();
    if (error) return { registrationId: null };
    await refreshRegistrations();
    await refreshEvents();
    return { registrationId: data?.id || null };
  };

  const isRegistered = (eventId: string) => registrations.includes(eventId);
  const getRegistrationCount = (eventId: string) => regCounts[eventId] || 0;

  // added forgot pwd quick - sends reset link, check spam too
  const resetPassword = async (emailStr: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(emailStr, {
      redirectTo: `${window.location.origin}/login`, // hacky, use env later
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  return (

    <AppContext.Provider
      value={{
        user, loading, signUp, signIn, signOut,
        colleges, events, venues,
        refreshEvents, refreshVenues,
        addEvent, updateEventStatus,
        addVenue, deleteVenue,
        registrations, registerForEvent, isRegistered, getRegistrationCount, resetPassword,

      }}
    >
      {children}
    </AppContext.Provider>
  );
};
