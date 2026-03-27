import { useState } from "react";
import { useApp } from "@/context/FakeAppContext";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

const CATEGORIES = ["Technical", "Cultural", "Sports"];

const statusConfig = {
  pending: { label: "Pending", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
  approved: { label: "Approved", icon: CheckCircle2, className: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const HODDashboard = () => {
  const { user, events, venues, addEvent } = useApp();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [venueId, setVenueId] = useState("");
  const [category, setCategory] = useState("");
  const [fee, setFee] = useState("0");
  const [maxCapacity, setMaxCapacity] = useState("100");
  const [externalLink, setExternalLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const myEvents = events.filter((e) => e.requested_by === user?.id);

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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-extrabold text-primary mb-8 animate-fade-in">HOD Dashboard</h2>

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
                <Select value={venueId} onValueChange={setVenueId}>
                  <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                  <SelectContent>
                    {venues.length === 0 ? (
                      <SelectItem value="none" disabled>No venues available</SelectItem>
                    ) : (
                      venues.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} (Cap: {v.capacity})</SelectItem>)
                    )}
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
                <Input type="number" min="0" step="0.01" placeholder="0 for free" value={fee} onChange={(e) => setFee(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Student Capacity</Label>
                <Input type="number" min="1" placeholder="100" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>External Link (optional)</Label>
                <Input placeholder="https://..." value={externalLink} onChange={(e) => setExternalLink(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow" disabled={submitting || !title || !date || !venueId || !category}>
                  {submitting ? "Submitting..." : "Submit Event Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <h3 className="text-xl font-bold text-foreground mb-4 animate-fade-in-delay-2">My Submitted Events</h3>
        {myEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No events submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {myEvents.map((event, i) => {
              const s = statusConfig[event.status];
              const Icon = s.icon;
              return (
                <Card key={event.id} className="shadow-sm border-0 animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-semibold text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.date} · {event.venue} · {event.category}
                        {event.registration_fee > 0 ? ` · $${event.registration_fee}` : " · Free"}
                      </p>
                    </div>
                    <Badge variant="outline" className={s.className}>
                      <Icon className="w-3.5 h-3.5 mr-1" />{s.label}
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
