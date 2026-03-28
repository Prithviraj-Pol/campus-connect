import { useState } from 'react';
import { useApp } from '@/context/FakeAppContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User, Phone, Calendar, Users, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceTrackerProps {
  eventId: string;
  onClose?: () => void;
}

interface ExtendedRegistration {
  id: string;
  studentName: string;
  phone: string | null;
  semester: string | null;
  is_coordinator: boolean;
  attendance_status: 'pending' | 'present' | 'absent';
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ eventId, onClose }) => {
  const { getRegistrationsForEvent, toggleCoordinator, updateAttendance, user } = useApp();
  const [regs] = useState(getRegistrationsForEvent(eventId));

  const handleToggleCoordinator = (regId: string) => {
    toggleCoordinator(regId);
  };

  const handleUpdateAttendance = (regId: string, status: 'present' | 'absent') => {
    updateAttendance(regId, status);
  };

  const presentCount = regs.filter(r => r.attendance_status === 'present').length;
  const absentCount = regs.filter(r => r.attendance_status === 'absent').length;
  const pendingCount = regs.filter(r => r.attendance_status === 'pending').length;
  const total = regs.length;
  const coordinatorCount = regs.filter(r => r.is_coordinator).length;

  const getStudentName = (studentId: string): string => {
    // Simple lookup - enhance with full users store later
    const names = {
      'student1': 'John Student (CS Sem 5)',
      'student2': 'Jane Doe (Mech Sem 3)',
      'student3': 'Bob Wilson (AIDS Sem 7)'
    };
    return names[studentId as keyof typeof names] || 'Unknown Student';
  };

  const extendedRegs: ExtendedRegistration[] = regs.map(reg => ({
    ...reg,
    studentName: getStudentName(reg.student_id)
  }));

  return (
    <div className="w-full max-w-6xl mx-auto p-1 bg-gradient-to-br from-slate-50/50 to-white/80 min-h-[500px]">
      {/* Summary Header */}
      <Card className="mb-6 border-0 shadow-lg bg-white/60 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-2xl font-black text-[#1E3A8A] flex items-center gap-3">
              <Users className="w-8 h-8" />
              Attendance Tracker
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-orange-500/20 text-orange-700 border-orange-200 font-mono text-sm px-3 py-1">
                Total: {total}
              </Badge>
              <Badge className="bg-green-500/20 text-green-700 border-green-200 font-mono text-sm px-3 py-1">
                <CheckCircle2 className="w-3 h-3 mr-1" />Present: {presentCount}
              </Badge>
              <Badge className="bg-red-500/20 text-red-700 border-red-200 font-mono text-sm px-3 py-1">
                <XCircle className="w-3 h-3 mr-1" />Absent: {absentCount}
              </Badge>
              <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-200 font-mono text-sm px-3 py-1">
                Pending: {pendingCount}
              </Badge>
              {coordinatorCount > 0 && (
                <Badge className="bg-purple-500/20 text-purple-700 border-purple-200 font-mono text-sm px-3 py-1">
                  Coordinator: {coordinatorCount}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Responsive Data Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
              <TableHead className="w-48 font-bold text-[#1E3A8A] text-left">Student</TableHead>
              <TableHead className="w-32 font-bold text-[#1E3A8A]">Phone</TableHead>
              <TableHead className="w-24 font-bold text-[#1E3A8A]">Semester</TableHead>
              <TableHead className="w-32 font-bold text-[#1E3A8A] text-center">Coordinator</TableHead>
              <TableHead className="w-32 font-bold text-[#1E3A8A] text-center">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {extendedRegs.map((reg) => (
              <TableRow key={reg.id} className="hover:bg-orange-50/50 border-b border-slate-100 transition-colors">
                <TableCell className="font-medium text-slate-800 flex items-center gap-2 py-4">
                  <User className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{reg.studentName}</span>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{reg.phone || '-'}</TableCell>
                <TableCell className="text-sm font-semibold text-[#1E3A8A]">{reg.semester || '-'}</TableCell>
                <TableCell className="text-center">
                  <Switch 
                    checked={reg.is_coordinator} 
                    onCheckedChange={() => handleToggleCoordinator(reg.id)}
                    className={cn(
                      "data-[state=checked]:bg-orange-500",
                      reg.is_coordinator && "data-[state=checked]:shadow-orange-300"
                    )}
                  />
                </TableCell>
                <TableCell className="text-center space-x-1">
                  <Button
                    variant={reg.attendance_status === 'present' ? "default" : "outline"}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white h-8 px-3 shadow-md border-0"
                    onClick={() => handleUpdateAttendance(reg.id, 'present')}
                    disabled={reg.attendance_status === 'present'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={reg.attendance_status === 'absent' ? "default" : "outline"}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white h-8 px-3 shadow-md border-0"
                    onClick={() => handleUpdateAttendance(reg.id, 'absent')}
                    disabled={reg.attendance_status === 'absent'}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {total === 0 && (
        <div className="text-center py-12 mt-8 border-2 border-dashed border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-1">No registrations yet</h4>
          <p className="text-gray-500">Students will appear here after registering.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-200">
        <Button 
          variant="outline" 
          className="flex-1 bg-gradient-to-r from-slate-50 to-white border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold shadow-sm"
          onClick={onClose}
        >
          Close Tracker
        </Button>
      </div>
    </div>
  );
};

export default AttendanceTracker;

