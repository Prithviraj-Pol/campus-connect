import { useState } from "react";
import { useApp } from "@/context/FakeAppContext";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Clock, CheckCircle2, XCircle, Users, Eye } from "lucide-react";
import AttendanceTracker from "@/components/AttendanceTracker";

const CATEGORIES = ["Technical", "Cultural", "Sports"];

const statusConfig = {
  pending: { label: "Pending", icon: Clock, className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  approved: { label: "Approved", icon: CheckCircle2, className: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-red-100 text-red-800 border-red-200" },
};

const HODDashboard = () => {
  const { user, events, venues, addEvent, getRegistrationsForEvent, toggleCoordinator, updateAttendance, getRegistrationCount } = useApp();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [venueId, setVenueId] = useState("");
  const [category, setCategory] = useState("");
  const [fee, setFee] = useState("0");
  const [maxCapacity, setMaxCapacity] = useState("100");
  const [externalLink, setExternalLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null); // NEW for Manage dialog

  const myEvents = events.filter((e) => e.requested_by === user?.id);
  const approvedEvents = events.filter((e) => e.status === "approved" && e.college_id === user?.college_id); // NEW: college filter

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !venueId || !category) return;
    setSubmitting(true);
    const result = await addEvent({
      title,
      date,
      venue_id: venueId,
      category,
      registration_fee: parseFloat(fee) || 0,
      max_capacity: parseInt(maxCapacity) || 100,
      external_link: externalLink || undefined,
    });
    setSubmitting(false);
    if (result.success) {
      toast({ title: "✅ Success", description: result.message });
      setTitle(""); setDate(""); setVenueId(""); setCategory("");
      setFee("0"); setMaxCapacity("100"); setExternalLink("");
    } else {
      toast({ title: "⚠️ Conflict Detected", description: result.message, variant: "destructive" });
    }
  };

  const handleViewRegistrations = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const getStudentName = (studentId: string) => {
    // Simple lookup from FAKE_USERS - enhance later
    return "John Student"; // Stub, map properly in full impl
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white"> {/* 60% soft white */}
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* NEW: Profile Header */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 mb-10">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-black text-[#1E3A8A] flex items-center gap-3"> {/* Royal Blue */}
              👨‍🏫 HOD Dashboard
            </CardTitle>
            <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg border-0 font-semibold">
              {user?.college_name} | {user?.department} Dept
            </Badge>
          </CardHeader>
        </Card>

        {/* Event Request Form */}
        <Card className="shadow-2xl border-0 mb-12 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1E3A8A]">
              <PlusCircle className="w-6 h-6" /> Request New Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
              {/* ... existing form fields unchanged ... */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" placeholder="e.g. Annual Tech Fest" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Venue</Label>
                <Select value={venueId} onValueChange={setVenueId}>
                  <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                  <SelectContent>
                    {venues.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} (Cap: {v.capacity})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Registration Fee ($)</Label>
                <Input type="number" min="0" placeholder="0 for free" value={fee} onChange={(e) => setFee(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Capacity</Label>
                <Input type="number" min="1" placeholder="100" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>External Link (optional)</Label>
                <Input placeholder="https://..." value={externalLink} onChange={(e) => setExternalLink(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Event Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* My Submitted Events - unchanged */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-[#1E3A8A] mb-6">📋 My Submitted Events</h3>
          {myEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-12 text-lg">No events submitted yet.</p>
          ) : (
            <div className="grid gap-4">
              {myEvents.map((event, i) => {
                const s = statusConfig[event.status as keyof typeof statusConfig];
                const Icon = s.icon;
                return (
                  <Card key={event.id} className="shadow-lg hover:shadow-xl transition-all border-0 bg-white">
                    <CardContent className="py-6 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xl text-[#1E3A8A]">{event.title}</h4>
                        <p className="text-gray-600 mt-1">{event.date} • {event.venue} • {event.category} • ${event.registration_fee}</p>
                      </div>
                      <Badge className={`font-semibold ${s.className}`}>
                        <Icon className="w-4 h-4 mr-1" />{s.label}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* NEW: Manage Events Section */}
        <section>
          <h3 className="text-2xl font-bold text-[#1E3A8A] mb-6 flex items-center gap-3">
            <Users className="w-8 h-8" /> Manage Events (Approved)
          </h3>
          {approvedEvents.length === 0 ? (
            <Card className="bg-white text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No approved events for your college yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedEvents.map((event) => (
                <Card key={event.id} className="shadow-lg border-0 bg-white hover:shadow-xl transition-all">
                  <CardContent className="py-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-[#1E3A8A] mb-1">{event.title}</h4>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <span>📅 {event.date}</span>
                          <span>📍 {event.venue}</span>
                          <span>🏷️ {event.category}</span>
                          <Badge className="bg-green-100 text-green-800">{getRegistrationCount(event.id)} registered</Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleViewRegistrations(event.id)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> View Registrations
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* NEW: Registrations Dialog */}
      <Dialog open={!!selectedEventId} onOpenChange={() => setSelectedEventId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-slate-50 to-white">
            <DialogTitle className="text-2xl font-bold text-[#1E3A8A]">Event Registrations</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            {selectedEventId && (
              <AttendanceTracker 
                eventId={selectedEventId} 
                onClose={() => setSelectedEventId(null)} 
              />
            )}
            <Button 
              onClick={() => setSelectedEventId(null)}
              className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HODDashboard;
