import { useState, FormEvent } from 'react';
import { 
  History, 
  HelpCircle, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  ChevronRight, 
  UserPlus2 
} from 'lucide-react';
import { Gender, Member, MembershipAssignment, PaymentRecord } from '../types';
import { calculateExpiryDate, formatINR, getRelativeDateString } from '../dataStore';

interface OnboardingMigrationProps {
  onOnboardComplete: (member: Member, assignment: MembershipAssignment, payment: PaymentRecord) => void;
  onDismiss: () => void;
}

export default function OnboardingMigration({ 
  onOnboardComplete, 
  onDismiss 
}: OnboardingMigrationProps) {
  // Input states
  const [memberCode, setMemberCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<Gender>('Male');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  const [originalJoinDate, setOriginalJoinDate] = useState(getRelativeDateString(-90));
  const [planType, setPlanType] = useState<'Monthly' | '3-Month' | '6-Month' | '1-Year'>('3-Month');
  const [remainingDays, setRemainingDays] = useState<number>(30);
  const [lastPaymentDate, setLastPaymentDate] = useState(getRelativeDateString(-60));
  const [amountPaid, setAmountPaid] = useState<number>(3000);

  const [validationError, setValidationError] = useState('');
  const [onboardedCount, setOnboardedCount] = useState<number>(0);

  const handleSubmitOnboarding = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!memberCode.trim() || !fullName.trim() || !mobile.trim()) {
      setValidationError('Please fill in Member Code, Full Name, and Mobile Number.');
      return;
    }

    // Auto calculate Expiry date: Today + remainingDays
    const today = new Date();
    today.setDate(today.getDate() + remainingDays);
    const calculatedExpiry = today.toISOString().split('T')[0];

    const newMember: Member = {
      id: `m_hist_${Date.now()}`,
      memberCode: memberCode.trim().toUpperCase(),
      fullName: fullName.trim(),
      age: Number(age),
      gender,
      mobile: mobile.trim(),
      email: email.trim() || `${memberCode.trim().toLowerCase()}@gymflow.com`,
      address: address.trim() || 'Imported via Migration',
      registrationDate: originalJoinDate,
      notes: notes.trim() ? `[MIGRATION RECORD] ${notes}` : '[MIGRATION RECORD]',
      status: 'Active',
      password: 'password123'
    };

    const newAssignment: MembershipAssignment = {
      id: `a_hist_${Date.now()}`,
      memberCode: memberCode.trim().toUpperCase(),
      planType,
      startDate: originalJoinDate,
      expiryDate: calculatedExpiry,
      amountPaid: Number(amountPaid),
      dueAmount: 0,
      paymentStatus: 'Paid'
    };

    const newPayment: PaymentRecord = {
      id: `p_hist_${Date.now()}`,
      receiptNumber: `REC-MIG-${String(Math.floor(1000 + Math.random() * 9000))}`,
      memberCode: memberCode.trim().toUpperCase(),
      memberName: fullName.trim(),
      amountPaid: Number(amountPaid),
      dueAmount: 0,
      paymentDate: lastPaymentDate,
      paymentMethod: 'Cash',
      planType
    };

    onOnboardComplete(newMember, newAssignment, newPayment);
    
    // Increment counter
    setOnboardedCount(prev => prev + 1);

    // Clear main fields, auto-increment member code sample
    setFullName('');
    setMobile('');
    setEmail('');
    setNotes('');
    
    // Helpfully suggest next code GF107 etc. if input is standard
    const match = memberCode.match(/^([a-zA-Z]+)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const num = parseInt(match[2]) + 1;
      setMemberCode(`${prefix}${num}`);
    } else {
      setMemberCode('');
    }
  };

  return (
    <div id="onboarding-container" className="bg-orange-50/10 dark:bg-orange-950/5 border border-orange-500/20 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-xs">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-16 -mt-16 opacity-45"></div>

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-orange-100/50 dark:bg-orange-950/30 rounded-2xl text-orange-655 dark:text-orange-400 shrink-0">
            <History className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-orange-200 dark:bg-orange-950/50 text-orange-900 dark:text-orange-400 rounded text-xxs font-bold uppercase tracking-wider font-mono">Setup System</span>
              <h3 className="text-xl font-bold text-orange-900 dark:text-orange-400 tracking-tight font-sans">Legacy Data Onboarding & Migration</h3>
            </div>
            <p className="text-sm text-orange-800/80 dark:text-zinc-400 max-w-2xl mt-1">
              Onboard existing pre-app members. Entering remaining membership days will automatically compute transition parameters and renew dates.
            </p>
          </div>
        </div>

        <button
          id="btn-dismiss-onboarding"
          onClick={onDismiss}
          className="p-1 px-3 bg-white dark:bg-zinc-900 hover:bg-orange-50 dark:hover:bg-zinc-800 border border-orange-200 dark:border-zinc-800 text-orange-800 dark:text-orange-400 rounded-xl text-xs font-semibold shadow-xs transition"
        >
          Close Onboarding Wizard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Wizard Form */}
        <form id="migration-wizard-form" onSubmit={handleSubmitOnboarding} className="lg:col-span-2 bg-white dark:bg-zinc-90 w-full p-6 rounded-2xl border border-orange-200 dark:border-zinc-850 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center space-x-1.5 border-b border-zinc-150 dark:border-zinc-805 pb-2">
            <UserPlus2 className="w-4 h-4 text-orange-600" />
            <span>Member Transition Fields</span>
          </h4>

          {validationError && (
            <div className="p-3 bg-red-50 dark:bg-red-955/20 border-l-4 border-red-500 rounded text-xs font-bold text-red-700 dark:text-red-400 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1">Unique Member Code *</label>
              <input
                id="onboard-code"
                type="text"
                placeholder="e.g. GF107"
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                className="w-full text-sm font-semibold border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-2 hover:border-zinc-350 focus:border-orange-500 outline-none tracking-wide transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1">Full Name *</label>
              <input
                id="onboard-name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-sm border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-2 hover:border-zinc-350 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1">Mobile Number *</label>
              <input
                id="onboard-mobile"
                type="tel"
                placeholder="e.g. 9812345678"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full text-sm border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-2 hover:border-zinc-350 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1">Email (Optional)</label>
              <input
                id="onboard-email"
                type="email"
                placeholder="e.g. rahul@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-2 hover:border-zinc-350 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1">Age</label>
              <input
                id="onboard-age"
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full text-sm border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1">Gender</label>
              <select
                id="onboard-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full text-sm bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition text-zinc-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="border-t border-zinc-150 dark:border-zinc-800 my-4 pt-4">
            <span className="text-xs font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wide block mb-3 font-mono">Legacy Dates & Payments</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1">Original Registration date</label>
                <input
                  id="onboard-join-date"
                  type="date"
                  value={originalJoinDate}
                  onChange={(e) => setOriginalJoinDate(e.target.value)}
                  className="w-full text-sm border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1">Current Active Plan Type</label>
                <select
                  id="onboard-plan"
                  value={planType}
                  onChange={(e) => {
                    setPlanType(e.target.value as any);
                    if (e.target.value === 'Monthly') setAmountPaid(1500);
                    else if (e.target.value === '3-Month') setAmountPaid(3000);
                    else if (e.target.value === '6-Month') setAmountPaid(5500);
                    else setAmountPaid(10000);
                  }}
                  className="w-full text-sm bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition text-zinc-900 dark:text-white"
                >
                  <option value="Monthly">Monthly Plan</option>
                  <option value="3-Month">3-Month Plan</option>
                  <option value="6-Month">6-Month Plan</option>
                  <option value="1-Year">1-Year Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1">Remaining Membership Duration (Days)</label>
                <input
                  id="onboard-remaining-days"
                  type="number"
                  min="0"
                  value={remainingDays}
                  onChange={(e) => setRemainingDays(Number(e.target.value))}
                  className="w-full text-sm font-bold text-orange-600 border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950"
                />
                <p className="text-xxs text-zinc-400 mt-1">Calculates automatic renewal point in {remainingDays} days.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1">Last Payment Collected (Date)</label>
                <input
                  id="onboard-last-payment-date"
                  type="date"
                  value={lastPaymentDate}
                  onChange={(e) => setLastPaymentDate(e.target.value)}
                  className="w-full text-sm border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              id="btn-submit-migration"
              type="submit"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-full text-xs shadow-md shadow-orange-550/15 transition flex items-center space-x-2"
            >
              <span>Onboard Legacy Member</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Informative Side Info Card */}
        <div id="migration-info-panel" className="bg-orange-50/10 dark:bg-zinc-900/30 border border-orange-500/20 p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-orange-900 dark:text-orange-400 font-mono">Transition Guide</h4>
            
            <div className="space-y-3 text-xs text-orange-950 dark:text-zinc-300 leading-relaxed">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-1.5 shrink-0"></div>
                <p>The system computes **days remaining** from today based on the number specified above.</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-1.5 shrink-0"></div>
                <p>A renewal prompt alerts you on Dashboard and Settings daily once this countdown hits negative values.</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-1.5 shrink-0"></div>
                <p>Last historical payment is recorded to give you pristine, coherent revenue metrics immediately.</p>
              </div>
            </div>

            <div className="p-3 bg-orange-100/30 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-500/10 rounded-xl flex items-center space-x-2 text-xs text-orange-800 dark:text-orange-400">
              <HelpCircle className="w-4.5 h-4.5 shrink-0" />
              <span>Perfect for moving spreadsheets to Gym Flow.</span>
            </div>
          </div>

          <div className="pt-6 border-t border-orange-200 dark:border-zinc-805 mt-6 md:mt-0">
            <span className="text-xxs uppercase tracking-wider text-orange-850 dark:text-zinc-450 font-bold block mb-1 font-mono">Migration Session Total</span>
            <div className="flex items-center space-x-2 text-sm text-orange-900 dark:text-orange-400 font-bold">
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
              <span>{onboardedCount} Member{onboardedCount !== 1 ? 's' : ''} Transitioned</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
