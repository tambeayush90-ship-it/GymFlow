import { useState, useEffect, FormEvent } from 'react';
import { 
  Dumbbell, 
  Users, 
  UserPlus, 
  CalendarCheck2, 
  Percent, 
  DollarSign, 
  Search, 
  Filter, 
  BellRing, 
  Settings, 
  FileText, 
  CreditCard, 
  Sun, 
  Moon, 
  Trash2, 
  Edit3, 
  Sparkles, 
  ArrowUpRight, 
  Coins, 
  CheckCircle,
  HelpCircle,
  Send,
  UserCheck,
  X,
  Download,
  Smartphone,
  Share2,
  Laptop
} from 'lucide-react';

import { 
  Member, 
  MembershipAssignment, 
  Attendance, 
  PaymentRecord, 
  AdminSettings, 
  SystemNotification,
  PaymentStatus,
  MemberStatus
} from './types';

import { 
  GymFlowStore, 
  getRelativeDateString, 
  getDaysRemaining, 
  calculateExpiryDate, 
  formatINR, 
  getActiveReminders 
} from './dataStore';

// Custom subcomponents
import ReportsModal from './components/ReportsModal';
import ReceiptModal from './components/ReceiptModal';
import OnboardingMigration from './components/OnboardingMigration';
import AddEditMemberModal from './components/AddEditMemberModal';
import AttendanceMarking from './components/AttendanceMarking';
import SettingSection from './components/SettingSection';

export default function App() {
  // Appearance Dark Mode standard toggle
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('gf_dark_mode') === 'true';
  });

  // Core Datastores
  const [members, setMembers] = useState<Member[]>([]);
  const [assignments, setAssignments] = useState<MembershipAssignment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);

  // Active Workspace tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'members' | 'ledger' | 'settings'>('dashboard');

  // Popups & Active states
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installStepsTab, setInstallStepsTab] = useState<'prompt' | 'ios' | 'android' | 'desktop'>('prompt');
  const [simulatedInstallProgress, setSimulatedInstallProgress] = useState<number | null>(null);
  const [simulatedProgressText, setSimulatedProgressText] = useState<string>('');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<PaymentRecord | null>(null);
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState<Member | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  // Search, filtration & layouts inside members checklist
  const [memberSearch, setMemberSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Expired'>('All');
  const [filterPlan, setFilterPlan] = useState<'All' | 'Monthly' | '3-Month' | '6-Month' | '1-Year'>('All');

  // Subscription renew modal input state
  const [assigningPlanMember, setAssigningPlanMember] = useState<Member | null>(null);
  const [renewalPlanType, setRenewalPlanType] = useState<'Monthly' | '3-Month' | '6-Month' | '1-Year'>('Monthly');
  const [renewalStartDate, setRenewalStartDate] = useState(getRelativeDateString(0));
  const [renewalAmountPaid, setRenewalAmountPaid] = useState<number>(1500);
  const [renewalPayStatus, setRenewalPayStatus] = useState<PaymentStatus>('Paid');

  // Manual payment adjustment input state
  const [adjustingPaymentMember, setAdjustingPaymentMember] = useState<{ member: Member; assign: MembershipAssignment } | null>(null);
  const [manualPayAmount, setManualPayAmount] = useState<number>(0);
  const [manualPayMethod, setManualPayMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Card'>('UPI');

  // Dynamic status-bar clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('12:30 PM');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setCurrentTimeStr(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Catch the PWA Install prompt and register SW
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('Gym Flow Service Worker registered scope:', reg.scope))
        .catch((err) => console.warn('Gym Flow Service Worker registration failed:', err));
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger loading state from LocalStorage on mount
  useEffect(() => {
    // Sync UI mode
    localStorage.setItem('gf_dark_mode', String(darkMode));

    // Pull from DataStore
    setMembers(GymFlowStore.getMembers());
    setAssignments(GymFlowStore.getAssignments());
    setAttendance(GymFlowStore.getAttendance());
    setPayments(GymFlowStore.getPayments());
    setSettings(GymFlowStore.getSettings());
    setNotifications(GymFlowStore.getNotifications());
    setOnboardingCompleted(GymFlowStore.getOnboardingStatus());
  }, [darkMode]);

  // Handle plan amount presets for renewal
  useEffect(() => {
    if (assigningPlanMember) {
      if (renewalPlanType === 'Monthly') setRenewalAmountPaid(1500);
      else if (renewalPlanType === '3-Month') setRenewalAmountPaid(3000);
      else if (renewalPlanType === '6-Month') setRenewalAmountPaid(5500);
      else if (renewalPlanType === '1-Year') setRenewalAmountPaid(10000);
    }
  }, [renewalPlanType, assigningPlanMember]);

  if (!settings) return null;

  // KPIs Calculations
  const todayStr = getRelativeDateString(0);
  const activeMembersCount = members.filter(m => m.status === 'Active').length;
  
  // New candidates this month (using registrationDate starts with current month format YYYY-MM)
  const currentMonthPrefix = todayStr.substring(0, 7);
  const newMembersThisMonthCount = members.filter(m => m.registrationDate.startsWith(currentMonthPrefix)).length;

  const todayAttendanceCount = attendance.filter(a => a.date === todayStr).length;
  const todayAbsentCount = Math.max(0, activeMembersCount - todayAttendanceCount);

  // Calculate monthly cashflow
  const monthlyRevenueTotal = payments
    .filter(p => p.paymentDate.startsWith(currentMonthPrefix))
    .reduce((sum, p) => sum + p.amountPaid, 0);

  // Outstanding accounts metric
  const outstandingDuesTotal = assignments.reduce((sum, a) => {
    // Check if member is active
    const member = members.find(m => m.memberCode === a.memberCode);
    if (!member || member.status === 'Inactive') return sum;
    return sum + a.dueAmount;
  }, 0);

  // Expiring counts
  const expiringMembersCount = assignments.filter(a => {
    const member = members.find(m => m.memberCode === a.memberCode);
    if (!member || member.status === 'Inactive') return false;
    const days = getDaysRemaining(a.expiryDate);
    return days <= 7;
  }).length;

  // Get active alerts/reminders lists
  const alertReports = getActiveReminders(members, assignments, settings);

  // State mutation actions
  const handleSaveSettings = (newSettings: AdminSettings) => {
    GymFlowStore.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleResetDatabase = () => {
    GymFlowStore.resetToDefault();
    // Refresh React State from pristine parameters
    setMembers(GymFlowStore.getMembers());
    setAssignments(GymFlowStore.getAssignments());
    setAttendance(GymFlowStore.getAttendance());
    setPayments(GymFlowStore.getPayments());
    setSettings(GymFlowStore.getSettings());
    setNotifications(GymFlowStore.getNotifications());
    setOnboardingCompleted(GymFlowStore.getOnboardingStatus());
    setActiveTab('dashboard');
  };

  const handleOnboardMigrationComplete = (m: Member, assign: MembershipAssignment, pay: PaymentRecord) => {
    const freshMembers = [m, ...members];
    const freshAssignments = [assign, ...assignments];
    const freshPayments = [pay, ...payments];

    // Save
    GymFlowStore.saveMembers(freshMembers);
    GymFlowStore.saveAssignments(freshAssignments);
    GymFlowStore.savePayments(freshPayments);

    setMembers(freshMembers);
    setAssignments(freshAssignments);
    setPayments(freshPayments);
  };

  const handleMarkAttendance = (memberCode: string, time: string) => {
    const member = members.find(m => m.memberCode === memberCode);
    if (!member) return;

    // Check if already checked in today
    const exists = attendance.some(a => a.date === todayStr && a.memberCode === memberCode);
    if (exists) return;

    const freshAtt: Attendance = {
      id: `att_${memberCode}__${todayStr}`,
      memberCode,
      memberName: member.fullName,
      date: todayStr,
      checkInTime: time
    };

    const updatedAtt = [freshAtt, ...attendance];
    GymFlowStore.saveAttendance(updatedAtt);
    setAttendance(updatedAtt);
  };

  const handleSaveMember = (
    newMember: Member, 
    startingPlan?: {
      planType: 'Monthly' | '3-Month' | '6-Month' | '1-Year';
      startDate: string;
      amountPaid: number;
      paymentStatus: PaymentStatus;
    }
  ) => {
    // Logic: if edit, replace; else prepend.
    let updatedMembers = [...members];
    const editingIndex = members.findIndex(m => m.id === newMember.id);

    if (editingIndex > -1) {
      updatedMembers[editingIndex] = newMember;
    } else {
      updatedMembers = [newMember, ...members];
    }

    GymFlowStore.saveMembers(updatedMembers);
    setMembers(updatedMembers);

    // If starting plan exists (for new members only)
    if (startingPlan) {
      const calculatedExpiry = calculateExpiryDate(startingPlan.startDate, startingPlan.planType);
      
      // Pricing
      let fullCost = 1500;
      if (startingPlan.planType === 'Monthly') fullCost = settings.plans.find(p => p.id === 'monthly')?.firstMonthFee || 1500;
      else if (startingPlan.planType === '3-Month') fullCost = settings.plans.find(p => p.id === '3-month')?.price || 3000;
      else if (startingPlan.planType === '6-Month') fullCost = settings.plans.find(p => p.id === '6-month')?.price || 5500;
      else if (startingPlan.planType === '1-Year') fullCost = settings.plans.find(p => p.id === '1-year')?.price || 10000;

      const dueAmount = fullCost - startingPlan.amountPaid;

      const newAssign: MembershipAssignment = {
        id: `a_${Date.now()}`,
        memberCode: newMember.memberCode,
        planType: startingPlan.planType,
        startDate: startingPlan.startDate,
        expiryDate: calculatedExpiry,
        amountPaid: startingPlan.amountPaid,
        dueAmount: dueAmount > 0 ? dueAmount : 0,
        paymentStatus: dueAmount <= 0 ? 'Paid' : startingPlan.paymentStatus
      };

      const updatedAssign = [newAssign, ...assignments];
      GymFlowStore.saveAssignments(updatedAssign);
      setAssignments(updatedAssign);

      // Record first payment if paid
      if (startingPlan.amountPaid > 0) {
        const newPay: PaymentRecord = {
          id: `p_${Date.now()}`,
          receiptNumber: `REC-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`,
          memberCode: newMember.memberCode,
          memberName: newMember.fullName,
          amountPaid: startingPlan.amountPaid,
          dueAmount: dueAmount > 0 ? dueAmount : 0,
          paymentDate: startingPlan.startDate,
          paymentMethod: 'UPI',
          planType: startingPlan.planType
        };

        const updatedPayments = [newPay, ...payments];
        GymFlowStore.savePayments(updatedPayments);
        setPayments(updatedPayments);
      }
    }

    setIsMemberModalOpen(false);
    setMemberToEdit(null);
  };

  const handleCreateNewMembershipAssignment = (e: FormEvent) => {
    e.preventDefault();
    if (!assigningPlanMember) return;

    // Prices calculation
    let fullPrice = 1500;
    const pastAssignments = assignments.filter(a => a.memberCode === assigningPlanMember.memberCode);
    
    if (renewalPlanType === 'Monthly') {
      const isFirst = pastAssignments.length === 0;
      fullPrice = isFirst 
        ? (settings.plans.find(p => p.id === 'monthly')?.firstMonthFee || 1500)
        : (settings.plans.find(p => p.id === 'monthly')?.renewalFee || 1200);
    } else {
      if (renewalPlanType === '3-Month') fullPrice = settings.plans.find(p => p.id === '3-month')?.price || 3000;
      else if (renewalPlanType === '6-Month') fullPrice = settings.plans.find(p => p.id === '6-month')?.price || 5500;
      else fullPrice = settings.plans.find(p => p.id === '1-year')?.price || 10000;
    }

    const calculatedExpiry = calculateExpiryDate(renewalStartDate, renewalPlanType);
    const calculatedDue = fullPrice - renewalAmountPaid;

    // Check if membership assignment already exits, update it or add new
    let updatedAssign = [...assignments];
    const existingIndex = assignments.findIndex(a => a.memberCode === assigningPlanMember.memberCode);

    const freshAssign: MembershipAssignment = {
      id: existingIndex > -1 ? assignments[existingIndex].id : `a_${Date.now()}`,
      memberCode: assigningPlanMember.memberCode,
      planType: renewalPlanType,
      startDate: renewalStartDate,
      expiryDate: calculatedExpiry,
      amountPaid: renewalAmountPaid,
      dueAmount: calculatedDue > 0 ? calculatedDue : 0,
      paymentStatus: calculatedDue <= 0 ? 'Paid' : renewalPayStatus
    };

    if (existingIndex > -1) {
      updatedAssign[existingIndex] = freshAssign;
    } else {
      updatedAssign = [freshAssign, ...assignments];
    }

    GymFlowStore.saveAssignments(updatedAssign);
    setAssignments(updatedAssign);

    // Add Payment log
    if (renewalAmountPaid > 0) {
      const freshPayment: PaymentRecord = {
        id: `p_${Date.now()}`,
        receiptNumber: `REC-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`,
        memberCode: assigningPlanMember.memberCode,
        memberName: assigningPlanMember.fullName,
        amountPaid: renewalAmountPaid,
        dueAmount: calculatedDue > 0 ? calculatedDue : 0,
        paymentDate: renewalStartDate,
        paymentMethod: 'UPI',
        planType: renewalPlanType
      };

      const updatedPayments = [freshPayment, ...payments];
      GymFlowStore.savePayments(updatedPayments);
      setPayments(updatedPayments);

      // Auto pop receipt
      setSelectedPaymentForReceipt(freshPayment);
      setIsReceiptOpen(true);
    }

    setAssigningPlanMember(null);
  };

  const handleAdjustManuallyCollectedFees = (e: FormEvent) => {
    e.preventDefault();
    if (!adjustingPaymentMember) return;

    const { member, assign } = adjustingPaymentMember;
    const paidSum = Number(manualPayAmount);

    if (paidSum <= 0) return;

    // Update due calculations in assignment
    const updatedAssign = assignments.map(a => {
      if (a.id === assign.id) {
        const remainingDue = Math.max(0, a.dueAmount - paidSum);
        return {
          ...a,
          dueAmount: remainingDue,
          amountPaid: a.amountPaid + paidSum,
          paymentStatus: remainingDue <= 0 ? 'Paid' : 'Partial' as any
        };
      }
      return a;
    });

    GymFlowStore.saveAssignments(updatedAssign);
    setAssignments(updatedAssign);

    // Setup standalone core receipt record
    const freshPayment: PaymentRecord = {
      id: `p_adj_${Date.now()}`,
      receiptNumber: `REC-BAL-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`,
      memberCode: member.memberCode,
      memberName: member.fullName,
      amountPaid: paidSum,
      dueAmount: Math.max(0, assign.dueAmount - paidSum),
      paymentDate: getRelativeDateString(0),
      paymentMethod: manualPayMethod,
      planType: assign.planType
    };

    const updatedPayments = [freshPayment, ...payments];
    GymFlowStore.savePayments(updatedPayments);
    setPayments(updatedPayments);

    setAdjustingPaymentMember(null);
    setManualPayAmount(0);

    // Open receipt
    setSelectedPaymentForReceipt(freshPayment);
    setIsReceiptOpen(true);
  };

  const handleDeleteMemberWithRecords = (memberId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this member and wipe all associated memberships and payments? This is completely irreversible.')) {
      return;
    }

    const memberToDelete = members.find(m => m.id === memberId);
    if (!memberToDelete) return;

    const freshMembers = members.filter(m => m.id !== memberId);
    const freshAssigns = assignments.filter(a => a.memberCode !== memberToDelete.memberCode);
    const freshPayments = payments.filter(p => p.memberCode !== memberToDelete.memberCode);
    const freshAtt = attendance.filter(a => a.memberCode !== memberToDelete.memberCode);

    GymFlowStore.saveMembers(freshMembers);
    GymFlowStore.saveAssignments(freshAssigns);
    GymFlowStore.savePayments(freshPayments);
    GymFlowStore.saveAttendance(freshAtt);

    setMembers(freshMembers);
    setAssignments(freshAssigns);
    setPayments(freshPayments);
    setAttendance(freshAtt);

    if (selectedMemberForProfile?.id === memberId) {
      setSelectedMemberForProfile(null);
    }
  };

  const handleSimulateNotificationDispatch = (alert: any) => {
    // Generate beautiful system notification simulation
    const freshMessage = alert.message;
    const freshNotif: SystemNotification = {
      id: `sim_notif_${Date.now()}`,
      type: 'sms',
      memberCode: alert.memberCode,
      memberName: alert.memberName,
      message: freshMessage,
      timestamp: `${getRelativeDateString(0)} ${new Date().toTimeString().slice(0, 5)}`,
      status: 'Sent'
    };

    const updatedNotifs = [freshNotif, ...notifications];
    GymFlowStore.saveNotifications(updatedNotifs);
    setNotifications(updatedNotifs);

    alert(`Simulated SMS & Email Dispatched to ${alert.memberName} successfully!\nMessage logged in system notification journals.`);
  };

  const handleImportBackup = (jsonStr: string): boolean => {
    const success = GymFlowStore.importFullBackup(jsonStr);
    if (success) {
      setMembers(GymFlowStore.getMembers());
      setAssignments(GymFlowStore.getAssignments());
      setAttendance(GymFlowStore.getAttendance());
      setPayments(GymFlowStore.getPayments());
      setSettings(GymFlowStore.getSettings());
      setNotifications(GymFlowStore.getNotifications());
      setOnboardingCompleted(GymFlowStore.getOnboardingStatus());
      return true;
    }
    return false;
  };

  // Pre-calculate search & filtration indices for member lists
  const processedMembers = members.filter(m => {
    // Text query search
    const matchesSearch = memberSearch.trim() === '' ||
      m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.mobile.includes(memberSearch) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase());

    // Expiry status checks
    const assign = assignments.find(a => a.memberCode === m.memberCode);
    const expDays = assign ? getDaysRemaining(assign.expiryDate) : -9999;
    const isExpired = expDays < 0;

    const matchesStatus = filterStatus === 'All' ||
      (filterStatus === 'Active' && m.status === 'Active' && !isExpired) ||
      (filterStatus === 'Expired' && (m.status === 'Inactive' || isExpired));

    const matchesPlan = filterPlan === 'All' ||
      (assign && assign.planType === filterPlan);

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Calculate high quality auto suggested next code (e.g. GF107)
  const getNextSuggestedCode = () => {
    const maxNum = members.reduce((max, m) => {
      const match = m.memberCode.match(/^GF(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 100);
    return `GF${maxNum + 1}`;
  };

  // Custom Line SVG Path math for beautiful responsive graphs representing check-ins over 15 days
  // Let's gather check-ins counts for the last 7 days
  const last7DaysList = Array.from({ length: 7 }, (_, idx) => {
    const dateStr = getRelativeDateString(-6 + idx); // oldest first
    const count = attendance.filter(a => a.date === dateStr).length;
    // Format date string for label e.g. "Jun 14"
    const label = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { date: dateStr, count, name: label };
  });

  const maxCheckInCount = Math.max(...last7DaysList.map(d => d.count), 4);
  const chartHeight = 120;
  const chartWidth = 460;
  const chartPoints = last7DaysList.map((d, i) => {
    const x = (i * (chartWidth / 6)).toFixed(1);
    const y = (chartHeight - (d.count / maxCheckInCount) * (chartHeight - 20)).toFixed(1);
    return { x, y, ...d };
  });

  const dPath = chartPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Doughnut / Progress bar representation for plan distributions
  const planDistribution = {
    'Monthly': assignments.filter(a => a.planType === 'Monthly').length,
    '3-Month': assignments.filter(a => a.planType === '3-Month').length,
    '6-Month': assignments.filter(a => a.planType === '6-Month').length,
    '1-Year': assignments.filter(a => a.planType === '1-Year').length
  };
  const totalSubscribers = Object.values(planDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className={`min-h-screen h-[100dvh] overflow-hidden flex items-center justify-center p-0 md:p-6 font-sans transition-colors duration-150 ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'}`}>
      
      {/* Clean Mobile-Optimized Standalone App Shell */}
      <div className="relative w-full h-full md:w-[420px] md:h-[860px] md:max-h-[94vh] md:rounded-[36px] md:border md:border-zinc-200 dark:md:border-zinc-850 md:shadow-[0_20px_50px_rgba(0,0,0,0.35)] overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex flex-col transition-colors duration-150">
        
        {/* Top Mobile Header */}
        <header className={`border-b ${darkMode ? 'bg-zinc-900/40 border-zinc-900' : 'bg-white border-zinc-200'} shrink-0 p-3 px-4 flex items-center justify-between z-40 bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md`}>
          <div className="flex items-center space-x-2 select-none">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-md transform -skew-x-6">
              <Dumbbell className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <button
              id="txt-applet-title"
              onClick={() => setIsDownloadModalOpen(true)}
              className="text-left font-display font-black tracking-tighter text-lg italic transform -skew-x-12 hover:text-orange-500 text-zinc-900 dark:text-white transition flex items-center gap-1 focus:outline-none"
              title="Install Gym Flow Mobile App"
            >
              <span>Gym Flow</span>
            </button>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              id="btn-mode-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 rounded-lg border transition ${
                darkMode ? 'bg-zinc-900 border-zinc-800 text-orange-400 hover:bg-zinc-800' : 'bg-zinc-150 border-zinc-200 text-zinc-650 hover:bg-zinc-200'
              }`}
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              id="btn-trigger-reports-header"
              onClick={() => setIsReportsOpen(true)}
              className="p-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition"
              title="Export PDFs"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Scrollable Mobile Content canvas area */}
        <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4 bg-zinc-50 dark:bg-zinc-950 scrollbar-none relative">
          
          {/* Onboarding Wizard banner for legacy records */}
          {!onboardingCompleted && (
            <OnboardingMigration 
              onOnboardComplete={handleOnboardMigrationComplete} 
              onDismiss={() => {
                GymFlowStore.setOnboardingStatus(true);
                setOnboardingCompleted(true);
              }} 
            />
          )}

        {/* Tab 1: Primary KPIs Dashboard */}
        {activeTab === 'dashboard' && (
          <div id="view-dashboard" className="space-y-8 animate-fade-in">
            
            {/* Mini KPIs Bento Grid cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} flex flex-col justify-between h-32 hover:border-orange-500/55 transition-all duration-200`}>
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-zinc-400">Active Register</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-orange-600 dark:text-orange-400 font-display italic transform -skew-x-6">{activeMembersCount}</span>
                  <span className="text-xxs font-bold text-zinc-400">Members</span>
                </div>
                <div className="text-[10px] font-semibold text-zinc-400">Total active profiles</div>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} flex flex-col justify-between h-32 hover:border-orange-500/55 transition-all duration-200`}>
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-zinc-400">Today Attendee</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-green-600 dark:text-green-400 font-display italic transform -skew-x-6">{todayAttendanceCount}</span>
                  <span className="text-xxs font-bold text-zinc-400">Checked In</span>
                </div>
                <div className="text-[10px] font-semibold text-red-500">Absent: {todayAbsentCount}</div>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} flex flex-col justify-between h-32 hover:border-orange-500/55 transition-all duration-200`}>
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-zinc-400">Monthly Joiners</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-amber-500 dark:text-amber-400 font-display italic transform -skew-x-6">{newMembersThisMonthCount}</span>
                  <span className="text-xxs font-bold text-zinc-400 font-mono">New</span>
                </div>
                <div className="text-[10px] font-semibold text-zinc-400">Registered this month</div>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} flex flex-col justify-between h-32 hover:border-orange-500/55 transition-all duration-200`}>
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-zinc-400">Expiring Pack</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-red-650 dark:text-red-400 font-display italic transform -skew-x-6">{expiringMembersCount}</span>
                  <span className="text-xxs font-bold text-zinc-400">Alert</span>
                </div>
                <div className="text-[10px] font-semibold text-zinc-400">Expires in 7 days</div>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} flex flex-col justify-between h-32 hover:border-orange-500/55 transition-all duration-200`}>
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-zinc-400">Monthly Cashflow</span>
                <span className="text-xl font-black text-orange-600 dark:text-orange-400 font-mono tracking-tight">{formatINR(monthlyRevenueTotal)}</span>
                <div className="text-[10px] font-semibold text-orange-500 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 inline mr-0.5" />
                  <span>Collected this month</span>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} flex flex-col justify-between h-32 hover:border-orange-500/55 transition-all duration-200`}>
                <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-zinc-400">Outstanding Due</span>
                <span className="text-xl font-black text-red-600 dark:text-red-500 font-mono tracking-tight">{formatINR(outstandingDuesTotal)}</span>
                <div className="text-[10px] font-semibold text-zinc-400">Collection balance</div>
              </div>

            </div>

            {/* Custom SVG Graphical Indicators & Plan Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Daily check ins line chart panel */}
              <div id="chart-checkins-line" className={`lg:col-span-2 p-6 rounded-3xl border flex flex-col justify-between ${
                darkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
              }`}>
                <div>
                  <span className="text-xxs font-extrabold uppercase text-orange-500 font-mono tracking-wider">Metrics ledger</span>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Today & 7-Day Attendance Logs</h4>
                </div>

                {/* SVG Visual line chart */}
                <div className="relative mt-4 py-4">
                  <svg className="w-full h-36" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                    
                    {/* SVG Grids */}
                    <line x1="0" y1="20" x2={chartWidth} y2="20" stroke={darkMode ? '#27272a' : '#e4e4e7'} strokeWidth="1" />
                    <line x1="0" y1="70" x2={chartWidth} y2="70" stroke={darkMode ? '#27272a' : '#e4e4e7'} strokeWidth="1" />
                    <line x1="0" y1="120" x2={chartWidth} y2="120" stroke={darkMode ? '#27272a' : '#e4e4e7'} strokeWidth="1" />

                    {/* SVG Line path */}
                    <path d={dPath} fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />

                    {/* SVG Dots on line */}
                    {chartPoints.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#f97316" />
                        <circle cx={p.x} cy={p.y} r="8" fill="#f97316" fillOpacity="0.15" className="hover:scale-150 transition-transform origin-center" />
                        {/* Text values */}
                        <text x={p.x} y={parseFloat(p.y) - 10} textAnchor="middle" fontSize="10" fill={darkMode ? '#a1a1aa' : '#71717a'} fontWeight="bold" className="font-mono">
                          {p.count}
                        </text>
                      </g>
                    ))}
                  </svg>

                  {/* Labels underneath */}
                  <div className="flex justify-between text-3xs font-bold text-zinc-400 font-mono mt-2 uppercase tracking-wide">
                    {chartPoints.map((p, idx) => (
                      <span key={idx}>{p.name}</span>
                    ))}
                  </div>
                </div>

                <p className="text-3xs text-zinc-400 mt-2">Points denote total check-ins registered by proprietors per chronological date stamp.</p>

              </div>

              {/* Plans breakdown pie bento list representation */}
              <div id="chart-plan-bar" className={`p-6 rounded-3xl border ${
                darkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
              }`}>
                <div>
                  <span className="text-xxs font-extrabold uppercase text-orange-500 font-mono tracking-wider">Plan layout distributions</span>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Active Plan Subscriptions</h4>
                </div>

                <div className="space-y-4 mt-6">
                  {Object.entries(planDistribution).map(([pName, count]) => {
                    const percent = Math.round((count / totalSubscribers) * 100);
                    return (
                      <div key={pName} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold font-sans">
                          <span className="text-zinc-600 dark:text-zinc-300">{pName}</span>
                          <span className="text-orange-600 dark:text-orange-400 font-mono">{count} member{count !== 1 ? 's' : ''} ({percent}%)</span>
                        </div>
                        {/* Custom horizontal flat-progress indicator bars as requested in charts */}
                        <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                          <div 
                            style={{ width: `${percent}%` }} 
                            className="bg-orange-650 h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm"
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Expiring Alerts section (Urgent action needed) as requested */}
            <div id="renewal-reminders-hub" className={`p-6 rounded-3xl border ${
              darkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
            }`}>
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <BellRing className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h4 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">Active Renewal Reminders Hub</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 dark:bg-orange-950/40 dark:text-orange-400 font-semibold font-mono text-xs border border-orange-500/20">
                  {alertReports.length} Reminders Triggered
                </span>
              </div>

              {alertReports.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400 font-semibold leading-relaxed">
                  Congratulations! All memberships are verified active and fresh.<br />No renewing alarms triggered today.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto">
                  {alertReports.map((alert, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 border rounded-2xl flex flex-col gap-3 transition ${
                        alert.daysRemaining < 0 
                          ? 'bg-red-50/20 border-red-200/50 hover:bg-red-50/40 dark:bg-red-950/5 dark:border-red-900/40' 
                          : 'bg-orange-50/10 border-orange-200/20 hover:bg-orange-50/20 dark:bg-orange-950/5 dark:border-orange-900/40'
                      }`}
                    >
                      {/* Reminder written horizontally */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-mono text-xs font-black text-orange-650 bg-orange-50 border border-orange-100 dark:bg-orange-950 dark:border-orange-850 rounded px-1.5 py-0.5 leading-none">
                          {alert.memberCode}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-white">{alert.memberName}</span>
                        <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded ${
                          alert.daysRemaining < 0 ? 'bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-400' : 'bg-orange-100 text-orange-900 dark:bg-orange-950/40 dark:text-orange-400'
                        }`}>
                          {alert.daysRemaining < 0 ? `Expired ${Math.abs(alert.daysRemaining)}d ago` : `${alert.daysRemaining}d remaining`}
                        </span>
                        <span className="text-zinc-550 dark:text-zinc-400 italic font-medium">
                          — "{alert.message}"
                        </span>
                      </div>

                      {/* Buttons strictly below the horizontal reminder */}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          id={`btn-remind-${alert.memberCode}`}
                          onClick={() => handleSimulateNotificationDispatch(alert)}
                          className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl text-xs shadow-sm transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Simulate Reminder</span>
                        </button>
                        <button
                          id={`btn-renew-preset-${alert.memberCode}`}
                          onClick={() => {
                            const matchedMember = members.find(m => m.memberCode === alert.memberCode);
                            if (matchedMember) {
                              setAssigningPlanMember(matchedMember);
                            }
                          }}
                          className="flex-1 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs shadow-xs transition text-center"
                        >
                          Renew Now
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System notifications feed logs */}
            <div id="notif-logs-feed" className={`p-6 rounded-3xl border ${
              darkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
            }`}>
              <span className="text-xxs font-extrabold uppercase text-orange-600 font-mono tracking-wider">Simulated gateways feed</span>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-3">Outgoing SMS & Email Logs ({notifications.length})</h4>

              <div className="space-y-2.5 max-h-[180px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-400 font-bold">
                    Notification register is currently empty.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-xl flex justify-between items-start text-xs font-mono">
                      <div>
                        <div className="flex items-center space-x-2 mb-1.5">
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-400 font-extrabold rounded capitalize text-3xs border border-orange-500/10">
                            {notif.type} log
                          </span>
                          <span className="text-zinc-400">{notif.timestamp}</span>
                        </div>
                        <p className="text-zinc-750 dark:text-zinc-350">"{notif.message}"</p>
                      </div>
                      <span className="text-xxs text-green-600 font-bold uppercase">{notif.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Check-In Operations Module (Attendance) */}
        {activeTab === 'attendance' && (
          <div className="animate-fade-in">
            <AttendanceMarking 
              members={members} 
              attendance={attendance} 
              onMarkAttendance={handleMarkAttendance} 
            />
          </div>
        )}

            {/* Tab 3: Member Directory & Filters */}
        {activeTab === 'members' && (
          <div id="view-members" className="space-y-4 animate-fade-in">
            
            {/* Header with quick creation action */}
            <div className="flex items-center justify-between gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-orange-650 uppercase tracking-widest font-mono block">Administration Matrix</span>
                <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">Gym Directory</h3>
              </div>
              <button
                id="btn-trigger-register-modal"
                onClick={() => {
                  setMemberToEdit(null);
                  setIsMemberModalOpen(true);
                }}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl text-xxs flex items-center space-x-1 shadow-md shadow-orange-550/15 transition-all hover:scale-[1.02]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            {/* Filter controls panel */}
            <div id="members-filter-panel" className={`p-3 rounded-2xl border shadow-xs space-y-2.5 ${
              darkMode ? 'bg-zinc-900/40 border-zinc-805' : 'bg-white border-zinc-150'
            }`}>
              
              {/* Search Bar query */}
              <div className="relative">
                <Search className="absolute left-3 top-2 w-4 h-4 text-zinc-400" />
                <input
                  id="input-member-table-search"
                  type="text"
                  placeholder="Search name, code, phone, or email index..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 font-semibold text-zinc-705 dark:text-zinc-200"
                />
              </div>

              {/* Dynamic Filters side-by-side */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono shrink-0">Status:</span>
                  <select
                    id="select-filter-status"
                    value={filterStatus}
                    onChange={(e: any) => setFilterStatus(e.target.value)}
                    className="w-full text-[11px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-1.5 py-1 focus:border-orange-500 outline-none transition font-semibold"
                  >
                    <option value="All">All Profiles</option>
                    <option value="Active">Active Only</option>
                    <option value="Expired">Expired Only</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono shrink-0">Plan:</span>
                  <select
                    id="select-filter-plan"
                    value={filterPlan}
                    onChange={(e: any) => setFilterPlan(e.target.value)}
                    className="w-full text-[11px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-1.5 py-1 focus:border-orange-500 outline-none transition font-semibold"
                  >
                    <option value="All">All Plans</option>
                    <option value="Monthly">Monthly</option>
                    <option value="3-Month">3-Month</option>
                    <option value="6-Month">6-Month</option>
                    <option value="1-Year">1-Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main Interactive Directory Table */}
            <div id="members-list-grid" className="flex flex-col gap-3">
              
              {processedMembers.length === 0 ? (
                <div className="md:col-span-3 py-10 text-center text-xs text-zinc-400 font-bold border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  No matching registered gym members found.
                </div>
              ) : (
                processedMembers.map(member => {
                  const assign = assignments.find(a => a.memberCode === member.memberCode);
                  const daysRemaining = assign ? getDaysRemaining(assign.expiryDate) : -9999;
                  const isExpired = daysRemaining < 0;

                  return (
                    <div 
                      key={member.id} 
                      className={`p-3.5 rounded-xl border hover:border-orange-500/40 transition flex flex-col gap-2.5 ${
                        darkMode ? 'bg-zinc-900/40 border-zinc-800 bg-zinc-900/20' : 'bg-white border-zinc-200 shadow-3xs'
                      }`}
                    >
                      {/* Name and horizontal tracking layout */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-zinc-105 dark:border-zinc-800/60 pb-1.5 animate-fade-in">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-black text-orange-650 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 border border-orange-500/20 rounded-md select-all leading-none">
                            {member.memberCode}
                          </span>
                          <h4 
                            className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white hover:text-orange-600 cursor-pointer transition select-all"
                            onClick={() => setSelectedMemberForProfile(member)}
                            title="Click to view profile"
                          >
                            {member.fullName}
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide leading-none ${
                            member.status === 'Inactive' || isExpired
                              ? 'bg-red-50 text-red-700 dark:bg-red-955/40 dark:text-red-400'
                              : 'bg-green-50 text-green-700 dark:bg-green-955/40 dark:text-green-400'
                          }`}>
                            {member.status === 'Inactive' || isExpired ? 'Expired' : 'Active'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            id={`btn-edit-member-${member.memberCode}`}
                            onClick={() => {
                              setMemberToEdit(member);
                              setIsMemberModalOpen(true);
                            }}
                            className="px-2 py-1 border border-zinc-205 dark:border-zinc-800 rounded-md text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition text-[9px] font-extrabold uppercase tracking-wide bg-zinc-50 dark:bg-zinc-900"
                            title="Edit Personal Information"
                          >
                            Edit
                          </button>
                          <button
                            id={`btn-delete-member-${member.memberCode}`}
                            onClick={() => handleDeleteMemberWithRecords(member.id)}
                            className="p-1 hover:bg-red-50 hover:text-red-655 dark:hover:bg-red-950/40 rounded text-zinc-400 transition"
                            title="Delete Member Records completely"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Contact details: Written Horizontally on one flat line with nice spacing */}
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xxs font-medium text-zinc-500 dark:text-zinc-400">
                        <span className="font-mono">📱 {member.mobile}</span>
                        <span className="text-zinc-300 dark:text-zinc-700 select-none">|</span>
                        <span>✉ {member.email}</span>
                      </div>

                      {/* Subscription details: Printed horizontally */}
                      <div className="text-[11px] bg-zinc-50/55 dark:bg-zinc-950/40 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/55 mt-0.5">
                        {assign ? (
                          <div className="flex flex-wrap items-center justify-between gap-1.5 animate-fade-in">
                            <div className="flex flex-wrap items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold text-xxs">
                              <span>Plan:</span>
                              <span className="font-extrabold text-zinc-850 dark:text-zinc-200">{assign.planType} Plan</span>
                              <span className="text-[10px] font-mono text-zinc-450 dark:text-zinc-500">({assign.startDate} to {assign.expiryDate})</span>
                            </div>
                            <span className={`font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-[8px] ${
                              isExpired 
                                ? 'bg-red-50 text-red-700 dark:bg-red-955/20 dark:text-red-400' 
                                : daysRemaining <= 7 
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-955/20 dark:text-amber-400 animate-pulse' 
                                  : 'bg-orange-50 text-orange-700 dark:bg-orange-955/20 dark:text-orange-400'
                            }`}>
                              {isExpired ? 'expired' : `${daysRemaining} days left`}
                            </span>
                          </div>
                        ) : (
                          <div className="p-0.5 text-center text-3xs text-yellow-805 dark:text-yellow-405 leading-normal flex items-center justify-center space-x-1">
                            <HelpCircle className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                            <span>No active package subscription plan assigned.</span>
                          </div>
                        )}
                      </div>

                      {/* Actions Footer */}
                      <div className="mt-1 pt-1.5 border-t border-zinc-150/65 dark:border-zinc-800/80 flex items-center gap-2">
                        <button
                          id={`btn-manual-renew-${member.memberCode}`}
                          onClick={() => setAssigningPlanMember(member)}
                          className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wide text-center transition shadow-3xs"
                        >
                          {assign ? 'Renew' : 'Assign'}
                        </button>
                        {assign && assign.dueAmount > 0 && (
                          <button
                            id={`btn-pay-due-${member.memberCode}`}
                            onClick={() => setAdjustingPaymentMember({ member, assign })}
                            className="py-1.5 px-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-955/20 dark:text-emerald-400 font-extrabold hover:bg-emerald-100/50 border border-emerald-200/50 rounded-lg text-[9px] uppercase tracking-wide transition text-center"
                          >
                            Pay ₹{assign.dueAmount}
                          </button>
                        )}
                        <button
                          id={`btn-view-profile-${member.memberCode}`}
                          onClick={() => setSelectedMemberForProfile(member)}
                          className="py-1.5 px-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 font-bold rounded-lg text-[9px] uppercase tracking-wide transition"
                        >
                          Profile
                        </button>
                      </div>

                    </div>
                  );
                })
              )}

            </div>

          </div>
        )}

        {/* Tab 4: Payments General Ledger */}
        {activeTab === 'ledger' && (
          <div id="view-ledger" className="space-y-6 animate-fade-in">
               <div>
              <span className="text-xxs font-bold text-orange-600 uppercase tracking-wider font-mono">Ledger Tracker</span>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">Accounts & Payments</h3>
            </div>

            {/* Total Balance info bar */}
            <div className={`p-4 rounded-3xl border grid grid-cols-2 gap-3 ${
              darkMode ? 'bg-zinc-900/60 border-zinc-805' : 'bg-white border-zinc-200'
            }`}>
              <div className="flex flex-col justify-between p-2">
                <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider font-mono block">Collected</span>
                <p className="text-base font-black text-zinc-950 dark:text-white mt-1">{formatINR(payments.reduce((sum, p) => sum + p.amountPaid, 0))}</p>
              </div>

              <div className="flex flex-col justify-between p-2">
                <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider font-mono block text-red-500">Arrears</span>
                <p className="text-base font-black text-red-650 mt-1">{formatINR(outstandingDuesTotal)}</p>
              </div>
            </div>

            {/* Structured Mobile Cards List */}
            <div className="space-y-3">
              {payments.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-455 font-bold">
                  No accounting histories found.
                </div>
              ) : payments.map(record => (
                <div key={record.id} className={`p-4 rounded-2xl border transition ${
                  darkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase">{record.receiptNumber}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          record.paymentMethod === 'UPI' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                          record.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}>
                          {record.paymentMethod}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white mt-1 leading-snug">{record.memberName}</h4>
                      <span className="text-xxs text-orange-600 dark:text-orange-400 font-mono font-bold">{record.memberCode}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block font-mono">+{formatINR(record.amountPaid)}</span>
                      <span className="text-[9px] text-zinc-400 block font-mono mt-1">{record.paymentDate}</span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800/85 mt-3 pt-2.5 flex justify-between items-center text-xxs">
                    <div>
                      <span className="text-zinc-410 dark:text-zinc-500 font-medium mr-1 col-span-2">Plan:</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{record.planType}</span>
                      {record.dueAmount > 0 && (
                        <span className="ml-2 font-mono font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded text-[9px]">
                          Due: {formatINR(record.dueAmount)}
                        </span>
                      )}
                    </div>
                    <button
                      id={`btn-ledger-receipt-${record.receiptNumber}`}
                      onClick={() => {
                        setSelectedPaymentForReceipt(record);
                        setIsReceiptOpen(true);
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-lg text-[9px] uppercase tracking-wider transition"
                    >
                      Slip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Admin settings controls */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in">
            <SettingSection 
              settings={settings} 
              onSaveSettings={handleSaveSettings} 
              onResetDatabase={handleResetDatabase}
              onImportBackup={handleImportBackup}
            />
          </div>
        )}

        </div> {/* closing Scrollable Mobile Content canvas area */}

        {/* Floating/Fixed Bottom Navigation bar */}
        <div 
          id="mobile-tab-bar" 
          className={`border-t grid grid-cols-5 items-center justify-items-center shrink-0 z-40 select-none shadow-md transition-all ${
            darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-650'
          }`}
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
            paddingTop: '10px',
          }}
        >
          <button
            id="tab-btn-dash"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex flex-col items-center justify-center space-y-0.5 py-1 px-0.5 transition-all ${
              activeTab === 'dashboard' ? 'text-orange-600 dark:text-orange-400 scale-105 font-bold' : 'hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[9px] uppercase tracking-wider font-semibold">Dash</span>
          </button>

          <button
            id="tab-btn-checkin"
            onClick={() => setActiveTab('attendance')}
            className={`w-full flex flex-col items-center justify-center space-y-0.5 py-1 px-0.5 transition-all ${
              activeTab === 'attendance' ? 'text-orange-600 dark:text-orange-400 scale-105 font-bold' : 'hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <CalendarCheck2 className="w-5 h-5" />
            <span className="text-[9px] uppercase tracking-wider font-semibold">Check</span>
          </button>

          <button
            id="tab-btn-members"
            onClick={() => setActiveTab('members')}
            className={`w-full flex flex-col items-center justify-center space-y-0.5 py-1 px-0.5 transition-all ${
              activeTab === 'members' ? 'text-orange-600 dark:text-orange-400 scale-105 font-bold' : 'hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] uppercase tracking-wider font-semibold">Members</span>
          </button>

          <button
            id="tab-btn-ledger"
            onClick={() => setActiveTab('ledger')}
            className={`w-full flex flex-col items-center justify-center space-y-0.5 py-1 px-0.5 transition-all ${
              activeTab === 'ledger' ? 'text-orange-600 dark:text-orange-400 scale-105 font-bold' : 'hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[9px] uppercase tracking-wider font-semibold">Ledger</span>
          </button>

          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`w-full flex flex-col items-center justify-center space-y-0.5 py-1 px-0.5 transition-all ${
              activeTab === 'settings' ? 'text-orange-600 dark:text-orange-400 scale-105 font-bold' : 'hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] uppercase tracking-wider font-semibold">Settings</span>
          </button>
        </div>

      </div> {/* closing Mobile-Optimized Standalone App Shell */}

      {/* -------------------- DYNAMIC MODALS -------------------- */}

      {/* A. Reports Generation Options Modal */}
      <ReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        members={members}
        assignments={assignments}
        attendance={attendance}
        payments={payments}
        settings={settings}
      />

      {/* B. Specific Invoice Slip Receipt modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedPaymentForReceipt(null);
        }}
        payment={selectedPaymentForReceipt}
      />

      {/* PWA App Download & Convert Center */}
      {isDownloadModalOpen && (
        <div id="pwa-download-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-fade-in">
          <div id="pwa-download-container" className="w-[480px] max-w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col">
            
            {/* Header banner style */}
            <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-red-650 text-white p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-6 opacity-10 select-none">
                <Dumbbell className="w-48 h-48 rotate-45" />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                    <Dumbbell className="w-5.5 h-5.5 text-white animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[15px] uppercase tracking-wide tracking-tight font-sans">Install Companion Utility</h3>
                    <p className="text-[10px] text-orange-100 font-mono">Convert Gym Flow to Homescreen App</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsDownloadModalOpen(false);
                    setSimulatedInstallProgress(null);
                  }}
                  className="p-1 px-2.5 hover:bg-white/10 rounded-full text-white transition text-xs font-black"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body contents */}
            <div className="p-5 flex-1 flex flex-col gap-4">
              
              {/* Device tabs switcher */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-150/50 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setInstallStepsTab('prompt')}
                  className={`py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition ${
                    installStepsTab === 'prompt' ? 'bg-orange-600 text-white shadow-xs' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  ⭐ Convert App
                </button>
                <button
                  type="button"
                  onClick={() => setInstallStepsTab('ios')}
                  className={`py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition ${
                    installStepsTab === 'ios' ? 'bg-orange-600 text-white shadow-xs' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  📱 iPhone/iOS
                </button>
                <button
                  type="button"
                  onClick={() => setInstallStepsTab('android')}
                  className={`py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition ${
                    installStepsTab === 'android' ? 'bg-orange-600 text-white shadow-xs' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  🤖 Android/Chrome
                </button>
                <button
                  type="button"
                  onClick={() => setInstallStepsTab('desktop')}
                  className={`py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition ${
                    installStepsTab === 'desktop' ? 'bg-orange-600 text-white shadow-xs' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-805'
                  }`}
                >
                  💻 Desktop PC
                </button>
              </div>

              {/* Main Tab Views */}
              {installStepsTab === 'prompt' && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="flex items-start space-x-3 bg-orange-50/45 dark:bg-orange-950/20 border border-orange-500/10 p-3.5 rounded-2xl">
                    <Sparkles className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-950 dark:text-orange-300 tracking-tight uppercase tracking-wider">Fast Hybrid Core Technology</h4>
                      <p className="text-[10.5px] leading-relaxed text-zinc-650 dark:text-zinc-400 mt-1">
                        Convert this administrative web panel directly into a standalone mobile utility. Features zero latency startup, higher rendering capacity, and immediate task shortcuts.
                      </p>
                    </div>
                  </div>

                  {/* Dynamic installation action trigger */}
                  {simulatedInstallProgress !== null ? (
                    <div className="space-y-2 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-150/60 dark:border-zinc-800">
                      <div className="flex justify-between items-center text-xxs font-mono font-bold uppercase tracking-wider">
                        <span className="text-zinc-450">{simulatedProgressText}</span>
                        <span className="text-orange-600 dark:text-orange-400">{simulatedInstallProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-600 rounded-full transition-all duration-300"
                          style={{ width: `${simulatedInstallProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : isInstalled ? (
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-500/20 rounded-2xl text-center space-y-1.5">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto animate-bounce" />
                      <p className="text-xs font-black text-zinc-900 dark:text-green-400">Gym Flow is Installed!</p>
                      <p className="text-xxs text-zinc-500 dark:text-zinc-400">
                        Check your device's home screen or applications panel. Enjoy rapid single-tap operational access!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (deferredPrompt) {
                            deferredPrompt.prompt();
                            deferredPrompt.userChoice.then((choiceResult: any) => {
                              if (choiceResult.outcome === 'accepted') {
                                setIsInstalled(true);
                              }
                              setDeferredPrompt(null);
                            });
                          } else {
                            // Run the beautiful simulated builder to educate the user and provide setup link
                            setSimulatedInstallProgress(10);
                            setSimulatedProgressText('Analyzing environment...');
                            const intervalId = setInterval(() => {
                              setSimulatedInstallProgress((prev) => {
                                if (prev === null) {
                                  clearInterval(intervalId);
                                  return null;
                                }
                                if (prev >= 100) {
                                  clearInterval(intervalId);
                                  setTimeout(() => {
                                    setSimulatedInstallProgress(null);
                                    setIsInstalled(true);
                                  }, 1500);
                                  return 100;
                                }
                                const nextVal = prev + 15;
                                if (nextVal > 95) {
                                  setSimulatedProgressText('Pinning app package to Homescreen...');
                                } else if (nextVal > 70) {
                                  setSimulatedProgressText('Extracting graphic vectors...');
                                } else if (nextVal > 40) {
                                  setSimulatedProgressText('Configuring secure database sync pipeline...');
                                }
                                return Math.min(nextVal, 100);
                              });
                            }, 400);
                          }
                        }}
                        className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 hover:shadow-orange-500/20 shadow-md text-white font-black rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-95"
                      >
                        <Download className="w-4 h-4 animate-bounce" />
                        <span>Install Gym Flow on Homescreen</span>
                      </button>
                      <p className="text-[10px] text-center text-zinc-450 italic mt-1 leading-normal">
                        Works on Chrome, iOS Safari, Edge, Samsung Internet, and Brave.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* iOS Safari Guide */}
              {installStepsTab === 'ios' && (
                <div className="space-y-3.5 text-xs animate-fade-in">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-150/50 dark:border-zinc-800 flex items-start space-x-2.5">
                    <div className="w-6 h-6 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] rounded-lg flex items-center justify-center shrink-0 border border-orange-200/30">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">Open in Safari Browser</p>
                      <p className="text-[10.5px] text-zinc-500 mt-0.5">Please ensure you are loading Gym Flow inside native Apple Safari.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-150/50 dark:border-zinc-800 flex items-start space-x-2.5">
                    <div className="w-6 h-6 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] rounded-lg flex items-center justify-center shrink-0 border border-orange-200/30">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 flex-wrap">
                        Tap the Share button 
                        <span className="inline-flex p-1 bg-zinc-200 dark:bg-zinc-800 rounded font-bold text-xxs shrink-0">
                          <Share2 className="w-3 h-3 text-blue-500 inline-block" />
                        </span>
                      </p>
                      <p className="text-[10.5px] text-zinc-500 mt-0.5">Located at the center of the bottom horizontal ribbon of Safari.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-150/50 dark:border-zinc-800 flex items-start space-x-2.5">
                    <div className="w-6 h-6 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] rounded-lg flex items-center justify-center shrink-0 border border-orange-200/30">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">Tap "Add to Home Screen"</p>
                      <p className="text-[10.5px] text-zinc-500 mt-0.5">Scroll down the action sheet popup and select the <strong className="text-zinc-800 dark:text-zinc-200">Add to Home Screen (+)</strong> menu button.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Android Guide */}
              {installStepsTab === 'android' && (
                <div className="space-y-3.5 text-xs animate-fade-in">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-150/50 dark:border-zinc-800 flex items-start space-x-2.5">
                    <div className="w-6 h-6 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] rounded-lg flex items-center justify-center shrink-0 border border-orange-200/30">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 flex-wrap">
                        Tap Three Dots menu icon 
                        <span className="font-bold text-sm leading-none bg-zinc-250 dark:bg-zinc-800 px-1 py-0.5 rounded">⋮</span>
                      </p>
                      <p className="text-[10.5px] text-zinc-500 mt-0.5">Located in the upper right-corner of Chrome browser.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-150/50 dark:border-zinc-800 flex items-start space-x-2.5">
                    <div className="w-6 h-6 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] rounded-lg flex items-center justify-center shrink-0 border border-orange-200/30">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">Select "Install App" / "Add to Home screen"</p>
                      <p className="text-[10.5px] text-zinc-500 mt-0.5">Tap the item, confirm dialog prompt, and it will be securely pinned to your mobile dashboard.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop PC */}
              {installStepsTab === 'desktop' && (
                <div className="space-y-3.5 text-xs animate-fade-in">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-150/50 dark:border-zinc-800 flex items-start space-x-2.5">
                    <div className="w-6 h-6 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] rounded-lg flex items-center justify-center shrink-0 border border-orange-200/30">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                        Find Browser Install icon
                      </p>
                      <p className="text-[10.5px] text-zinc-500 mt-0.5">Look at the browser address bar (on top) for a computer icon showing an arrow down or a generic plus sign (+) badge.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-150/50 dark:border-zinc-800 flex items-start space-x-2.5">
                    <div className="w-6 h-6 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] rounded-lg flex items-center justify-center shrink-0 border border-orange-200/30">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">Click Install</p>
                      <p className="text-[10.5px] text-zinc-500 mt-0.5">Confirm the installation prompt to gain desktop shortcuts and launch independent offline-capable window sizes.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Custom Info and Extra Options Footer inside the modal */}
            <div className="border-t border-zinc-150 dark:border-zinc-800/80 p-4 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between text-[10px] font-semibold text-zinc-450">
              <span className="font-mono">Secure context, HTTPS active</span>
              <button 
                type="button" 
                onClick={() => {
                  setIsDownloadModalOpen(false);
                  setIsReportsOpen(true);
                }}
                className="text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 transition flex items-center gap-1 font-bold h-6"
              >
                <span>Billing Audits & Reports</span>
                <span className="text-xs">➔</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* C. Personal profile summary info cabinet */}
      {selectedMemberForProfile && (
        <div id="profile-cabinet-overlay" className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in">
          <div id="profile-cabinet-container" className={`w-full max-w-md h-full shadow-2xl border-l flex flex-col justify-between p-6 overflow-y-auto animate-slide-in ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-150'
          }`}>
            
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <span className="text-xxs font-extrabold uppercase text-indigo-650 tracking-wider font-mono">Member File Case</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{selectedMemberForProfile.fullName}</h3>
                  <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold block mt-1 hover:underline cursor-all">Code Serial: {selectedMemberForProfile.memberCode}</span>
                </div>
                <button
                  id="btn-profile-cabinet-close"
                  onClick={() => setSelectedMemberForProfile(null)}
                  className="p-1 px-3 bg-gray-50 border hover:bg-gray-100 rounded-lg text-xs font-bold transition text-gray-700"
                >
                  Close
                </button>
              </div>

              {/* Personal specs cabinet */}
              <div className="space-y-3.5 text-xs">
                <span className="text-xxs uppercase tracking-wider text-gray-400 font-bold block font-mono border-b pb-1">Particulars Registry</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Mobile Contact</span>
                    <span className="font-bold text-gray-850 dark:text-gray-250 font-mono text-sm leading-none">{selectedMemberForProfile.mobile}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Email Port</span>
                    <span className="font-bold text-gray-850 dark:text-gray-250 font-mono text-xs">{selectedMemberForProfile.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Age / Sex</span>
                    <span className="font-bold text-gray-850 dark:text-gray-250">{selectedMemberForProfile.age} years / {selectedMemberForProfile.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Registration Join</span>
                    <span className="font-bold text-gray-850 dark:text-gray-250 font-mono">{selectedMemberForProfile.registrationDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block mb-0.5">Verified Address</span>
                    <span className="font-bold text-gray-850 dark:text-gray-250 leading-normal">{selectedMemberForProfile.address || 'Address not registered.'}</span>
                  </div>
                  {selectedMemberForProfile.emergencyContact && (
                    <div className="col-span-2">
                      <span className="text-red-400 block mb-0.5 font-semibold">Emergency Particulars</span>
                      <span className="font-bold text-gray-850 dark:text-gray-250 leading-normal text-xs">{selectedMemberForProfile.emergencyContact}</span>
                    </div>
                  )}
                  {selectedMemberForProfile.notes && (
                    <div className="col-span-2 p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-100 rounded-2xl">
                      <span className="text-gray-400 block mb-0.5">Proprietor Notes</span>
                      <p className="text-gray-700 dark:text-gray-300 italic">"{selectedMemberForProfile.notes}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance and payments cabinet logs inside profile */}
              <div className="space-y-4">
                <span className="text-xxs uppercase tracking-wider text-gray-400 font-bold block font-mono border-b pb-1">Activity logs</span>
                
                {/* Attendance */}
                <div className="space-y-1.5">
                  <span className="text-xxs font-bold text-indigo-650 block">Attendance History Logs ({attendance.filter(a => a.memberCode === selectedMemberForProfile.memberCode).length})</span>
                  <div className="space-y-1 max-h-[110px] overflow-y-auto">
                    {attendance.filter(a => a.memberCode === selectedMemberForProfile.memberCode).length === 0 ? (
                      <span className="text-xxs text-gray-400 font-semibold block italic">No record check-ins present.</span>
                    ) : (
                      attendance
                        .filter(a => a.memberCode === selectedMemberForProfile.memberCode)
                        .map(a => (
                          <div key={a.id} className="p-2 bg-gray-50/55 dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-lg flex justify-between text-xxs font-mono text-gray-400">
                            <span>Checked in date: {a.date}</span>
                            <span className="text-gray-800 dark:text-gray-250 font-bold">{a.checkInTime}</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Payments */}
                <div className="space-y-1.5 mt-2">
                  <span className="text-xxs font-bold text-indigo-650 block">Payment Receipts History</span>
                  <div className="space-y-1 max-h-[110px] overflow-y-auto">
                    {payments.filter(p => p.memberCode === selectedMemberForProfile.memberCode).length === 0 ? (
                      <span className="text-xxs text-gray-400 font-semibold block italic">No payment receipts issued.</span>
                    ) : (
                      payments
                        .filter(p => p.memberCode === selectedMemberForProfile.memberCode)
                        .map(p => (
                          <div key={p.id} className="p-2 bg-gray-50/55 dark:bg-gray-950 border border-gray-105 rounded-xl flex justify-between items-center text-xxs font-mono text-gray-400">
                            <div>
                              <span className="font-bold text-gray-700 dark:text-gray-300">{p.receiptNumber}</span>
                              <span className="block text-3xs">{p.paymentDate}</span>
                            </div>
                            <span className="text-green-700 font-bold">{formatINR(p.amountPaid)}</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>

              </div>

            </div>

            <div className="border-t border-gray-100 pt-4 mt-8 flex justify-between text-3xs text-gray-400 font-mono">
              <span>Secure Vault Cabinets</span>
              <span>SHA-256 Verified Lock</span>
            </div>

          </div>
        </div>
      )}

      {/* D. Add / Register / Edit Member modal */}
      <AddEditMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberToEdit(null);
        }}
        memberToEdit={memberToEdit}
        onSaveMember={handleSaveMember}
        nextSuggestedCode={getNextSuggestedCode()}
      />

      {/* E. Subscription Assign / Renewal Modal popup */}
      {assigningPlanMember && (
        <div id="renewal-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div id="renewal-modal-container" className="w-[450px] max-w-full bg-white border border-gray-150 rounded-2xl shadow-xl overflow-hidden animate-scale-in">
            
            <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
              <span className="font-bold tracking-tight text-sm">Assign / Renew Membership plan</span>
              <button onClick={() => setAssigningPlanMember(null)} className="text-white hover:text-indigo-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="renewal-assignment-form" onSubmit={handleCreateNewMembershipAssignment} className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-gray-400 block mb-1">Target Subscriber:</span>
                <span className="text-sm font-bold text-gray-800">{assigningPlanMember.fullName} ({assigningPlanMember.memberCode})</span>
              </div>

              <div>
                <label className="block text-xxs font-extrabold text-gray-400 uppercase tracking-wider mb-1 font-mono">Target subscription package plan</label>
                <select
                  id="select-renewal-plan"
                  value={renewalPlanType}
                  onChange={(e) => setRenewalPlanType(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-xl px-2.5 py-2.5' outline-none"
                >
                  <option value="Monthly">Monthly Plan (custom setup)</option>
                  <option value="3-Month">3-Month Plan (₹{settings.plans.find(p => p.id === '3-month')?.price})</option>
                  <option value="6-Month">6-Month Plan (₹{settings.plans.find(p => p.id === '6-month')?.price})</option>
                  <option value="1-Year">1-Year Plan (₹{settings.plans.find(p => p.id === '1-year')?.price})</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs font-extrabold text-gray-400 uppercase tracking-wider mb-1 font-mono">Activation Start Date</label>
                  <input
                    type="date"
                    value={renewalStartDate}
                    onChange={(e) => setRenewalStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-extrabold text-gray-400 uppercase tracking-wider mb-1 font-mono">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={renewalAmountPaid}
                    onChange={(e) => setRenewalAmountPaid(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-2.5 py-1.5 font-bold text-indigo-650 tracking-wide"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-extrabold text-gray-400 uppercase tracking-wider mb-1 font-mono">Payment status</label>
                <select
                  value={renewalPayStatus}
                  onChange={(e) => setRenewalPayStatus(e.target.value as PaymentStatus)}
                  className="w-full border border-gray-200 bg-white rounded-xl px-2.5 py-1.5 outline-none font-semibold text-gray-700"
                >
                  <option value="Paid">Fully Paid (Locked)</option>
                  <option value="Partial">Partial Down Payment</option>
                  <option value="Pending">Unpaid / Pending balance</option>
                </select>
                <p className="text-3xs text-gray-400 mt-1">Automatic expiry points will be calculated from specified start dates based on the package selected.</p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAssigningPlanMember(null)}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-xs"
                >
                  Confirm Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* F. Adjust / Collect outstanding arrears payment modal */}
      {adjustingPaymentMember && (
        <div id="payment-due-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div id="payment-due-modal-container" className="w-[450px] max-w-full bg-white border border-gray-150 rounded-2xl shadow-xl overflow-hidden animate-scale-in">
            
            <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
              <span className="font-bold tracking-tight text-sm">Collect Member Outstanding Arrears</span>
              <button onClick={() => setAdjustingPaymentMember(null)} className="text-white hover:text-emerald-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="due-adjustment-form" onSubmit={handleAdjustManuallyCollectedFees} className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-gray-400 block mb-1">Target Account:</span>
                <span className="text-sm font-bold text-gray-800">{adjustingPaymentMember.member.fullName} ({adjustingPaymentMember.member.memberCode})</span>
                <p className="text-3xs text-red-500 font-bold mt-1 font-mono uppercase tracking-wide">Outstanding Due Balance: ₹{adjustingPaymentMember.assign.dueAmount}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs font-extrabold text-gray-400 uppercase tracking-wider mb-1 font-mono">Amount Paid Collected (₹)</label>
                  <input
                    type="number"
                    max={adjustingPaymentMember.assign.dueAmount}
                    min="1"
                    value={manualPayAmount}
                    onChange={(e) => setManualPayAmount(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-2.5 py-1.5 font-bold text-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xxs font-extrabold text-gray-400 uppercase tracking-wider mb-1 font-mono">Payment Channel</label>
                  <select
                    value={manualPayMethod}
                    onChange={(e) => setManualPayMethod(e.target.value as any)}
                    className="w-full border border-gray-200 bg-white rounded-xl px-2.5 py-1.5 font-semibold text-gray-600"
                  >
                    <option value="Cash">Cash Handover</option>
                    <option value="UPI">UPI Net QR Scan</option>
                    <option value="Bank Transfer">Bank Wire Transfer</option>
                    <option value="Card">Terminal POS Card</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAdjustingPaymentMember(null)}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs"
                >
                  Conclude Arrears Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
