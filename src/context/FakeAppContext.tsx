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
  department?: string; // NEW: CS, AIDS, AIML, Mech, CIVIL
  interests?: string[]; // NEW: for students ['Technical', 'AI', 'Sports']
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

export interface Registration { // NEW
  id: string;
  event_id: string;
  student_id: string;
  phone?: string;
  semester?: string;
  is_coordinator: boolean;
  attendance_status: 'pending' | 'present' | 'absent';
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
  registrations: Registration[];
  registerForEvent: (eventId: string, phone: string, semester: string, paymentStatus: string) => Promise<{ registrationId: string | null }>;
  isRegistered: (eventId: string) => boolean;
  getRegistrationCount: (eventId: string) => number;
  regCounts: Record<string, number>;
  getRegistrationsForEvent: (eventId: string) => Registration[]; // NEW
  toggleCoordinator: (regId: string) => void; // NEW
  updateAttendance: (regId: string, status: 'pending' | 'present' | 'absent') => void; // NEW
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
    { id: "1", name: "Campus College" },
    { id: "2", name: "MIT Thandavapura" }, // NEW
    { id: "3", name: "MIT Mysore" }, // NEW
    { id: "4", name: "NIT Surathkal" } // NEW
  ]);
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([
    // Samples for student demo: e3 (Cultural - coord), e1 (Technical - registered), e2 (Sports)
    { id: 'r1', event_id: 'e3', student_id: 'student1', phone: '1234567890', semester: '5', is_coordinator: true, attendance_status: 'present' },
    { id: 'r2', event_id: 'e3', student_id: 'student2', phone: '0987654321', semester: '3', is_coordinator: false, attendance_status: 'absent' },
    { id: 'r3', event_id: 'e3', student_id: 'student3', phone: null, semester: null, is_coordinator: false, attendance_status: 'pending' },
    // Student registered for e1 Technical
    { id: 'r4', event_id: 'e1', student_id: 'student1', phone: '1234567890', semester: '5', is_coordinator: false, attendance_status: 'pending' },
    // More for e4 Dancing
    { id: 'r5', event_id: 'e4', student_id: 'student4', phone: '1111111111', semester: '4', is_coordinator: false, attendance_status: 'pending' },
    // e5 AI Workshop
    { id: 'r6', event_id: 'e5', student_id: 'student5', phone: '2222222222', semester: '6', is_coordinator: false, attendance_status: 'pending' }
  ]);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({
    e1: 120,
    e2: 45,
    e3: 3,
    e4: 25,
    e5: 35
  });

  // Fake users - email as key - UPDATED
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
      college_id: '2', // MIT Thandavapura
      college_name: 'MIT Thandavapura',
      department: 'AIDS' // NEW
    },
    'student@campus.com': {
      id: 'student1',
      fullName: 'John Student',
      role: 'student',
      college_id: '2', // MIT Thandavapura
      college_name: 'MIT Thandavapura',
      department: 'CS', // NEW
      interests: ['Technical', 'AI', 'Sports'] // NEW
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
      status: 'approved',
      college_id: '2', // MIT Thandavapura
      registration_fee: 50,
      max_capacity: 500,
      registration_count: 120
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
      status: 'approved',
      college_id: '2',
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
      college_id: '2',
      registration_fee: 100,
      max_capacity: 500,
      registration_count: 3
    },
    {
      id: 'e4',
      title: 'Dancing Competition',
      date: '2024-04-28',
      venue: 'Auditorium Hall',
      venue_id: 'v1',
      category: 'Cultural',
      requested_by: 'hod1',
      requester_name: 'Department HOD',
      status: 'approved',
      college_id: '2',
      registration_fee: 30,
      max_capacity: 100,
      registration_count: 25
    },
    {
      id: 'e5',
      title: 'AI/ML Workshop',
      date: '2024-05-02',
      venue: 'Computer Lab 1',
      venue_id: 'v2',
      category: 'Technical',
      requested_by: 'hod1',
      requester_name: 'Department HOD',
      status: 'approved',
      college_id: '2',
      registration_fee: 0,
      max_capacity: 50,
      registration_count: 35
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
      'e1': 120,
      'e2': 45,
      'e3': 3,
      'e4': 25,
      'e5': 35
    };
    setRegCounts(counts);
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
    return { error: 'Invalid credentials. Use demo accounts: hod@campus.com or student@campus.com with pass ending in 123.' };
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
      requested_by: user?.id || '',
      requester_name: user?.fullName || '',
      college_id: user?.college_id || '1',
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

  const registerForEvent = async (eventId: string, phone: string, semester: string, paymentStatus: string) => {
    if (!user || user.role !== 'student') return { registrationId: null };
    const newReg: Registration = {
      id: 'reg' + Date.now(),
      event_id: eventId,
      student_id: user.id,
      phone,
      semester,
      is_coordinator: false,
      attendance_status: 'pending' as const
    };
    setRegistrations(prev => [...prev, newReg]);
    setRegCounts(prev => ({ 
      ...prev, 
      [eventId]: (prev[eventId] || 0) + 1 
    }));
    return { registrationId: newReg.id };
  };

  // NEW FUNCTIONS
  const getRegistrationsForEvent = (eventId: string): Registration[] => 
    registrations.filter(r => r.event_id === eventId);

  const toggleCoordinator = (regId: string) => {
    setRegistrations(prev => prev.map(r => 
      r.id === regId ? { ...r, is_coordinator: !r.is_coordinator } : r
    ));
  };

  const updateAttendance = (regId: string, status: 'pending' | 'present' | 'absent') => {
    setRegistrations(prev => prev.map(r => 
      r.id === regId ? { ...r, attendance_status: status } : r
    ));
  };

  const isRegistered = (eventId: string) => 
    registrations.some(r => r.event_id === eventId && r.student_id === user?.id);

  const getRegistrationCount = (eventId: string) => 
    registrations.filter(r => r.event_id === eventId).length;

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
        registrations, registerForEvent, isRegistered, getRegistrationCount, 
        getRegistrationsForEvent, toggleCoordinator, updateAttendance, // NEW
        resetPassword,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

