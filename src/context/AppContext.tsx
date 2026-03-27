import React, { createContext, useContext, useState, useCallback } from "react";

export type Role = "admin" | "hod" | "student";

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  requested_by: string;
  status: "pending" | "approved" | "rejected";
}

export interface Registration {
  id: string;
  event_id: string;
  student_id: string;
}

interface AppContextType {
  currentUser: User | null;
  login: (name: string, role: Role) => void;
  logout: () => void;
  events: Event[];
  addEvent: (event: Omit<Event, "id" | "status">) => { success: boolean; message: string };
  updateEventStatus: (id: string, status: "approved" | "rejected") => void;
  registrations: Registration[];
  registerForEvent: (eventId: string) => void;
  isRegistered: (eventId: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const login = useCallback((name: string, role: Role) => {
    setCurrentUser({ id: crypto.randomUUID(), name, role });
  }, []);

  const logout = useCallback(() => setCurrentUser(null), []);

  const addEvent = useCallback((event: Omit<Event, "id" | "status">): { success: boolean; message: string } => {
    const conflict = events.find(
      (e) => e.date === event.date && e.venue === event.venue && e.status !== "rejected"
    );
    if (conflict) {
      return { success: false, message: `Venue Conflict: "${event.venue}" is already booked on ${event.date}. Please choose another slot.` };
    }
    setEvents((prev) => [...prev, { ...event, id: crypto.randomUUID(), status: "pending" }]);
    return { success: true, message: "Event request submitted successfully!" };
  }, [events]);

  const updateEventStatus = useCallback((id: string, status: "approved" | "rejected") => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }, []);

  const registerForEvent = useCallback((eventId: string) => {
    if (!currentUser) return;
    setRegistrations((prev) => [
      ...prev,
      { id: crypto.randomUUID(), event_id: eventId, student_id: currentUser.id },
    ]);
  }, [currentUser]);

  const isRegistered = useCallback(
    (eventId: string) => {
      if (!currentUser) return false;
      return registrations.some((r) => r.event_id === eventId && r.student_id === currentUser.id);
    },
    [currentUser, registrations]
  );

  return (
    <AppContext.Provider
      value={{ currentUser, login, logout, events, addEvent, updateEventStatus, registrations, registerForEvent, isRegistered }}
    >
      {children}
    </AppContext.Provider>
  );
};
