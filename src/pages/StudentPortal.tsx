import { useState } from "react";
import { useApp } from "@/context/FakeAppContext";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, Tag, CheckCircle2, PartyPopper, DollarSign, Users, Star, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AttendanceTracker from "@/components/AttendanceTracker";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Technical", "Cultural", "Sports"];

const StudentPortal = () => {
  const { user, events, registerForEvent, isRegistered, getRegistrationCount, getRegistrationsForEvent } = useApp();
  const { toast } = useToast();
  const [filter, setFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [semester, setSemester] = useState("");
  const [registering, setRegistering] = useState(false);
  const [coordinatorEventId, setCoordinatorEventId] = useState<string | null>(null);

  // NEW: Split logic for personalization
  const approvedEvents = events.filter(e => e.status === "approved" && (filter === "All" || e.category === filter));
  const recommendedEvents = approvedEvents.filter(e => 
    user?.interests && user.interests.some((interest: string) => interest === e.category)
  );
  const otherEvents = approvedEvents.filter(e => 
    !recommendedEvents.some(r => r.id === e.id)
  );

  const userRegistrations = getRegistrationsForEvent('e3').filter((r: any) => r.student_id === user?.id); // Pre-set r1 for student1
  const isCoordinatorForEvent = (eventId: string) => 
    userRegistrations.some((r: any) => r.event_id === eventId && r.student_id === user?.id && r.is_coordinator);

  const handleRegister = async () => {
    if (!selectedEvent || !phone || !semester) return;
    setRegistering(true);
    const paymentStatus = selectedEvent.registration_fee > 0 ? "completed" : "completed";
    const { registrationId } = await registerForEvent(selectedEvent.id, phone, semester, paymentStatus);
    setRegistering(false);
    if (registrationId) {
      toast({
        title: "🎉 Registration Successful!",
        description: `Registration ID: ${registrationId.slice(0, 8).toUpperCase()}`,
      });
    } else {
      toast({ title: "Registration failed", description: "Please try again.", variant: "destructive" });
    }
    setSelectedEvent(null);
    setPhone("");
    setSemester("");
  };

  const openCoordinatorTools = (eventId: string) => {
    setCoordinatorEventId(eventId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/80 to-white"> {/* Soft white */}
      <AppHeader />
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-black bg-gradient-to-r from-[#1E3A8A] to-blue-800 bg-clip-text text-transparent mb-4 leading-tight">
            Welcome back, {user?.fullName}! 🚀
          </h2> {/* Royal Blue */}
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Personalized events based on your interests in {user?.interests?.join(', ')}. 
            {user?.interests && isCoordinatorForEvent('e3') && (
              <Badge className="ml-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-4 py-1 mt-1 inline-block">
                🏅 Student Coordinator
              </Badge>
            )}
          </p>
        </div>

        {/* NEW: Recommended Section */}
        {recommendedEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl border border-orange-200">
              <Star className="w-8 h-8 text-orange-500 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-[#1E3A8A]">⭐ Recommended for You</h3>
                <p className="text-orange-700 font-medium">Events matching your interests: {user?.interests?.slice(0,2).join(', ')}{user?.interests && user.interests.length > 2 ? ' +' : ''}</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedEvents.slice(0, 6).map((event, i) => ( // Top 6
                <EventCard 
                  key={event.id} 
                  event={event} 
                  registered={isRegistered(event.id)}
                  seatsLeft={event.max_capacity - getRegistrationCount(event.id)}
                  onRegister={() => setSelectedEvent(event)}
                  isCoordinator={isCoordinatorForEvent(event.id)}
                  onCoordinatorTools={() => openCoordinatorTools(event.id)}
                  i={i}
                />
              ))}
            </div>
          </section>
        )}

        {/* Filter & Upcoming */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-[#1E3A8A]">📅 Upcoming Events</h3>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44 border-orange-200 focus:ring-orange-500"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {otherEvents.length === 0 && recommendedEvents.length === 0 ? (
          <div className="text-center py-20">
            <PartyPopper className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h4 className="text-2xl font-bold text-slate-600 mb-2">No events yet!</h4>
            <p className="text-slate-500 text-lg max-w-md mx-auto">Check back soon for exciting campus events. Your recommendations will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherEvents.map((event, i) => (
              <EventCard 
                key={event.id} 
                event={event} 
                registered={isRegistered(event.id)}
                seatsLeft={event.max_capacity - getRegistrationCount(event.id)}
                onRegister={() => setSelectedEvent(event)}
                isCoordinator={isCoordinatorForEvent(event.id)}
                onCoordinatorTools={() => openCoordinatorTools(event.id)}
                i={recommendedEvents.length + i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Registration Dialog - unchanged */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1E3A8A] font-bold">Register for {selectedEvent?.title}</DialogTitle>
            <DialogDescription>{selectedEvent?.date} • {selectedEvent?.venue}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
              <p className="font-semibold text-[#1E3A8A]">
                Fee: {selectedEvent?.registration_fee > 0 ? `$${selectedEvent.registration_fee}` : <Badge className="bg-green-100 text-green-800 ml-2">FREE</Badge>}
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit phone" />
              </div>
              <div>
                <Label>Semester</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-xl font-bold text-white" 
                onClick={handleRegister}
                disabled={registering || !phone || !semester}
              >
                {registering ? "Processing..." : "Confirm & Register"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* NEW: Coordinator Tools Dialog */}
      <Dialog open={!!coordinatorEventId} onOpenChange={(open) => !open && setCoordinatorEventId(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
          <DialogHeader className="flex-none p-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-[#1E3A8A]">🛠️ Coordinator Tools</DialogTitle>
            <p className="text-slate-600">Manage attendance for your event</p>
          </DialogHeader>
          {coordinatorEventId && (
            <div className="flex-1 overflow-auto p-6">
              <AttendanceTracker eventId={coordinatorEventId} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// NEW: Reusable EventCard component
interface EventCardProps {
  event: any;
  registered: boolean;
  seatsLeft: number;
  onRegister: () => void;
  isCoordinator: boolean;
  onCoordinatorTools: () => void;
  i: number;
}

const EventCard: React.FC<EventCardProps> = ({ event, registered, seatsLeft, onRegister, isCoordinator, onCoordinatorTools, i }) => (
  <Card className={cn(
    "group shadow-lg hover:shadow-2xl border-0 overflow-hidden transform hover:-translate-y-2 transition-all duration-300 bg-white",
    isCoordinator && "ring-4 ring-orange-200 ring-opacity-50 shadow-orange-200/50"
  )} style={{ animationDelay: `${i * 0.06}s` }}>
    <CardHeader className="pb-4 pt-6 px-6">
      <div className="flex items-start justify-between mb-2">
        <CardTitle className="text-xl font-bold text-[#1E3A8A] leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">
          {event.title}
        </CardTitle>
        <Badge className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-700 border-orange-200 font-semibold px-3 py-1 mt-1 whitespace-nowrap">
          {event.category}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="px-6 pb-6 space-y-4 text-sm">
      <div className="flex items-center gap-3 text-slate-600 py-1">
        <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
        <span className="font-medium">{event.date}</span>
      </div>
      <div className="flex items-center gap-3 text-slate-600 py-1">
        <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
        <span>{event.venue}</span>
      </div>
      <div className="flex items-center gap-3 text-slate-600 py-1 text-xs">
        <Tag className="w-4 h-4 text-orange-500 flex-shrink-0" />
        <span>Hosted by {event.requester_name}</span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-orange-500" />
          {event.registration_fee > 0 ? (
            <span className="font-bold text-lg text-[#1E3A8A]">${event.registration_fee}</span>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1">FREE</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Users className="w-4 h-4" />
          <span>{seatsLeft > 0 ? `${seatsLeft} spots` : "Sold Out"}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4">
        {registered ? (
          <Button disabled className="w-full bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold shadow-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Registered ✓
          </Button>
        ) : seatsLeft <= 0 ? (
          <Button disabled className="w-full bg-slate-100 text-slate-500 border-slate-200" variant="outline">
            Sold Out
          </Button>
        ) : (
          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all group-hover:shadow-orange-500/25" 
            onClick={onRegister}
          >
            Register Now
          </Button>
        )}
        
        {/* NEW: Coordinator Button */}
        {isCoordinator && (
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 hover:bg-orange-50 text-orange-700 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              Coordinator Tools
            </Button>
          </DialogTrigger>
        )}
      </div>
    </CardContent>
  </Card>
);

export default StudentPortal;

