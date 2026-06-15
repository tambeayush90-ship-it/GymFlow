import { useState, useEffect, FormEvent } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Heart, MessageSquare, ShieldAlert } from 'lucide-react';
import { Member, MembershipAssignment, Gender, MemberStatus, PaymentStatus } from '../types';
import { getRelativeDateString, calculateExpiryDate } from '../dataStore';

interface AddEditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit: Member | null;
  onSaveMember: (member: Member, startingPlan?: {
    planType: 'Monthly' | '3-Month' | '6-Month' | '1-Year';
    startDate: string;
    amountPaid: number;
    paymentStatus: PaymentStatus;
  }) => void;
  nextSuggestedCode: string;
}

export default function AddEditMemberModal({
  isOpen,
  onClose,
  memberToEdit,
  onSaveMember,
  nextSuggestedCode
}: AddEditMemberModalProps) {
  // Member Fields
  const [memberCode, setMemberCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<Gender>('Male');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<MemberStatus>('Active');
  const [registrationDate, setRegistrationDate] = useState('');

  // Starting Subscription Fields (For new registrations only)
  const [assignPlan, setAssignPlan] = useState<boolean>(true);
  const [startingPlanType, setStartingPlanType] = useState<'Monthly' | '3-Month' | '6-Month' | '1-Year'>('Monthly');
  const [startingPlanStartDate, setStartingPlanStartDate] = useState(getRelativeDateString(0));
  const [amountPaid, setAmountPaid] = useState<number>(1500); // Defaults to monthly
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (memberToEdit) {
      setMemberCode(memberToEdit.memberCode);
      setFullName(memberToEdit.fullName);
      setAge(memberToEdit.age);
      setGender(memberToEdit.gender);
      setMobile(memberToEdit.mobile);
      setEmail(memberToEdit.email);
      setAddress(memberToEdit.address);
      setEmergencyContact(memberToEdit.emergencyContact || '');
      setNotes(memberToEdit.notes || '');
      setStatus(memberToEdit.status);
      setRegistrationDate(memberToEdit.registrationDate);
      setAssignPlan(false); // Do not prompt reassignment directly in edit modal
    } else {
      setMemberCode(nextSuggestedCode);
      setFullName('');
      setAge(25);
      setGender('Male');
      setMobile('');
      setEmail('');
      setAddress('');
      setEmergencyContact('');
      setNotes('');
      setStatus('Active');
      setRegistrationDate(getRelativeDateString(0));
      setAssignPlan(true);
      setStartingPlanType('Monthly');
      setStartingPlanStartDate(getRelativeDateString(0));
      setAmountPaid(1500);
      setPaymentStatus('Paid');
    }
    setValidationError('');
  }, [memberToEdit, nextSuggestedCode, isOpen]);

  // Adjust default payment amount when plan type changes in registration
  useEffect(() => {
    if (!memberToEdit) {
      if (startingPlanType === 'Monthly') setAmountPaid(1500);
      else if (startingPlanType === '3-Month') setAmountPaid(3000);
      else if (startingPlanType === '6-Month') setAmountPaid(5500);
      else if (startingPlanType === '1-Year') setAmountPaid(10000);
    }
  }, [startingPlanType, memberToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!memberCode.trim() || !fullName.trim() || !mobile.trim()) {
      setValidationError('Please enter Member Code, Full Name, and Mobile Number.');
      return;
    }

    const payloadMember: Member = {
      id: memberToEdit ? memberToEdit.id : `m_${Date.now()}`,
      memberCode: memberCode.trim().toUpperCase(),
      fullName: fullName.trim(),
      age: Number(age),
      gender,
      mobile: mobile.trim(),
      email: email.trim(),
      address: address.trim(),
      emergencyContact: emergencyContact.trim(),
      notes: notes.trim(),
      status,
      registrationDate,
      password: memberToEdit?.password || 'password123'
    };

    const payloadPlan = (!memberToEdit && assignPlan) ? {
      planType: startingPlanType,
      startDate: startingPlanStartDate,
      amountPaid: Number(amountPaid),
      paymentStatus
    } : undefined;

    onSaveMember(payloadMember, payloadPlan);
  };

  return (
    <div id="member-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div id="member-modal-container" className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-scale-in my-8">
        
        {/* Modal Header */}
        <div className="bg-zinc-950 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-orange-500" />
            <span className="font-extrabold tracking-tight font-sans text-sm">{memberToEdit ? 'Edit Member Profile' : 'Register New Member'}</span>
          </div>
          <button id="btn-modal-close" onClick={onClose} className="text-zinc-400 hover:text-white transition p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form id="member-registration-form" onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-900">
          
          {validationError && (
            <div className="p-3.5 bg-red-50 dark:bg-red-955/20 border-l-4 border-red-500 rounded text-xs font-bold text-red-700 dark:text-red-400 flex items-center space-x-2">
              <ShieldAlert className="w-4.5 h-4.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Personal Particulars */}
          <div>
            <span className="text-xxs font-extrabold uppercase font-mono tracking-widest text-orange-600 dark:text-orange-400 block mb-3">1. Personal Information</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase mb-1">Member Code *</label>
                <input
                  id="form-member-code"
                  type="text"
                  placeholder="e.g. GF101"
                  value={memberCode}
                  onChange={(e) => setMemberCode(e.target.value)}
                  className="w-full text-sm font-semibold border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 hover:border-zinc-300 focus:border-orange-500 outline-none tracking-wide transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase mb-1">Full Name *</label>
                <input
                  id="form-full-name"
                  type="text"
                  placeholder="e.g. Vinay Patil"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 hover:border-zinc-300 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase mb-1">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    id="form-mobile"
                    type="tel"
                    placeholder="e.g. 9811223344"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 hover:border-zinc-300 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white animate-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    id="form-email"
                    type="email"
                    placeholder="e.g. vinay@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 hover:border-zinc-300 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase mb-1">Age</label>
                  <input
                    id="form-age"
                    type="number"
                    min="1"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 hover:border-zinc-300 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-445 uppercase mb-1">Gender</label>
                  <select
                    id="form-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition text-zinc-900 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase mb-1">Registration Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    id="form-reg-date"
                    type="date"
                    value={registrationDate}
                    onChange={(e) => setRegistrationDate(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 hover:border-zinc-300 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase mb-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    id="form-address"
                    type="text"
                    placeholder="Complete studio residential address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 hover:border-zinc-300 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Emergency and Notes */}
          <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4">
            <span className="text-xxs font-extrabold uppercase font-mono tracking-widest text-orange-600 dark:text-orange-400 block mb-3">2. Health Profile & Emergency</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase mb-1">Emergency Contact</label>
                <div className="relative">
                  <Heart className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    id="form-emergency"
                    type="text"
                    placeholder="e.g. Ramesh Patil - 9100223344"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 hover:border-orange-355 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase mb-1">Status</label>
                <select
                  id="form-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MemberStatus)}
                  className="w-full text-sm bg-white dark:bg-zinc-950 font-semibold border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition text-zinc-905 dark:text-white"
                >
                  <option value="Active">Active Member</option>
                  <option value="Inactive">Inactive / Suspended</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase mb-1">Special Medical Notes or Gym Goals</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <textarea
                    id="form-notes"
                    placeholder="e.g. Focus on physical therapy rehab, weightlifting targets..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 hover:border-zinc-300 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Optional Package subscription assignment ONLY for NEW registrations */}
          {!memberToEdit && (
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 bg-orange-50/10 dark:bg-orange-950/5 p-4 rounded-xl border border-orange-500/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xxs font-extrabold uppercase font-mono tracking-widest text-orange-600 dark:text-orange-400 block">3. Fast Plan Assignment</span>
                <label className="flex items-center space-x-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer">
                  <input
                    id="form-checkbox-assign-plan"
                    type="checkbox"
                    checked={assignPlan}
                    onChange={(e) => setAssignPlan(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-800 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Assign package on registration</span>
                </label>
              </div>

              {assignPlan && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-405 uppercase mb-1">Membership Plan</label>
                    <select
                      id="form-starting-plan"
                      value={startingPlanType}
                      onChange={(e) => setStartingPlanType(e.target.value as any)}
                      className="w-full text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition font-semibold text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="Monthly">Monthly Plan (₹1505 entry / ₹1200 renew)</option>
                      <option value="3-Month">3-Month Plan (₹3000)</option>
                      <option value="6-Month">6-Month Plan (₹5500)</option>
                      <option value="1-Year">1-Year Plan (₹10000)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-555 dark:text-zinc-405 uppercase mb-1">Activation Term Start Date</label>
                    <input
                      id="form-starting-plan-start"
                      type="date"
                      value={startingPlanStartDate}
                      onChange={(e) => setStartingPlanStartDate(e.target.value)}
                      className="w-full text-sm border border-zinc-200 dark:border-zinc-850 rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-555 dark:text-zinc-405 uppercase mb-1">Amount Paid (INR)</label>
                    <input
                      id="form-starting-plan-paid"
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full text-sm font-bold text-orange-600 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition bg-white dark:bg-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-555 dark:text-zinc-450 uppercase mb-1">Pay Status</label>
                    <select
                      id="form-starting-plan-status"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 focus:border-orange-500 outline-none transition font-semibold text-zinc-900 dark:text-white"
                    >
                      <option value="Paid">Fully Paid</option>
                      <option value="Partial">Partial Down Payment</option>
                      <option value="Pending">Unpaid / Pending</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-150 dark:border-zinc-800">
            <button
              id="btn-form-cancel"
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 hover:text-zinc-850 dark:text-zinc-400 dark:hover:text-zinc-300 font-semibold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              id="btn-form-save"
              type="submit"
              className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl text-xs shadow-md shadow-orange-550/15 transition"
            >
              {memberToEdit ? 'Save Changes' : 'Complete Registration'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
