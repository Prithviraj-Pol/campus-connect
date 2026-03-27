import { useState } from "react";
import { useApp } from "@/context/AppContext";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

const VENUES = ["Main Auditorium", "Seminar Hall A", "Seminar Hall B", "Open Ground", "Computer Lab 1", "Library Hall"];
const CATEGORIES = ["Technical", "Cultural", "Sports"];

const statusConfig = {
  pending: { label: "Pending", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
  approved: { label: "Approved", icon: CheckCircle2, className: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const HODDashboard = () => {
  const { currentUser, events, addEvent } = useApp();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [category, setCategory] = useState("");

  const myEvents = events.filter((e) => e.requested_by === currentUser?.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !venue || !category || !currentUser) return;

    const result = addEvent({ title, date, venue, category, requested_by: currentUser.name });
    if (result.success) {
      toast({ title: "✅ Success", description: result.message });
      setTitle("");
      setDate("");
      setVenue("");
      setCategory("");
    } else {
      toast({ title: "⚠️ Conflict Detected", description: result.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-extrabold text-primary mb-8 animate-fade-in">
          HOD Dashboard
        </h2>

        {/* Request Form */}
        <Card className="shadow-lg border-0 mb-10 animate-fade-in-delay-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <PlusCircle className="w-5 h-5" /> Request New Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
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
                <Select value={venue} onValueChange={setVenue}>
                  <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                  <SelectContent>
                    {VENUES.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow hover:shadow-md transition-all hover:-translate-y-0.5"
                  disabled={!title || !date || !venue || !category}
                >
                  Submit Event Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* My Events */}
        <h3 className="text-xl font-bold text-foreground mb-4 animate-fade-in-delay-2">My Submitted Events</h3>
        {myEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No events submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {myEvents.map((event, i) => {
              const s = statusConfig[event.status];
              const Icon = s.icon;
              return (
                <Card
                  key={event.id}
                  className="shadow-sm border-0 animate-fade-in"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-semibold text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.date} · {event.venue} · {event.category}
                      </p>
                    </div>
                    <Badge variant="outline" className={s.className}>
                      <Icon className="w-3.5 h-3.5 mr-1" />
                      {s.label}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HODDashboard;
