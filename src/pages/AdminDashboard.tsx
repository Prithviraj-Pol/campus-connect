import { useState } from "react";
import { useApp } from "@/context/AppContext";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, CheckCircle2, XCircle, Inbox, Building2, PlusCircle, Trash2 } from "lucide-react";

const AdminDashboard = () => {
  const { events, venues, updateEventStatus, addVenue, deleteVenue } = useApp();
  const { toast } = useToast();

  const [venueName, setVenueName] = useState("");
  const [venueCapacity, setVenueCapacity] = useState("");
  const [addingVenue, setAddingVenue] = useState(false);

  const pendingEvents = events.filter((e) => e.status === "pending");

  const handleAction = async (id: string, status: "approved" | "rejected", title: string) => {
    await updateEventStatus(id, status);
    toast({
      title: status === "approved" ? "✅ Event Approved" : "❌ Event Rejected",
      description: `"${title}" has been ${status}.`,
    });
  };

  const handleAddVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueName || !venueCapacity) return;
    setAddingVenue(true);
    const result = await addVenue({ name: venueName, capacity: parseInt(venueCapacity), facilities: [] });
    setAddingVenue(false);
    if (result.success) {
      toast({ title: "✅ Venue Added", description: result.message });
      setVenueName("");
      setVenueCapacity("");
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleDeleteVenue = async (id: string, name: string) => {
    await deleteVenue(id);
    toast({ title: "Venue Deleted", description: `"${name}" has been removed.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-extrabold text-primary mb-8 animate-fade-in flex items-center gap-3">
          <ShieldCheck className="w-8 h-8" /> Admin Dashboard
        </h2>

        <Tabs defaultValue="pending" className="animate-fade-in-delay-1">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending">Pending Events</TabsTrigger>
            <TabsTrigger value="venues">Manage Venues</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-primary">Pending Event Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingEvents.length === 0 ? (
                  <div className="text-center py-16">
                    <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No pending requests. All caught up!</p>
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary">
                          <TableHead className="font-semibold">Title</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Venue</TableHead>
                          <TableHead className="font-semibold">Category</TableHead>
                          <TableHead className="font-semibold">Fee</TableHead>
                          <TableHead className="font-semibold">Capacity</TableHead>
                          <TableHead className="font-semibold">Requested By</TableHead>
                          <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingEvents.map((event) => (
                          <TableRow key={event.id} className="hover:bg-secondary/50">
                            <TableCell className="font-medium">{event.title}</TableCell>
                            <TableCell>{event.date}</TableCell>
                            <TableCell>{event.venue}</TableCell>
                            <TableCell>{event.category}</TableCell>
                            <TableCell>{event.registration_fee > 0 ? `$${event.registration_fee}` : "Free"}</TableCell>
                            <TableCell>{event.max_capacity}</TableCell>
                            <TableCell>{event.requester_name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => handleAction(event.id, "approved", event.title)}>
                                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleAction(event.id, "rejected", event.title)}>
                                  <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues">
            <Card className="shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <PlusCircle className="w-5 h-5" /> Add New Venue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddVenue} className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Venue Name</Label>
                    <Input placeholder="e.g. Main Auditorium" value={venueName} onChange={(e) => setVenueName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input type="number" placeholder="200" value={venueCapacity} onChange={(e) => setVenueCapacity(e.target.value)} required />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold" disabled={addingVenue || !venueName || !venueCapacity}>
                      {addingVenue ? "Adding..." : "Add Venue"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Building2 className="w-5 h-5" /> Your Venues
                </CardTitle>
              </CardHeader>
              <CardContent>
                {venues.length === 0 ? (
                  <p className="text-muted-foreground text-center py-10">No venues yet. Add one above!</p>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary">
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Capacity</TableHead>
                          <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {venues.map((v) => (
                          <TableRow key={v.id}>
                            <TableCell className="font-medium">{v.name}</TableCell>
                            <TableCell>{v.capacity}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleDeleteVenue(v.id, v.name)}>
                                <Trash2 className="w-4 h-4 mr-1" /> Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
