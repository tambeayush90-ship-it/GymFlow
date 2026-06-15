import { 
  Member, 
  MembershipAssignment, 
  Attendance, 
  PaymentRecord, 
  AdminSettings, 
  SubscriptionPlan,
  SystemNotification
} from './types';

// Default system settings
const DEFAULT_SETTINGS: AdminSettings = {
  plans: [
    { id: 'monthly', name: 'Monthly Plan', firstMonthFee: 1500, renewalFee: 1200, durationMonths: 1 },
    { id: '3-month', name: '3-Month Plan', price: 3000, durationMonths: 3 },
    { id: '6-month', name: '6-Month Plan', price: 5500, durationMonths: 6 },
    { id: '1-year', name: '1-Year Plan', price: 10000, durationMonths: 12 }
  ],
  adminPasswordHash: 'admin123', // Clean default password for admin settings
  smsProvider: 'Mock',
  smsApiKey: '',
  emailProvider: 'Mock',
  emailApiKey: '',
  reminderDailyAfterExpiry: true,
  reminderOnLastDay: true,
  reminder3DaysBefore: true,
  reminder7DaysBefore: true
};

// Helper to get formatted dates relative to today
export function getRelativeDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

// Generate high-quality realistic seed data
const SEED_MEMBERS: Member[] = [
  {
    id: 'm1',
    memberCode: 'GF101',
    fullName: 'Rajesh Kumar',
    age: 28,
    gender: 'Male',
    mobile: '9876543210',
    email: 'rajesh.kumar@email.com',
    address: 'Sector 15, Dwarka, New Delhi',
    registrationDate: getRelativeDateString(-180),
    emergencyContact: 'Suresh Kumar - 9876543211',
    notes: 'Preparing for powerlifting competition/Focus on strength',
    status: 'Active',
    password: 'password123'
  },
  {
    id: 'm2',
    memberCode: 'GF102',
    fullName: 'Priya Sharma',
    age: 24,
    gender: 'Female',
    mobile: '9123456789',
    email: 'priya.sharma@email.com',
    address: 'Andheri West, Mumbai',
    registrationDate: getRelativeDateString(-75),
    emergencyContact: 'Asha Sharma - 9123456780',
    notes: 'Yoga and general fitness',
    status: 'Active',
    password: 'password123'
  },
  {
    id: 'm3',
    memberCode: 'GF103',
    fullName: 'Amit Patel',
    age: 32,
    gender: 'Male',
    mobile: '9988776655',
    email: 'amit.patel@email.com',
    address: 'Satellite Road, Ahmedabad',
    registrationDate: getRelativeDateString(-15),
    emergencyContact: 'Nisha Patel - 9988776650',
    notes: 'Cardio focus and weight management',
    status: 'Active',
    password: 'password123'
  },
  {
    id: 'm4',
    memberCode: 'GF104',
    fullName: 'Vikram Singh',
    age: 29,
    gender: 'Male',
    mobile: '9443322110',
    email: 'vikram.singh@email.com',
    address: 'Vaishali Nagar, Jaipur',
    registrationDate: getRelativeDateString(-30),
    emergencyContact: 'Karan Singh - 9443322111',
    notes: 'Needs guidance on deadlifts',
    status: 'Active',
    password: 'password123'
  },
  {
    id: 'm5',
    memberCode: 'GF105',
    fullName: 'Anjali Gupta',
    age: 27,
    gender: 'Female',
    mobile: '9556677889',
    email: 'anjali.gupta@email.com',
    address: 'Indiranagar, Bengaluru',
    registrationDate: getRelativeDateString(-35),
    emergencyContact: 'Ramesh Gupta - 9556677880',
    notes: 'Slight lower back sensitivity',
    status: 'Active',
    password: 'password123'
  },
  {
    id: 'm6',
    memberCode: 'GF106',
    fullName: 'Sneha Reddy',
    age: 22,
    gender: 'Female',
    mobile: '9332211445',
    email: 'sneha.reddy@email.com',
    address: 'Gachibowli, Hyderabad',
    registrationDate: getRelativeDateString(-95),
    emergencyContact: 'Prasad Reddy - 9332211446',
    notes: 'Has gone out of town since early June',
    status: 'Inactive',
    password: 'password123'
  }
];

const SEED_ASSIGNMENTS: MembershipAssignment[] = [
  {
    id: 'a1',
    memberCode: 'GF101',
    planType: '1-Year',
    startDate: getRelativeDateString(-180),
    expiryDate: getRelativeDateString(180), // Expiring in 6 months
    amountPaid: 10000,
    dueAmount: 0,
    paymentStatus: 'Paid'
  },
  {
    id: 'a2',
    memberCode: 'GF102',
    planType: '3-Month',
    startDate: getRelativeDateString(-75),
    expiryDate: getRelativeDateString(15), // Expiring in 15 days (triggers 7-day and 3-day soon)
    amountPaid: 3000,
    dueAmount: 0,
    paymentStatus: 'Paid'
  },
  {
    id: 'a3',
    memberCode: 'GF103',
    planType: 'Monthly',
    startDate: getRelativeDateString(-15),
    expiryDate: getRelativeDateString(15), // Expiring in 15 days
    amountPaid: 1500, // First Month Fee
    dueAmount: 0,
    paymentStatus: 'Paid'
  },
  {
    id: 'a4',
    memberCode: 'GF104',
    planType: 'Monthly',
    startDate: getRelativeDateString(-30),
    expiryDate: getRelativeDateString(1), // Expiring tomorrow (triggers last day / 3 days / 7 days)
    amountPaid: 1200, // Renewal rate for testing
    dueAmount: 0,
    paymentStatus: 'Paid'
  },
  {
    id: 'a5',
    memberCode: 'GF105',
    planType: '6-Month',
    startDate: getRelativeDateString(-35),
    expiryDate: getRelativeDateString(145), // Expiring in ~145 days
    amountPaid: 4000,
    dueAmount: 1500, // Outstanding
    paymentStatus: 'Partial'
  },
  {
    id: 'a6',
    memberCode: 'GF106',
    planType: '3-Month',
    startDate: getRelativeDateString(-95),
    expiryDate: getRelativeDateString(-5), // Expired 5 days ago (triggers daily after expiry)
    amountPaid: 3000,
    dueAmount: 0,
    paymentStatus: 'Paid'
  }
];

// Seed attendance for the last 5 days
const generateSeedAttendance = (): Attendance[] => {
  const attendance: Attendance[] = [];
  const members = ['GF101', 'GF102', 'GF103', 'GF104', 'GF105'];
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Vikram Singh', 'Anjali Gupta'];
  
  // Last 5 days
  for (let i = 0; i < 5; i++) {
    const dateStr = getRelativeDateString(-i);
    // Let's check in 3-4 random members each day
    members.forEach((code, idx) => {
      // High check-in chance except Amit on day 4, etc.
      const hash = (idx + i) % 5;
      if (hash !== 0) {
        const hour = 6 + (idx % 3) * 2 + (i % 2); // 6am, 7am, 8am, 9am, 10am
        const minute = 15 + (idx * i * 3) % 45;
        attendance.push({
          id: `att_${code}__${dateStr}`,
          memberCode: code,
          memberName: names[idx],
          date: dateStr,
          checkInTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        });
      }
    });
  }
  return attendance;
};

const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: 'p1',
    receiptNumber: 'REC-2026-0001',
    memberCode: 'GF101',
    memberName: 'Rajesh Kumar',
    amountPaid: 10000,
    dueAmount: 0,
    paymentDate: getRelativeDateString(-180),
    paymentMethod: 'Bank Transfer',
    planType: '1-Year'
  },
  {
    id: 'p2',
    receiptNumber: 'REC-2026-0002',
    memberCode: 'GF102',
    memberName: 'Priya Sharma',
    amountPaid: 3000,
    dueAmount: 0,
    paymentDate: getRelativeDateString(-75),
    paymentMethod: 'UPI',
    planType: '3-Month'
  },
  {
    id: 'p3',
    receiptNumber: 'REC-2026-0003',
    memberCode: 'GF103',
    memberName: 'Amit Patel',
    amountPaid: 1500,
    dueAmount: 0,
    paymentDate: getRelativeDateString(-15),
    paymentMethod: 'Cash',
    planType: 'Monthly'
  },
  {
    id: 'p4',
    receiptNumber: 'REC-2026-0004',
    memberCode: 'GF104',
    memberName: 'Vikram Singh',
    amountPaid: 1200,
    dueAmount: 0,
    paymentDate: getRelativeDateString(-30),
    paymentMethod: 'UPI',
    planType: 'Monthly'
  },
  {
    id: 'p5',
    receiptNumber: 'REC-2026-0005',
    memberCode: 'GF105',
    memberName: 'Anjali Gupta',
    amountPaid: 4000,
    dueAmount: 1500,
    paymentDate: getRelativeDateString(-35),
    paymentMethod: 'Card',
    planType: '6-Month'
  }
];

const SEED_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'n1',
    type: 'sms',
    memberCode: 'GF106',
    memberName: 'Sneha Reddy',
    message: 'Hello Sneha Reddy, your Gym Flow membership expires on ' + getRelativeDateString(-5) + '. Please renew your subscription.',
    timestamp: getRelativeDateString(-4) + ' 10:15',
    status: 'Sent'
  }
];

// Primary Gym Flow Data Store
export class GymFlowStore {
  static getMembers(): Member[] {
    const data = localStorage.getItem('gf_members');
    if (!data) {
      localStorage.setItem('gf_members', JSON.stringify(SEED_MEMBERS));
      return SEED_MEMBERS;
    }
    return JSON.parse(data);
  }

  static saveMembers(members: Member[]): void {
    localStorage.setItem('gf_members', JSON.stringify(members));
  }

  static getAssignments(): MembershipAssignment[] {
    const data = localStorage.getItem('gf_assignments');
    if (!data) {
      localStorage.setItem('gf_assignments', JSON.stringify(SEED_ASSIGNMENTS));
      return SEED_ASSIGNMENTS;
    }
    return JSON.parse(data);
  }

  static saveAssignments(assignments: MembershipAssignment[]): void {
    localStorage.setItem('gf_assignments', JSON.stringify(assignments));
  }

  static getAttendance(): Attendance[] {
    const data = localStorage.getItem('gf_attendance');
    if (!data) {
      const seedAtt = generateSeedAttendance();
      localStorage.setItem('gf_attendance', JSON.stringify(seedAtt));
      return seedAtt;
    }
    return JSON.parse(data);
  }

  static saveAttendance(list: Attendance[]): void {
    localStorage.setItem('gf_attendance', JSON.stringify(list));
  }

  static getPayments(): PaymentRecord[] {
    const data = localStorage.getItem('gf_payments');
    if (!data) {
      localStorage.setItem('gf_payments', JSON.stringify(SEED_PAYMENTS));
      return SEED_PAYMENTS;
    }
    return JSON.parse(data);
  }

  static savePayments(list: PaymentRecord[]): void {
    localStorage.setItem('gf_payments', JSON.stringify(list));
  }

  static getSettings(): AdminSettings {
    const data = localStorage.getItem('gf_settings');
    if (!data) {
      localStorage.setItem('gf_settings', JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(data);
  }

  static saveSettings(settings: AdminSettings): void {
    localStorage.setItem('gf_settings', JSON.stringify(settings));
  }

  static getNotifications(): SystemNotification[] {
    const data = localStorage.getItem('gf_notifications');
    if (!data) {
      localStorage.setItem('gf_notifications', JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    }
    return JSON.parse(data);
  }

  static saveNotifications(notifications: SystemNotification[]): void {
    localStorage.setItem('gf_notifications', JSON.stringify(notifications));
  }

  static getOnboardingStatus(): boolean {
    const status = localStorage.getItem('gf_onboarding_completed');
    return status === 'true';
  }

  static setOnboardingStatus(completed: boolean): void {
    localStorage.setItem('gf_onboarding_completed', String(completed));
  }

  // Backup and Restore
  static exportFullBackup(): string {
    const backup = {
      gf_members: this.getMembers(),
      gf_assignments: this.getAssignments(),
      gf_attendance: this.getAttendance(),
      gf_payments: this.getPayments(),
      gf_settings: this.getSettings(),
      gf_notifications: this.getNotifications(),
      gf_onboarding_completed: this.getOnboardingStatus()
    };
    return JSON.stringify(backup, null, 2);
  }

  static importFullBackup(jsonString: string): boolean {
    try {
      const backup = JSON.parse(jsonString);
      if (backup.gf_members) localStorage.setItem('gf_members', JSON.stringify(backup.gf_members));
      if (backup.gf_assignments) localStorage.setItem('gf_assignments', JSON.stringify(backup.gf_assignments));
      if (backup.gf_attendance) localStorage.setItem('gf_attendance', JSON.stringify(backup.gf_attendance));
      if (backup.gf_payments) localStorage.setItem('gf_payments', JSON.stringify(backup.gf_payments));
      if (backup.gf_settings) localStorage.setItem('gf_settings', JSON.stringify(backup.gf_settings));
      if (backup.gf_notifications) localStorage.setItem('gf_notifications', JSON.stringify(backup.gf_notifications));
      if (backup.gf_onboarding_completed !== undefined) {
        localStorage.setItem('gf_onboarding_completed', String(backup.gf_onboarding_completed));
      }
      return true;
    } catch (e) {
      console.error('Backup import error', e);
      return false;
    }
  }

  static resetToDefault(): void {
    localStorage.removeItem('gf_members');
    localStorage.removeItem('gf_assignments');
    localStorage.removeItem('gf_attendance');
    localStorage.removeItem('gf_payments');
    localStorage.removeItem('gf_settings');
    localStorage.removeItem('gf_notifications');
    localStorage.removeItem('gf_onboarding_completed');
  }
}

// Compute Days remaining from today
export function getDaysRemaining(expiryDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Generate notification messages and triggers
export function generateRenewalReminderMessage(memberName: string, expiryDate: string): string {
  return `Hello ${memberName}, your Gym Flow membership expires on ${expiryDate}. Please renew your subscription.`;
}

// Detect which reminders are due and build alerts listed inside dashboards
export interface RenewalRemindersReport {
  memberCode: string;
  memberName: string;
  expiryDate: string;
  daysRemaining: number;
  reminderType: 'daily_after' | 'last_day' | '3_days' | '7_days' | 'none';
  message: string;
}

export function getActiveReminders(
  members: Member[], 
  assignments: MembershipAssignment[], 
  settings: AdminSettings
): RenewalRemindersReport[] {
  const reports: RenewalRemindersReport[] = [];

  assignments.forEach(assign => {
    const member = members.find(m => m.memberCode === assign.memberCode);
    if (!member || member.status === 'Inactive') return;

    const days = getDaysRemaining(assign.expiryDate);
    let type: 'daily_after' | 'last_day' | '3_days' | '7_days' | 'none' = 'none';

    if (days < 0 && settings.reminderDailyAfterExpiry) {
      type = 'daily_after';
    } else if (days === 1 && settings.reminderOnLastDay) {
      type = 'last_day';
    } else if (days === 3 && settings.reminder3DaysBefore) {
      type = '3_days';
    } else if (days === 7 && settings.reminder7DaysBefore) {
      type = '7_days';
    }

    if (type !== 'none') {
      reports.push({
        memberCode: assign.memberCode,
        memberName: member.fullName,
        expiryDate: assign.expiryDate,
        daysRemaining: days,
        reminderType: type,
        message: generateRenewalReminderMessage(member.fullName, assign.expiryDate)
      });
    }
  });

  return reports;
}

// Utility to calculate auto-expiry date based on plan months starting from input date
export function calculateExpiryDate(startDateStr: string, planType: 'Monthly' | '3-Month' | '6-Month' | '1-Year'): string {
  const start = new Date(startDateStr);
  let monthsToAdd = 1;
  if (planType === '3-Month') monthsToAdd = 3;
  else if (planType === '6-Month') monthsToAdd = 6;
  else if (planType === '1-Year') monthsToAdd = 12;

  start.setMonth(start.getMonth() + monthsToAdd);
  // Subtract 1 day so that start=01-01 ends 1-month plan on 31-01 (standard membership period)
  start.setDate(start.getDate() - 1);
  return start.toISOString().split('T')[0];
}

// Format numbers as INR currency symbol
export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
}
