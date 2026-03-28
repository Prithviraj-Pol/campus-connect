import { useState, useMemo } from "react";
import { useApp } from "@/context/FakeAppContext";
import AdminHeader from "@/components/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Trash2, Calendar, MapPin, Users, Inbox, Building2, PlusCircle, Bell } from "lucide-react";


const AdminDashboard = () => {
  const { user, globalCollegeName, loading: appLoading, events, venues, regCounts, updateEventStatus, addVenue, deleteVenue, updateUserCollegeName } = useApp();
  const { toast } = useToast();

  if (appLoading) {
    return (
      <div className="min-h-screen bg-adminWhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-adminBlue" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null; // Will be handled by React Router or redirect
  }

  const [venueName, setVenueName] = useState("");
  const [venueCapacity, setVenueCapacity] = useState("");
  const [addingVenue, setAddingVenue] = useState(false);

  const pendingEvents = events.filter((e: any) => e.status === "pending");

  const totalStudentsRegistered = useMemo((): number => {
    try {
      return Object.values((regCounts as Record<string, any>) || {}).reduce((sum: number, count: any) => sum + Number(count), 0);
    } catch {
      return 0;
    }
  }, [regCounts]);

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
    <div className="min-h-screen bg-adminWhite">
<AdminHeader />
      <NotificationBoard />
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/60 backdrop-blur-sm shadow-xl border-adminBlue/20 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 text-adminBlue">
                <Calendar className="w-6 h-6" />
                <CardTitle className="text-xl font-bold">{pendingEvents.length}</CardTitle>
              </div>
              <CardDescription className="text-adminBlue/70 font-medium">Pending Approvals</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/60 backdrop-blur-sm shadow-xl border-adminBlue/20 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 text-adminBlue">
                <MapPin className="w-6 h-6" />
                <CardTitle className="text-xl font-bold">{venues.length}</CardTitle>
              </div>
              <CardDescription className="text-adminBlue/70 font-medium">Total Venues</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/60 backdrop-blur-sm shadow-xl border-adminBlue/20 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 text-adminBlue">
                <Users className="w-6 h-6" />
                <CardTitle className="text-xl font-bold">{totalStudentsRegistered}</CardTitle>
              </div>
              <CardDescription className="text-adminBlue/70 font-medium">Total Students Registered</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="animate-fade-in-delay-1">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-adminBlue/10 border-adminBlue/20">
            <TabsTrigger value="pending" className="data-[state=active]:bg-adminBlue data-[state=active]:text-white data-[state=active]:shadow-md">Pending Events</TabsTrigger>
            <TabsTrigger value="venues" className="data-[state=active]:bg-adminBlue data-[state=active]:text-white data-[state=active]:shadow-md">Manage Venues</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-adminBlue data-[state=active]:text-white data-[state=active]:shadow-md">Platform Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-adminBlue flex items-center gap-2">Pending Events</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingEvents.length === 0 ? (
                  <div className="text-center py-16">
                    <Inbox className="w-12 h-12 text-adminBlue/40 mx-auto mb-4" />
                    <p className="text-adminBlue/60 text-lg">No pending requests. All caught up!</p>
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-adminBlue/5">
                          <TableHead className="font-semibold text-adminBlue">Title</TableHead>
                          <TableHead className="font-semibold text-adminBlue">HOD</TableHead>
                          <TableHead className="font-semibold text-adminBlue">Date</TableHead>
                          <TableHead className="font-semibold text-adminBlue">Venue</TableHead>
                          <TableHead className="font-semibold text-right text-adminBlue">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingEvents.map((event: any) => (
                          <TableRow key={event.id} className="hover:bg-adminBlue/10 transition-colors">
                            <TableCell className="font-medium">{event.title}</TableCell>
                            <TableCell>{event.requester_name}</TableCell>
                            <TableCell>{event.date}</TableCell>
                            <TableCell>{event.venue}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white font-semibold" onClick={() => handleAction(event.id, "approved", event.title)}>
                                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50 font-semibold" onClick={() => handleAction(event.id, "rejected", event.title)}>
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
                <CardTitle className="flex items-center gap-2 text-adminBlue">
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
                    <Label>Max Capacity</Label>
                    <Input type="number" placeholder="200" value={venueCapacity} onChange={(e) => setVenueCapacity(e.target.value)} required />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full bg-adminOrange hover:bg-adminOrange/90 text-adminOrangeFg font-semibold shadow-lg hover:shadow-xl transition-all" disabled={addingVenue || !venueName || !venueCapacity}>
                      {addingVenue ? "Adding..." : "Add Venue"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-adminBlue">
                  <Building2 className="w-5 h-5" /> Existing Venues
                </CardTitle>
              </CardHeader>

          <TabsContent value="settings">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-adminBlue flex items-center gap-2">
                  <Building2 className="w-5 h-5" /> Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="max-w-md space-y-6">
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold text-adminBlue">College Name</Label>
                    <p className="text-sm text-adminBlue/70 mb-4">Current: <span className="font-bold text-orange-600">{globalCollegeName || 'Campus College'}</span></p>
                    <div className="space-y-2">
                      <Input 
                        placeholder="e.g. MIT Mysore" 
                        defaultValue={globalCollegeName}
                        className="text-lg py-6 border-2 border-adminBlue/30 focus:border-orange-500 focus:ring-orange-500"
                      />
                      <Button 
                        onClick={() => {
                          const newName = prompt('Enter new college name:') || globalCollegeName;
                          updateUserCollegeName(newName);
                          toast({ title: 'College Name Updated!', description: `Platform now uses "${newName}".` });
                        }}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-xl"
                      >
                        Update College Name
                      </Button>
                    </div>
                    <p className="text-xs text-adminBlue/60 mt-4">
                      Changes apply globally across the tenant.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
              <CardContent>
                {venues.length === 0 ? (
                  <p className="text-adminBlue/60 text-center py-10">No venues yet. Add one above!</p>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-adminBlue/5">
                          <TableHead className="font-semibold text-adminBlue">Venue Name</TableHead>
                          <TableHead className="font-semibold text-adminBlue">Max Capacity</TableHead>
                          <TableHead className="font-semibold text-right text-adminBlue">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {venues.map((v: any) => (
                          <TableRow key={v.id} className="hover:bg-adminBlue/10">
                            <TableCell className="font-medium">{v.name}</TableCell>
                            <TableCell>{v.capacity}</TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" className="border-adminOrange/50 text-adminOrange hover:bg-adminOrange/10 font-semibold" onClick={() => handleDeleteVenue(v.id, v.name)}>
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
