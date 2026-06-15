import { useState } from 'react';
import { Search, CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Member, Attendance } from '../types';
import { getRelativeDateString } from '../dataStore';

interface AttendanceMarkingProps {
  members: Member[];
  attendance: Attendance[];
  onMarkAttendance: (memberCode: string, time: string) => void;
}

export default function AttendanceMarking({
  members,
  attendance,
  onMarkAttendance
}: AttendanceMarkingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customTime, setCustomTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  const todayStr = getRelativeDateString(0);

  // Filter members eligible for active check-in (only Active and not already logged in today)
  const todayCheckedInCodes = new Set(
    attendance
      .filter(a => a.date === todayStr)
      .map(a => a.memberCode)
  );

  const activeMembers = members.filter(m => m.status === 'Active');

  // Search Results
  const searchResults = searchQuery.trim() !== '' 
    ? activeMembers.filter(m => 
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mobile.includes(searchQuery)
      )
    : [];

  const handleMark = (code: string) => {
    // Save state
    onMarkAttendance(code, customTime);
    setSearchQuery('');
  };

  // List of members currently checked in today
  const todayCheckIns = attendance.filter(a => a.date === todayStr);

  return (
    <div id="attendance-section" className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider font-mono">Operations desk</span>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight font-sans mt-0.5">Daily Attendance Check-In</h3>
        </div>
        <div className="flex items-center space-x-2 bg-orange-50/10 dark:bg-orange-950/20 border border-orange-500/20 rounded-xl px-4 py-2 mt-3 md:mt-0 shadow-xs">
          <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span className="text-xs font-bold text-orange-900 dark:text-orange-400 font-mono">Today: {todayStr}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Attendance Marker Panel */}
        <div id="attendance-input-card" className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">1. Member Verification</h4>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-zinc-400" />
            <input
              id="input-att-search"
              type="text"
              placeholder="Enter unique Member Code or search by Full Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-11 pr-4 py-3.5 hover:border-zinc-300 focus:border-orange-500 outline-none shadow-inner bg-zinc-50/50 dark:bg-zinc-950/25 transition focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-white"
            />
          </div>

          {/* Custom Time config */}
          <div className="flex items-center space-x-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3 rounded-2xl max-w-sm">
            <Clock className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
            <label className="text-xs font-bold text-zinc-500">Check-in Stamp:</label>
            <input
              id="input-att-time"
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold px-2 py-1 outline-none text-zinc-700 dark:text-zinc-305 focus:border-orange-500"
            />
          </div>

          {/* Quick Search Results List */}
          {searchQuery.trim() !== '' && (
            <div id="search-dropdown-box" className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl overflow-hidden animate-slide-in max-h-[290px] overflow-y-auto">
              <div className="bg-zinc-50/70 dark:bg-zinc-950 px-4 py-2 text-xxs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                Found {searchResults.length} active matching athletic profiles
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400">
                  No active members found matching "{searchQuery}"
                </div>
              ) : (
                <div className="divide-y divide-zinc-150 dark:divide-zinc-800">
                  {searchResults.map(member => {
                    const isCheckedIn = todayCheckedInCodes.has(member.memberCode);

                    return (
                      <div key={member.id} className="flex items-center justify-between p-3.5 px-4 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/40 border border-orange-500/20 px-1.5 py-0.5 rounded leading-none">
                              {member.memberCode}
                            </span>
                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">{member.fullName}</span>
                          </div>
                          <span className="text-xxs text-zinc-400 font-semibold block mt-1">{member.mobile} • {member.address || 'Address N/A'}</span>
                        </div>

                        {isCheckedIn ? (
                          <span className="text-xxs font-extrabold uppercase tracking-wide bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400 border border-green-200/55 rounded-xl px-2.5 py-1">
                            Present Today
                          </span>
                        ) : (
                          <button
                            id={`btn-att-mark-${member.memberCode}`}
                            onClick={() => handleMark(member.memberCode)}
                            className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-1.5 px-3 rounded-full text-xxs shadow transition"
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Default Guidance when no query is typing */}
          {searchQuery.trim() === '' && (
            <div className="p-6 bg-orange-50/5 dark:bg-orange-950/5 border border-dashed border-orange-500/10 rounded-2xl flex items-center space-x-3 text-xs text-zinc-500 dark:text-zinc-400">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
              <span>Search a member code (e.g. GF101) or standard full name above to record check-in parameters instantly.</span>
            </div>
          )}
        </div>

        {/* Live Roll Log of Today's Present Sheets */}
        <div id="attendance-roll-side" className="bg-zinc-50/60 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl flex flex-col justify-between max-h-[360px] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-250 dark:border-zinc-800 pb-2 mb-3">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">2. Today's Roll ({todayCheckIns.length})</span>
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            </div>

            {todayCheckIns.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400 leading-relaxed font-semibold">
                No active session markings<br />recorded for today yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {todayCheckIns.map(att => (
                  <div key={att.id} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-2.5 rounded-xl shadow-xs flex items-center justify-between text-xs transition">
                    <div>
                      <div className="flex items-center space-x-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                        <span className="font-mono text-xxs font-bold text-zinc-400">{att.memberCode}</span>
                        <span>{att.memberName}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xxs text-zinc-400 font-mono mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-450" />
                        <span>Logged at {att.checkInTime}</span>
                      </div>
                    </div>
                    <CheckCircle className="w-4.5 h-4.5 text-green-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4 text-xxs text-zinc-400 font-mono leading-none">
            Roll records locked to database offline.
          </div>
        </div>

      </div>

    </div>
  );
}
