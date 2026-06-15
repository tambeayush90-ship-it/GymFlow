import { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Users, 
  Download, 
  Printer, 
  ShieldAlert
} from 'lucide-react';
import { Member, MembershipAssignment, Attendance, PaymentRecord, AdminSettings } from '../types';
import { formatINR, getDaysRemaining } from '../dataStore';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  assignments: MembershipAssignment[];
  attendance: Attendance[];
  payments: PaymentRecord[];
  settings: AdminSettings;
}

export default function ReportsModal({
  isOpen,
  onClose,
  members,
  assignments,
  attendance,
  payments,
  settings
}: ReportsModalProps) {
  const [selectedReport, setSelectedReport] = useState<'attendance' | 'members' | 'revenue'>('attendance');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  
  if (!isOpen) return null;

  // Filter attendance by chosen month
  const filteredAttendance = attendance.filter(item => item.date.startsWith(selectedMonth));
  
  // Calculate attendance per member
  const memberAttendanceMap: { [code: string]: number } = {};
  filteredAttendance.forEach(att => {
    memberAttendanceMap[att.memberCode] = (memberAttendanceMap[att.memberCode] || 0) + 1;
  });

  // Calculate Revenue metrics
  const paidTotal = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const dueTotal = assignments.reduce((sum, a) => sum + a.dueAmount, 0);

  // Month-wise revenue for current selection
  const monthlyPayments = payments.filter(p => p.paymentDate.startsWith(selectedMonth));
  const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amountPaid, 0);

  // Plan-wise revenue
  const planRevenue = {
    'Monthly': 0,
    '3-Month': 0,
    '6-Month': 0,
    '1-Year': 0
  };
  payments.forEach(p => {
    if (p.planType in planRevenue) {
      planRevenue[p.planType] += p.amountPaid;
    }
  });

  // Export to CSV function
  const handleExportCSV = () => {
    let csvContent = '';
    let fileName = '';

    if (selectedReport === 'attendance') {
      fileName = `GymFlow_Attendance_Report_${selectedMonth}.csv`;
      csvContent += `Gym Flow - Attendance Report (${selectedMonth})\r\n`;
      csvContent += `Total Members,${members.length}\r\n`;
      csvContent += `Total Visits in Month,${filteredAttendance.length}\r\n\r\n`;
      csvContent += `DAILY ATTENDANCE LOG\r\n`;
      csvContent += `Date,Member Code,Name,Check-in Time\r\n`;
      filteredAttendance.forEach(att => {
        csvContent += `"${att.date}","${att.memberCode}","${att.memberName}","${att.checkInTime}"\r\n`;
      });
      csvContent += `\r\nVISITS COUNT SUMMARY\r\n`;
      csvContent += `Member Code,Name,Total Visits\r\n`;
      members.forEach(m => {
        const visits = memberAttendanceMap[m.memberCode] || 0;
        csvContent += `"${m.memberCode}","${m.fullName}",${visits}\r\n`;
      });
    } else if (selectedReport === 'members') {
      fileName = `GymFlow_Members_Report.csv`;
      csvContent += `Gym Flow - Member Directory Report\r\n`;
      csvContent += `Total Registered Members,${members.length}\r\n\r\n`;
      csvContent += `Member Code,Full Name,Age,Gender,Mobile,Email,Address,Registration Date,Status,Plan,Start Date,Expiry Date,Remaining Days\r\n`;
      members.forEach(m => {
        const assign = assignments.find(a => a.memberCode === m.memberCode);
        const days = assign ? getDaysRemaining(assign.expiryDate) : 0;
        csvContent += `"${m.memberCode}","${m.fullName}",${m.age},"${m.gender}","${m.mobile}","${m.email}","${m.address}","${m.registrationDate}","${m.status}","${assign?.planType || 'None'}","${assign?.startDate || 'N/A'}","${assign?.expiryDate || 'N/A'}",${days}\r\n`;
      });
    } else {
      fileName = `GymFlow_Revenue_Report_${selectedMonth}.csv`;
      csvContent += `Gym Flow - Monthly Revenue & Financial Report (${selectedMonth})\r\n`;
      csvContent += `Selected Month Revenue,₹${monthlyRevenue}\r\n`;
      csvContent += `Lifetime Total Revenue Collected,₹${paidTotal}\r\n`;
      csvContent += `Outstanding Dues,₹${dueTotal}\r\n\r\n`;
      csvContent += `PLAN-WISE REVENUE LIFETIME\r\n`;
      Object.entries(planRevenue).forEach(([plan, rev]) => {
        csvContent += `"${plan}",₹${rev}\r\n`;
      });
      csvContent += `\r\nDETAILED PAYMENT HISTORY\r\n`;
      csvContent += `Receipt Number,Member Code,Name,Plan Type,Amount Paid,Due Amount,Payment Date,Payment Method\r\n`;
      payments.forEach(p => {
        csvContent += `"${p.receiptNumber}","${p.memberCode}","${p.memberName}","${p.planType}",${p.amountPaid},${p.dueAmount},"${p.paymentDate}","${p.paymentMethod}"\r\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Modern print system that pops up a formatted layout
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Allow popups to print/download reports');
      return;
    }

    const monthParts = selectedMonth.split('-');
    const monthName = new Date(parseInt(monthParts[0]), parseInt(monthParts[1]) - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    let reportHTML = `
      <html>
        <head>
          <title>Gym Flow - Report Preview</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { color: #111; background: #fff; }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body class="bg-gray-50 text-gray-800 p-8">
          <div class="max-w-4xl mx-auto bg-white p-8 rounded shadow-lg border border-gray-100">
            
            <div class="no-print flex justify-between items-center mb-6 bg-orange-50 p-4 border-l-4 border-orange-500 rounded">
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-orange-800">Print Preview:</span>
                <span class="text-sm text-orange-700">Use your browser's "Save as PDF" option in the destination dropdown to download standard PDF.</span>
              </div>
              <button onclick="window.print()" class="bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded shadow flex items-center space-x-2 transition">
                <span>Print or Save to PDF</span>
              </button>
            </div>

            <div class="flex justify-between items-start border-b pb-6 mb-6">
              <div>
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">GYM FLOW</h1>
                <p class="text-xs text-gray-500 font-mono mt-1">GENERATED ON: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                <p class="text-xs text-gray-500 font-mono">STATION ID: CLOUD-MAIN-01</p>
              </div>
              <div class="text-right">
                <span class="px-3 py-1 bg-gray-100 rounded text-xs font-semibold uppercase tracking-wider text-gray-600">Administrative Ledger</span>
                <p class="text-sm font-semibold text-gray-700 mt-2">Gym Flow Management System</p>
                <p class="text-xs text-gray-500">Secure Backup Enforced</p>
              </div>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 uppercase tracking-wide">
              ${selectedReport === 'attendance' ? `Monthly Attendance Report - ${monthName}` : ''}
              ${selectedReport === 'members' ? `Active Member Directory Report` : ''}
              ${selectedReport === 'revenue' ? `Financial Revenue Ledger - ${monthName}` : ''}
            </h2>
    `;

    if (selectedReport === 'attendance') {
      reportHTML += `
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-100 p-4 rounded">
            <span class="text-xs font-semibold text-gray-500 uppercase">Total Members Engaged</span>
            <p class="text-2xl font-extrabold text-gray-800">${members.length}</p>
          </div>
          <div class="bg-gray-100 p-4 rounded">
            <span class="text-xs font-semibold text-gray-500 uppercase">Total Check-Ins in Selected Month</span>
            <p class="text-2xl font-extrabold text-orange-600">${filteredAttendance.length}</p>
          </div>
        </div>

        <h3 class="text-lg font-bold text-gray-700 mb-2 border-b pb-1">Visits Counter Per Member</h3>
        <table class="w-full text-left border-collapse text-sm mb-6">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 border">Member Code</th>
              <th class="p-2 border">Full Name</th>
              <th class="p-2 border">Active Subscription</th>
              <th class="p-2 border text-center">Visits This Month</th>
            </tr>
          </thead>
          <tbody>
            ${members.map(m => {
              const visits = memberAttendanceMap[m.memberCode] || 0;
              const assign = assignments.find(a => a.memberCode === m.memberCode);
              return `
                <tr class="hover:bg-gray-50">
                  <td class="p-2 border font-mono font-bold">${m.memberCode}</td>
                  <td class="p-2 border font-medium">${m.fullName}</td>
                  <td class="p-2 border">${assign?.planType || 'None'}</td>
                  <td class="p-2 border text-center font-semibold text-orange-600">${visits}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="page-break"></div>

        <h3 class="text-lg font-bold text-gray-700 mb-2 border-b pb-1">Daily Log Sheets</h3>
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 border">Date</th>
              <th class="p-2 border">Member Code</th>
              <th class="p-2 border">Name</th>
              <th class="p-2 border">Check-in Time</th>
            </tr>
          </thead>
          <tbody>
            ${filteredAttendance.length === 0 ? '<tr><td colspan="4" class="p-4 text-center text-gray-400">No attendance registered for this month yet</td></tr>' : 
              filteredAttendance.map(att => `
                <tr class="hover:bg-gray-50">
                  <td class="p-2 border">${att.date}</td>
                  <td class="p-2 border font-mono">${att.memberCode}</td>
                  <td class="p-2 border">${att.memberName}</td>
                  <td class="p-2 border font-mono">${att.checkInTime}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      `;
    } else if (selectedReport === 'members') {
      reportHTML += `
        <div class="bg-gray-100 p-4 rounded mb-6 flex justify-between items-center">
          <div>
            <span class="text-xs font-semibold text-gray-500 uppercase text-center block">Active / Registered</span>
            <p class="text-2xl font-extrabold text-green-600 text-center">${members.filter(m => m.status === 'Active').length} / ${members.length}</p>
          </div>
          <div>
            <span class="text-xs font-semibold text-gray-500 uppercase text-center block">On Monthly Plan</span>
            <p class="text-2xl font-extrabold text-orange-600 text-center">${assignments.filter(a => a.planType === 'Monthly').length}</p>
          </div>
          <div>
            <span class="text-xs font-semibold text-gray-500 uppercase text-center block">On Long-term (3m, 6m, 1y)</span>
            <p class="text-2xl font-extrabold text-orange-600 text-center">${assignments.filter(a => a.planType !== 'Monthly').length}</p>
          </div>
        </div>

        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 border">Code</th>
              <th class="p-2 border">Full Name</th>
              <th class="p-2 border">Mobile & Email</th>
              <th class="p-2 border">Join Date</th>
              <th class="p-2 border">Plan</th>
              <th class="p-2 border">Expiry Date</th>
              <th class="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            ${members.map(m => {
              const assign = assignments.find(a => a.memberCode === m.memberCode);
              return `
                <tr class="hover:bg-gray-50">
                  <td class="p-2 border font-mono font-bold">${m.memberCode}</td>
                  <td class="p-2 border font-semibold">${m.fullName}, <span class="text-gray-500 font-normal text-xs">Age: ${m.age}</span></td>
                  <td class="p-2 border">${m.mobile}<br><span class="text-xs text-gray-400 font-mono">${m.email}</span></td>
                  <td class="p-2 border">${m.registrationDate}</td>
                  <td class="p-2 border font-medium text-orange-600">${assign?.planType || 'Not Assigned'}</td>
                  <td class="p-2 border font-mono">${assign?.expiryDate || 'N/A'}</td>
                  <td class="p-2 border text-center">
                    <span class="px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${m.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                      ${m.status}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else {
      reportHTML += `
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-gray-100 p-4 rounded text-center">
            <span class="text-xs font-semibold text-gray-500 uppercase">Selected Month Receipts</span>
            <p class="text-xl font-extrabold text-green-600">${formatINR(monthlyRevenue)}</p>
            <p class="text-xs text-gray-400 mt-1">${monthlyPayments.length} Total Receipts</p>
          </div>
          <div class="bg-gray-100 p-4 rounded text-center">
            <span class="text-xs font-semibold text-gray-500 uppercase">Lifetime Receipts</span>
            <p class="text-xl font-extrabold text-gray-900">${formatINR(paidTotal)}</p>
          </div>
          <div class="bg-gray-100 p-4 rounded text-center">
            <span class="text-xs font-semibold text-gray-500 uppercase">Outstanding Dues</span>
            <p class="text-xl font-extrabold text-red-600">${formatINR(dueTotal)}</p>
          </div>
        </div>

        <h3 class="text-lg font-bold text-gray-700 mb-2 border-b pb-1">Plan Revenue Breakdown</h3>
        <div class="grid grid-cols-4 gap-4 mb-6">
          ${Object.entries(planRevenue).map(([p, val]) => `
            <div class="border p-2 rounded text-center">
              <span class="text-xs font-semibold text-gray-400 uppercase">${p}</span>
              <p class="text-sm font-bold text-gray-800">${formatINR(val)}</p>
            </div>
          `).join('')}
        </div>

        <h3 class="text-lg font-bold text-gray-700 mb-2 border-b pb-1">Historical General Ledger</h3>
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 border">Receipt ID</th>
              <th class="p-2 border">Date</th>
              <th class="p-2 border">Code</th>
              <th class="p-2 border">Member</th>
              <th class="p-2 border">Plan Assigned</th>
              <th class="p-2 border">Method</th>
              <th class="p-2 border text-right">Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            ${payments.map(p => `
              <tr class="hover:bg-gray-50">
                <td class="p-2 border font-mono font-semibold">${p.receiptNumber}</td>
                <td class="p-2 border font-mono text-gray-500">${p.paymentDate}</td>
                <td class="p-2 border font-mono">${p.memberCode}</td>
                <td class="p-2 border font-semibold">${p.memberName}</td>
                <td class="p-2 border">${p.planType}</td>
                <td class="p-2 border text-gray-600">${p.paymentMethod}</td>
                <td class="p-2 border text-right font-bold text-green-700">${formatINR(p.amountPaid)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    reportHTML += `
            <div class="mt-8 border-t pt-4 text-center text-xs text-gray-400 flex justify-between">
              <span>Securely compiled by <strong>Gym Flow</strong> Platform</span>
              <span>Signature verified: LEDGER_OFFICER_STATION_AUTO</span>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
  };

  return (
    <div id="reports-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-fade-in">
      <div id="reports-modal-container" className="w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[85vh] max-h-[700px] animate-scale-in">
        
        {/* Sidebar Nav */}
        <div id="reports-sidebar" className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-150 dark:border-zinc-850 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 mb-6">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="font-extrabold tracking-tight text-lg text-zinc-900 dark:text-white font-sans">Reports Vault</span>
            </div>

            <nav className="space-y-1">
              <button
                id="btn-report-attendance"
                onClick={() => setSelectedReport('attendance')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  selectedReport === 'attendance'
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-550/15'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Attendance Audit</span>
              </button>

              <button
                id="btn-report-members"
                onClick={() => setSelectedReport('members')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  selectedReport === 'members'
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-550/15'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Member Master</span>
              </button>

              <button
                id="btn-report-revenue"
                onClick={() => setSelectedReport('revenue')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  selectedReport === 'revenue'
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-550/15'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Revenue Ledger</span>
              </button>
            </nav>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-xxs uppercase font-mono tracking-widest text-zinc-400 dark:text-zinc-550 block mb-1">Backup Protocol</span>
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Backup Synchronized</span>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div id="reports-view-pane" className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-zinc-900 overflow-y-auto">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Report Selector</span>
                <h3 className="text-2xl font-bold font-sans text-zinc-900 dark:text-white mt-0.5">
                  {selectedReport === 'attendance' && 'Daily & Monthly Attendance Records'}
                  {selectedReport === 'members' && 'Full Member Registration Database'}
                  {selectedReport === 'revenue' && 'Revenue Receipts & Outstanding Dues'}
                </h3>
              </div>
              <button
                id="btn-reports-close"
                onClick={onClose}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-zinc-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Config & Filter Bar */}
            <div id="reports-filter-bar" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl mb-6 font-semibold">
              {selectedReport === 'attendance' || selectedReport === 'revenue' ? (
                <div className="flex items-center space-x-3">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Target Month:</label>
                  <input
                    id="input-reports-month"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm px-3 py-1.5 font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-orange-500 transition shadow-xs"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-305">{members.length} members</span> loaded with active status and registrations.
                </div>
              )}

              <div className="flex space-x-2 self-end sm:self-auto">
                <button
                  id="btn-reports-export-csv"
                  onClick={handleExportCSV}
                  className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 border border-emerald-200/55 dark:border-emerald-800/50 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download CSV</span>
                </button>
                <button
                  id="btn-reports-export-pdf"
                  onClick={handlePrintPDF}
                  className="flex items-center space-x-2 bg-orange-600 text-white hover:bg-orange-500 rounded-xl px-4 py-2 text-xs font-extrabold shadow-xs transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download PDF / Print</span>
                </button>
              </div>
            </div>

            {/* Quick Preview Area */}
            <div id="reports-fast-preview" className="border border-zinc-150 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <div className="bg-zinc-50/50 dark:bg-zinc-950/40 px-4 py-3 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500 font-semibold font-mono">
                <span>PREVIEW CONSOLE</span>
                <span className="text-orange-550 flex items-center space-x-1 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Ready for Export</span>
                </span>
              </div>

              <div className="p-4 max-h-[220px] overflow-y-auto text-xs text-zinc-300 leading-relaxed font-mono bg-zinc-950 border border-zinc-950">
                {selectedReport === 'attendance' && (
                  <div>
                    <h4 className="text-orange-500 font-bold mb-1">// Today & Monthly Visits Log</h4>
                    <p>Month: {selectedMonth}</p>
                    <p>Total Check-ins in history block: {filteredAttendance.length}</p>
                    <p className="mt-2 text-zinc-500">--- Raw Record Sample ---</p>
                    {filteredAttendance.length === 0 ? 'No attendance entries found.' : 
                      filteredAttendance.slice(0, 3).map(att => (
                        <div key={att.id}>[{att.date} {att.checkInTime}] Code: {att.memberCode} | Name: {att.memberName}</div>
                      ))
                    }
                  </div>
                )}

                {selectedReport === 'members' && (
                  <div>
                    <h4 className="text-orange-500 font-bold mb-1">// Active Profile Index</h4>
                    <p>Total database records: {members.length}</p>
                    <p>Active membership count: {members.filter(m => m.status === 'Active').length}</p>
                    <p className="mt-2 text-zinc-500">--- Directory Sample ---</p>
                    {members.slice(0, 3).map(m => (
                      <div key={m.id}>Code: {m.memberCode} | {m.fullName} | {m.mobile} | Joined: {m.registrationDate}</div>
                    ))}
                  </div>
                )}

                {selectedReport === 'revenue' && (
                  <div>
                    <h4 className="text-orange-500 font-bold mb-1">// Financial Stream Analysis</h4>
                    <p>Total Outstanding Accounts: {assignments.filter(a => a.dueAmount > 0).length}</p>
                    <p>Receipt count: {payments.length}</p>
                    <p>Current Month Revenue: {formatINR(monthlyRevenue)}</p>
                    <p className="mt-2 text-zinc-500">--- Payment Ledger Sample ---</p>
                    {payments.slice(0, 3).map(p => (
                      <div key={p.id}>[{p.paymentDate}] Receipt {p.receiptNumber}: {p.memberName} - Paid {formatINR(p.amountPaid)} via {p.paymentMethod}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex justify-between items-center text-xs text-zinc-400">
            <span>Gym Flow • Standard Audit Template v1.2</span>
            <span>UTF-8 Document</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
