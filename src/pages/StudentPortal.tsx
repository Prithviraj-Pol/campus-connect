import { useState } from "react";
import { useApp } from "@/context/AppContext";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, MapPin, Tag, CheckCircle2, PartyPopper, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["All", "Technical", "Cultural", "Sports"];

const StudentPortal = () => {
  const { user, events, registerForEvent, isRegistered, getRegistrationCount } = useApp();
  const { toast } = useToast();
  const [filter, setFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);
  const [phone, setPhone] = useState("");
  const [semester, setSemester] = useState("");
  const [registering, setRegistering] = useState(false);

  const approvedEvents = events.filter(
    (e) => e.status === "approved" && (filter === "All" || e.category === filter)
  );

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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-primary mb-2">
            Welcome, {user?.fullName}! 🎉
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover and register for upcoming campus events.
          </p>
        </div>

        <div className="flex items-center justify-between mb-8 animate-fade-in-delay-1">
          <h3 className="text-xl font-bold text-foreground">Upcoming Events</h3>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {approvedEvents.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-delay-2">
            <PartyPopper className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No approved events yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {approvedEvents.map((event, i) => {
              const registered = isRegistered(event.id);
              const regCount = getRegistrationCount(event.id);
              const seatsLeft = event.max_capacity - regCount;
              return (
                <Card key={event.id} className="shadow-md hover:shadow-lg transition-all border-0 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold text-primary leading-tight">{event.title}</CardTitle>
                      <Badge variant="secondary" className="shrink-0 ml-2">{event.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" /><span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" /><span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="w-4 h-4" /><span>By {event.requester_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {event.registration_fee > 0 ? (
                          <span className="font-semibold">${event.registration_fee}</span>
                        ) : (
                          <Badge className="bg-success/20 text-success border-0 text-xs">FREE</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{seatsLeft > 0 ? `${seatsLeft} seats left` : "Full"}</span>
                      </div>
                    </div>
                    {registered ? (
                      <Button disabled className="w-full bg-success text-success-foreground">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Registered
                      </Button>
                    ) : seatsLeft <= 0 ? (
                      <Button disabled className="w-full" variant="outline">Full</Button>
                    ) : (
                      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow hover:shadow-md transition-all hover:-translate-y-0.5" onClick={() => setSelectedEvent(event)}>
                        Register Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Register for Event</DialogTitle>
            <DialogDescription>
              {selectedEvent?.title} — {selectedEvent?.date} at {selectedEvent?.venue}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm font-medium">
                Fee: {selectedEvent && selectedEvent.registration_fee > 0
                  ? <span className="text-accent font-bold">${selectedEvent.registration_fee}</span>
                  : <Badge className="bg-success/20 text-success border-0">FREE</Badge>
                }
              </p>
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input placeholder="Your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow"
              onClick={handleRegister}
              disabled={registering || !phone || !semester}
            >
              {registering ? "Processing..." : selectedEvent && selectedEvent.registration_fee > 0 ? "Pay Now & Register" : "Confirm Registration"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentPortal;
