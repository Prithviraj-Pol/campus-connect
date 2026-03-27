import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
  regCounts: Record<string, number>;
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
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState<College[]>([
    { id: "1", name: "Campus College" }
  ]);
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [registrations, setRegistrations] = useState<string[]>([]);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});

  // Fake users - email as key
  const FAKE_USERS: Record<string, Omit<AppUser, 'email'>> = {
    'admin@campus.com': {
      id: 'admin1',
      fullName: 'Super Admin',
      role: 'admin',
      college_id: '1',
      college_name: 'Campus College'
    },
    'hod@campus.com': {
      id: 'hod1',
      fullName: 'Department HOD',
      role: 'hod',
      college_id: '1',
      college_name: 'Campus College'
    },
    'student@campus.com': {
      id: 'student1',
      fullName: 'John Student',
      role: 'student',
      college_id: '1',
      college_name: 'Campus College'
    }
  };

  const fakeEvents: Event[] = [
    {
      id: 'e1',
      title: 'Tech Fest 2024',
      date: '2024-04-15',
      venue: 'Main Auditorium',
      venue_id: 'v1',
      category: 'Technical',
      requested_by: 'hod1',
      requester_name: 'Department HOD',
      status: 'pending',
      college_id: '1',
      registration_fee: 50,
      max_capacity: 500,
      registration_count: 25
    },
    {
      id: 'e2',
      title: 'Sports Day',
      date: '2024-04-20',
      venue: 'Sports Hall',
      venue_id: 'v3',
      category: 'Sports',
      requested_by: 'hod1',
      requester_name: 'Department HOD',
      status: 'pending',
      college_id: '1',
      registration_fee: 20,
      max_capacity: 200,
      registration_count: 45
    },
    {
      id: 'e3',
      title: 'Cultural Night',
      date: '2024-04-25',
      venue: 'Main Auditorium',
      venue_id: 'v1',
      category: 'Cultural',
      requested_by: 'hod1',
      requester_name: 'Department HOD',
      status: 'approved',
      college_id: '1',
      registration_fee: 100,
      max_capacity: 500,
      registration_count: 120
    }
  ];

  const fakeVenues: Venue[] = [
    {
      id: 'v1',
      college_id: '1',
      name: 'Main Auditorium',
      capacity: 500,
      facilities: ['AC', 'Projector', 'Sound']
    },
    {
      id: 'v2',
      college_id: '1',
      name: 'Computer Lab 1',
      capacity: 50,
      facilities: ['Computers', 'Projector']
    },
    {
      id: 'v3',
      college_id: '1',
      name: 'Sports Hall',
      capacity: 200,
      facilities: ['Basketball', 'Badminton']
    }
  ];

  const loadFakeData = useCallback(() => {
    setEvents(fakeEvents);
    setVenues(fakeVenues);
    const counts = {
      'e1': 25,
      'e2': 45,
      'e3': 120
    };
    setRegCounts(counts);
    setRegistrations(['e3']); // student example
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userData = FAKE_USERS[email.toLowerCase()];
    if (userData && password.endsWith('123')) {
      setUser({ ...userData, email });
      loadFakeData();
      setLoading(false);
      return { error: null };
    }
    setLoading(false);
    return { error: 'Invalid credentials. Use demo accounts.' };
  };

  const signUp = async () => Promise.resolve({ error: 'Sign up disabled for demo. Use login.' });

  const signOut = async () => {
    setUser(null);
    setEvents([]);
    setVenues([]);
    setRegistrations([]);
    setRegCounts({});
  };

  const refreshEvents = async () => loadFakeData();
  const refreshVenues = async () => loadFakeData();

  const addEvent = async (eventData) => {
    const newEvent: Event = {
      ...eventData,
      id: 'e' + Date.now(),
      status: 'pending',
      requested_by: user.id || '',
      requester_name: user.fullName || '',
      college_id: user.college_id || '1',
      registration_count: 0
    };
    setEvents(prev => [...prev, newEvent]);
    return { success: true, message: 'Event added!' };
  };

  const updateEventStatus = async (id, status) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  const addVenue = async (venueData) => {
    const newVenue: Venue = {
      ...venueData,
      id: 'v' + Date.now(),
      college_id: '1'
    };
    setVenues(prev => [...prev, newVenue]);
    return { success: true, message: 'Venue added!' };
  };

  const deleteVenue = async (id) => {
    setVenues(prev => prev.filter(v => v.id !== id));
  };

  const registerForEvent = async (eventId) => {
    if (!user || user.role !== 'student') return { registrationId: null };
    setRegistrations(prev => [...prev, eventId]);
    setRegCounts(prev => ({ ...prev, [eventId]: (prev[eventId] || 0) + 1 }));
    return { registrationId: 'reg' + Date.now() };
  };

  const isRegistered = (eventId: string) => registrations.includes(eventId);
  const getRegistrationCount = (eventId: string) => regCounts[eventId] || 0;
  const resetPassword = async () => Promise.resolve({ error: null });

  useEffect(() => {
    setLoading(false); // Initial not loading
  }, []);

  useEffect(() => {
    if (user) loadFakeData();
  }, [user, loadFakeData]);

  return (
    <AppContext.Provider
      value={{
        user, loading, signUp, signIn, signOut,
        colleges, events, venues, regCounts,
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

