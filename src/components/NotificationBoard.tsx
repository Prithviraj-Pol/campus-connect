import React, { useState } from 'react';
import { useApp } from '@/context/FakeAppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Bell, FileText, Link2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  sender_id: string;
  audience: 'all' | 'students' | 'hods';
  title: string;
  message: string;
  external_link?: string;
  timestamp: string;
}

const NotificationBoard: React.FC = () => {
  const { user, notifications, postNotification, getNotifications } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');

  const handlePost = async () => {
    if (!title || !message) return;
    await postNotification({
      audience: 'all',
      title,
      message,
      external_link: link || undefined
    });
    toast({ title: 'Notification Posted!', description: 'Broadcast to all users.' });
    setTitle('');
    setMessage('');
    setLink('');
    setOpen(false);
  };

  const userNotifications = getNotifications('all'); // Filtered internally

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const canPost = user?.role === 'admin' || user?.role === 'hod';

  return (
    <Card className="bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all border-royalBlue/20 max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-orange-500" />
          <CardTitle className="text-xl font-bold text-royalBlue flex items-center gap-2">
            📢 Notification Hub
          </CardTitle>
          {canPost && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="ml-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post Circular
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-royalBlue font-bold">Post New Notification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-royalBlue mb-1 block">Title</label>
                    <Input 
                      placeholder="e.g. Tech Fest Registration Open" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-royalBlue mb-1 block">Message</label>
                    <Textarea 
                      placeholder="Enter notification message..." 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-royalBlue mb-1 block">Google Form Link (optional)</label>
                    <Input 
                      placeholder="https://forms.gle/..." 
                      value={link} 
                      onChange={(e) => setLink(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button 
                      onClick={handlePost}
                      disabled={!title || !message}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Broadcast
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {userNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No notifications yet.</p>
            <p className="text-gray-400 text-sm mt-1">Stay tuned for campus updates!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userNotifications.slice(0, 5).map((notif) => (
              <div key={notif.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-royalBlue text-lg line-clamp-1">{notif.title}</h4>
                  <Badge variant="outline" className="text-xs px-2 py-1 text-gray-600">
                    {formatTime(notif.timestamp)}
                  </Badge>
                </div>
                <p className="text-slate-700 mb-3 leading-relaxed">{notif.message}</p>
                {notif.external_link && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 flex items-center gap-1 text-sm font-medium"
                    asChild
                  >
                    <a href={notif.external_link} target="_blank" rel="noopener noreferrer">
                      <Link2 className="w-4 h-4" />
                      Open Google Form
                    </a>
                  </Button>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                  <FileText className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-xs text-slate-500 capitalize">
                    Audience: {notif.audience}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationBoard;

