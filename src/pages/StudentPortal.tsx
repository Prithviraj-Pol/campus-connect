import { useState } from "react";
import { useApp } from "@/context/AppContext";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Tag, CheckCircle2, PartyPopper } from "lucide-react";

const CATEGORIES = ["All", "Technical", "Cultural", "Sports"];

const StudentPortal = () => {
  const { currentUser, events, registerForEvent, isRegistered } = useApp();
  const [filter, setFilter] = useState("All");

  const approvedEvents = events.filter(
    (e) => e.status === "approved" && (filter === "All" || e.category === filter)
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-primary mb-2">
            Welcome, {currentUser?.name}! 🎉
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover and register for upcoming campus events.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-delay-1">
          <h3 className="text-xl font-bold text-foreground">Upcoming Events</h3>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        {approvedEvents.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-delay-2">
            <PartyPopper className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No approved events yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {approvedEvents.map((event, i) => {
              const registered = isRegistered(event.id);
              return (
                <Card
                  key={event.id}
                  className="shadow-md hover:shadow-lg transition-all border-0 animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold text-primary leading-tight">
                        {event.title}
                      </CardTitle>
                      <Badge variant="secondary" className="shrink-0 ml-2">
                        {event.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="w-4 h-4" />
                      <span>By {event.requested_by}</span>
                    </div>
                    {registered ? (
                      <Button disabled className="w-full bg-success text-success-foreground">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Registered
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow hover:shadow-md transition-all hover:-translate-y-0.5"
                        onClick={() => registerForEvent(event.id)}
                      >
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
    </div>
  );
};

export default StudentPortal;
