import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Clock, Video, Check, X,
  Send, Users, Sparkles
} from 'lucide-react';

interface MeetingRequest {
  id: string;
  title: string;
  date: string;
  time: string;
  requester: string;
  status: 'pending' | 'confirmed';
}

const MEETING_COLORS = [
  { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE', dot: '#8B5CF6' },
  { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE', dot: '#3B82F6' },
  { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0', dot: '#10B981' },
  { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A', dot: '#F59E0B' },
  { bg: '#FCE7F3', text: '#DB2777', border: '#FBCFE8', dot: '#EC4899' },
  { bg: '#E0E7FF', text: '#4338CA', border: '#C7D2FE', dot: '#6366F1' },
];

const getColor = (index: number) => MEETING_COLORS[index % MEETING_COLORS.length];

const MeetingScheduleCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'all'>('all');

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: '', time: '10:00', requester: '', date: '' });

  const [requests, setRequests] = useState<MeetingRequest[]>([
    { id: '101', title: 'Team Sync', date: '2025-01-06', time: '10:00 AM', requester: 'John Doe', status: 'confirmed' },
    { id: '102', title: 'Sales Meeting', date: '2025-01-08', time: '11:00 AM', requester: 'Sarah Smith', status: 'confirmed' },
    { id: '103', title: 'Investor Call', date: '2025-01-10', time: '02:00 PM', requester: 'Mike Johnson', status: 'confirmed' },
    { id: '104', title: 'Product Demo', date: '2025-01-12', time: '03:00 PM', requester: 'Emily Davis', status: 'pending' },
    { id: '105', title: 'Contract Review', date: '2025-01-15', time: '09:00 AM', requester: 'Alex Turner', status: 'confirmed' },
    { id: '106', title: 'Strategy Planning', date: '2025-01-18', time: '01:00 PM', requester: 'Lisa Chen', status: 'pending' },
    { id: '107', title: 'Design Review', date: '2025-01-20', time: '04:00 PM', requester: 'Tom Wilson', status: 'confirmed' },
    { id: '108', title: 'Quarterly Review', date: '2025-01-22', time: '10:30 AM', requester: 'Rachel Kim', status: 'pending' },
  ]);

  const toDateString = (date: Date) => date.toISOString().split('T')[0];
  const getMeetingsForDate = (date: Date) => requests.filter(r => r.date === toDateString(date));

  const handleJoinCall = (meetingId: string) => {
    const meeting = requests.find(r => r.id === meetingId);
    if (meeting) {
      navigate('/video', { state: { meetingTitle: meeting.title, participantName: meeting.requester } });
    }
  };

  const handleStatClick = (tab: 'all' | 'confirmed' | 'pending') => {
    setActiveTab(tab);
    setTimeout(() => {
      document.getElementById('all-meetings-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleOpenScheduleModal = () => {
    setNewMeeting({ title: '', time: '10:00', requester: '', date: toDateString(selectedDate) });
    setIsScheduleModalOpen(true);
  };

  const handleCreateMeeting = () => {
    if (!newMeeting.title.trim() || !newMeeting.requester.trim() || !newMeeting.date) return;
    const [hourString, minuteString] = newMeeting.time.split(':');
    const hour = parseInt(hourString, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    const formattedTime = `${formattedHour}:${minuteString} ${ampm}`;
    setRequests([{
      id: Math.random().toString(36).substr(2, 9),
      title: newMeeting.title.trim(),
      date: newMeeting.date,
      time: formattedTime,
      requester: newMeeting.requester.trim(),
      status: 'pending'
    }, ...requests]);
    setIsScheduleModalOpen(false);
  };

  const handleAccept = (id: string) =>
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'confirmed' as const } : req));

  const handleDecline = (id: string) =>
    setRequests(prev => prev.filter(req => req.id !== id));

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const confirmedMeetings = requests.filter(r => r.status === 'confirmed');
  const selectedMeetings = getMeetingsForDate(selectedDate);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    const meetings = getMeetingsForDate(date);
    if (meetings.length === 0) return null;
    return (
      <div className="flex justify-center gap-0.5 mt-0.5">
        {meetings.slice(0, 3).map((m) => {
          const color = getColor(requests.indexOf(m));
          return <div key={m.id} className="w-1 h-1 rounded-full" style={{ backgroundColor: color.dot }} title={`${m.title} - ${m.time}`} />;
        })}
      </div>
    );
  };

  const filteredMeetings = activeTab === 'all' ? requests : activeTab === 'confirmed' ? confirmedMeetings : pendingRequests;

  const formatDateLong = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      {/* Schedule Meeting Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setIsScheduleModalOpen(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="text-white sm:hidden" />
                  <Sparkles size={18} className="text-white hidden sm:block" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Schedule New Meeting</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 ml-12 sm:ml-[52px]">Fill in the details below</p>
            </div>
            <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Meeting Title *</label>
                <input type="text" value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} placeholder="e.g. Investor Pitch..." className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" autoFocus />
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Meeting Date *</label>
                <input type="date" value={newMeeting.date} onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Meeting Time *</label>
                <input type="time" value={newMeeting.time} onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Participant Name *</label>
                <input type="text" value={newMeeting.requester} onChange={(e) => setNewMeeting({ ...newMeeting, requester: e.target.value })} placeholder="e.g. John Doe..." className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
              </div>
            </div>
            <div className="px-5 sm:px-7 py-4 sm:py-5 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button onClick={() => setIsScheduleModalOpen(false)} className="flex-1 px-4 py-2.5 sm:px-5 sm:py-3 bg-white border-2 border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-bold transition">Cancel</button>
              <button onClick={handleCreateMeeting} disabled={!newMeeting.title.trim() || !newMeeting.requester.trim() || !newMeeting.date} className="flex-1 px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-200/60 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2">
                <Send size={14} /> Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 sm:gap-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-3 sm:mb-4">Meeting Schedule</h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button onClick={() => handleStatClick('all')} className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer ${activeTab === 'all' ? 'bg-gray-800 text-white shadow-md scale-[1.03]' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md'}`}>
                  <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${activeTab === 'all' ? 'bg-white' : 'bg-gray-400'}`}></span>
                  {requests.length} Total
                </button>
                <button onClick={() => handleStatClick('confirmed')} className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer ${activeTab === 'confirmed' ? 'bg-green-600 text-white shadow-md scale-[1.03]' : 'bg-green-50 border border-green-200 text-green-700 hover:border-green-300 hover:shadow-md'}`}>
                  <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${activeTab === 'confirmed' ? 'bg-white' : 'bg-green-500'}`}></span>
                  {confirmedMeetings.length} Confirmed
                </button>
                <button onClick={() => handleStatClick('pending')} className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer ${activeTab === 'pending' ? 'bg-amber-500 text-white shadow-md scale-[1.03]' : 'bg-amber-50 border border-amber-200 text-amber-700 hover:border-amber-300 hover:shadow-md'}`}>
                  <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${activeTab === 'pending' ? 'bg-white' : 'bg-amber-500'}`}></span>
                  {pendingRequests.length} Pending
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
              <button onClick={handleOpenScheduleModal} className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm shadow-lg shadow-violet-200/60 transition-all w-full xl:w-auto justify-center">
                <Send size={15} /> Schedule Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Calendar + Side Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">

          {/* Calendar */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 lg:p-6 border border-gray-100 shadow-sm">
              <style>{`
                .clean-cal { width:100%; border:none; font-family:inherit; background:transparent; }
                .clean-cal .react-calendar__navigation { margin-bottom:4px; display:flex; justify-content:space-between; align-items:center; }
                .clean-cal .react-calendar__navigation button { font-weight:700; font-size:12px; color:#374151; background:transparent; border-radius:8px; padding:6px 10px; transition:all 0.2s; min-width:32px; }
                @media (min-width:640px) {
                  .clean-cal .react-calendar__navigation button { font-size:13px; padding:8px 14px; min-width:40px; border-radius:10px; }
                  .clean-cal .react-calendar__navigation { margin-bottom:8px; }
                }
                .clean-cal .react-calendar__navigation button:hover { background:#EDE9FE; color:#7C3AED; }
                .clean-cal .react-calendar__navigation button:disabled { opacity:0.3; }
                .clean-cal .react-calendar__navigation span { font-size:14px; font-weight:800; color:#1F2937; }
                @media (min-width:640px) { .clean-cal .react-calendar__navigation span { font-size:16px; } }
                .clean-cal .react-calendar__month-view__weekdays { font-size:10px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.05em; }
                @media (min-width:640px) { .clean-cal .react-calendar__month-view__weekdays { font-size:11px; letter-spacing:0.08em; } }
                .clean-cal .react-calendar__month-view__weekdays abbr { text-decoration:none; }
                .clean-cal .react-calendar__tile { position:relative; padding:4px 2px 2px; border-radius:8px; font-size:12px; font-weight:500; color:#4B5563; text-align:center; height:38px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; transition:all 0.15s; border:2px solid transparent; }
                @media (min-width:640px) {
                  .clean-cal .react-calendar__tile { padding:10px 6px 6px; border-radius:12px; font-size:14px; height:54px; }
                }
                .clean-cal .react-calendar__tile:hover { background:#F5F3FF; color:#7C3AED; }
                .clean-cal .react-calendar__tile--now { background:#F5F3FF; color:#7C3AED; font-weight:700; border-color:#DDD6FE; }
                .clean-cal .react-calendar__tile--active { background:linear-gradient(135deg,#7C3AED,#6366F1)!important; color:white!important; font-weight:700; border-radius:8px; box-shadow:0 4px 14px rgba(124,58,237,0.3); }
                @media (min-width:640px) { .clean-cal .react-calendar__tile--active { border-radius:12px; } }
                .clean-cal .react-calendar__tile--active:hover { background:linear-gradient(135deg,#6D28D9,#4F46E5)!important; }
                .clean-cal .react-calendar__tile--neighboringMonth { color:#D1D5DB; }
              `}</style>
              <Calendar onChange={(val) => setSelectedDate(val as Date)} value={selectedDate} tileContent={tileContent} className="clean-cal" />
            </div>
          </div>

          {/* Side Panel */}
          <div className="xl:col-span-1 flex flex-col gap-4 sm:gap-5">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
              <p className="text-[10px] sm:text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-1 sm:mb-1.5">Selected Date</p>
              <p className="text-sm sm:text-base font-extrabold text-gray-900 leading-snug">{formatDateLong(selectedDate)}</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex-1 min-h-[160px] sm:min-h-[200px] flex flex-col">
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 sm:mb-3">Meetings ({selectedMeetings.length})</p>
              {selectedMeetings.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-3 sm:py-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-2 sm:mb-3">
                    <Clock size={20} className="text-gray-200 sm:hidden" />
                    <Clock size={22} className="text-gray-200 hidden sm:block" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">No meetings</p>
                  <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1">Pick another date</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-2.5 flex-1">
                  {selectedMeetings.map((meeting) => {
                    const color = getColor(requests.indexOf(meeting));
                    return (
                      <div key={meeting.id} className="p-3 sm:p-3.5 rounded-xl border transition-all hover:shadow-md cursor-pointer group" style={{ backgroundColor: color.bg, borderColor: color.border }} onClick={() => meeting.status === 'confirmed' && handleJoinCall(meeting.id)}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-xs sm:text-sm truncate" style={{ color: color.text }}>{meeting.title}</p>
                            <p className="text-[11px] sm:text-xs mt-0.5 sm:mt-1 font-medium" style={{ color: color.dot }}>{meeting.time} · {meeting.requester}</p>
                          </div>
                          {meeting.status === 'confirmed' && (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/80 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                              <Video size={12} className="sm:hidden" style={{ color: color.text }} />
                              <Video size={13} className="hidden sm:block" style={{ color: color.text }} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Meetings List */}
        <div id="all-meetings-section" className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900">All Meetings</h3>
                {activeTab !== 'all' && (
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-violet-50 border border-violet-200 text-[10px] sm:text-xs font-bold text-violet-600">
                    Filtered: {activeTab === 'confirmed' ? 'Confirmed' : 'Pending'}
                    <button onClick={() => setActiveTab('all')} className="ml-0.5 sm:ml-1 hover:text-violet-800"><X size={11} /></button>
                  </span>
                )}
              </div>
              <div className="flex gap-1 sm:gap-1.5 bg-white p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm w-full sm:w-auto">
                {(['all', 'confirmed', 'pending'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-all capitalize whitespace-nowrap ${activeTab === tab ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                    {tab === 'all' ? `All (${requests.length})` : `${tab} (${tab === 'confirmed' ? confirmedMeetings.length : pendingRequests.length})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-2.5 sm:gap-3">
              {filteredMeetings.length === 0 ? (
                <div className="text-center py-12 sm:py-16 text-gray-400 bg-gray-50/50 rounded-xl sm:rounded-2xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm">
                    <Clock size={22} className="text-gray-200 sm:hidden" />
                    <Clock size={24} className="text-gray-200 hidden sm:block" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium">No meetings found</p>
                </div>
              ) : (
                filteredMeetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((req) => {
                  const color = getColor(requests.indexOf(req));
                  const isPending = req.status === 'pending';
                  return (
                    <div key={req.id} className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:border-gray-200 transition-all duration-200">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="w-1.5 self-stretch rounded-full shrink-0" style={{ backgroundColor: color.dot }} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1 sm:mb-1.5">
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900">{req.title}</h4>
                              {isPending ? (
                                <span className="text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">Pending</span>
                              ) : (
                                <span className="text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded-lg bg-green-50 text-green-600 border border-green-100 uppercase tracking-wider">Confirmed</span>
                              )}
                            </div>
                            <div className="flex items-center flex-wrap gap-x-3 sm:gap-x-5 gap-y-0.5 sm:gap-y-1">
                              <span className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1 sm:gap-1.5"><Clock size={12} className="text-gray-300" /> {req.date}</span>
                              <span className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1 sm:gap-1.5"><Clock size={12} className="text-gray-300" /> {req.time}</span>
                              <span className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1 sm:gap-1.5"><Users size={12} className="text-gray-300" /> {req.requester}</span>
                            </div>
                          </div>
                        </div>
                        {isPending ? (
                          <div className="flex gap-2 sm:gap-3 shrink-0 self-end sm:self-center w-full sm:w-auto">
                            <button onClick={() => handleDecline(req.id)} className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-600 transition-all text-[11px] sm:text-xs font-semibold text-center">Decline</button>
                            <button onClick={() => handleAccept(req.id)} className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[11px] sm:text-xs font-bold shadow-sm transition-all text-center">Accept</button>
                          </div>
                        ) : (
                          <button onClick={() => handleJoinCall(req.id)} className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-white text-[11px] sm:text-xs font-bold shadow-md flex items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-center active:scale-95 transition-all justify-center w-full sm:w-auto" style={{ backgroundColor: color.dot, boxShadow: `0 6px 20px ${color.dot}33` }}>
                            <Video size={13} className="sm:hidden" />
                            <Video size={14} className="hidden sm:block" /> Join Call
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="h-4 sm:h-6" />
      </div>
    </>
  );
};

export default MeetingScheduleCalendar;