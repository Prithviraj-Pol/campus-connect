import { useApp } from "@/context/AppContext";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, CheckCircle2, XCircle, Inbox } from "lucide-react";

const AdminDashboard = () => {
  const { events, updateEventStatus } = useApp();
  const { toast } = useToast();

  const pendingEvents = events.filter((e) => e.status === "pending");

  const handleAction = (id: string, status: "approved" | "rejected", title: string) => {
    updateEventStatus(id, status);
    toast({
      title: status === "approved" ? "✅ Event Approved" : "❌ Event Rejected",
      description: `"${title}" has been ${status}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-extrabold text-primary mb-8 animate-fade-in flex items-center gap-3">
          <ShieldCheck className="w-8 h-8" /> Admin Dashboard
        </h2>

        <Card className="shadow-lg border-0 animate-fade-in-delay-1">
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
                        <TableCell>{event.requested_by}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              className="bg-success text-success-foreground hover:bg-success/90"
                              onClick={() => handleAction(event.id, "approved", event.title)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-destructive text-destructive hover:bg-destructive/10"
                              onClick={() => handleAction(event.id, "rejected", event.title)}
                            >
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
      </div>
    </div>
  );
};

export default AdminDashboard;
