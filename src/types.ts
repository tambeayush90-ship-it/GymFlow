export interface SubscriptionPlan {
  id: 'monthly' | '3-month' | '6-month' | '1-year';
  name: string;
  firstMonthFee?: number; // Only for monthly plan
  renewalFee?: number;    // Only for monthly plan
  price?: number;         // For fixed plans (3-month, 6-month, 1-year)
  durationMonths: number;
}

export type Gender = 'Male' | 'Female' | 'Other';
export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Card';
export type PaymentStatus = 'Paid' | 'Pending' | 'Partial';
export type MemberStatus = 'Active' | 'Inactive';

export interface Member {
  id: string; // Internal UUID or unique ID
  memberCode: string; // Display/Onboarding code (e.g. GF001)
  fullName: string;
  age: number;
  gender: Gender;
  mobile: string;
  email: string;
  address: string;
  registrationDate: string; // YYYY-MM-DD
  emergencyContact?: string;
  notes?: string;
  status: MemberStatus;
  password?: string; // Reset password feature
}

export interface MembershipAssignment {
  id: string;
  memberCode: string;
  planType: 'Monthly' | '3-Month' | '6-Month' | '1-Year';
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  amountPaid: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
}

export interface Attendance {
  id: string;
  memberCode: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  memberCode: string;
  memberName: string;
  amountPaid: number;
  dueAmount: number;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  planType: 'Monthly' | '3-Month' | '6-Month' | '1-Year';
}

export interface AdminSettings {
  plans: SubscriptionPlan[];
  adminPasswordHash: string; // Password to secure settings/reset passwords
  smsProvider: 'Twilio' | 'Fast2SMS' | 'Msg91' | 'Mock';
  smsApiKey: string;
  emailProvider: 'SendGrid' | 'Mailgun' | 'SMTP' | 'Mock';
  emailApiKey: string;
  reminderDailyAfterExpiry: boolean;
  reminderOnLastDay: boolean;
  reminder3DaysBefore: boolean;
  reminder7DaysBefore: boolean;
}

export interface SystemNotification {
  id: string;
  type: 'sms' | 'email' | 'alert';
  memberCode: string;
  memberName: string;
  message: string;
  timestamp: string; // YYYY-MM-DD HH:MM
  status: 'Sent' | 'Failed' | 'Pending';
}
