import { X, Printer, CheckCircle, Smartphone } from 'lucide-react';
import { PaymentRecord } from '../types';
import { formatINR } from '../dataStore';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
}

export default function ReceiptModal({ isOpen, onClose, payment }: ReceiptModalProps) {
  if (!isOpen || !payment) return null;

  const handlePrintSlip = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Allow popups to print/download slips');
      return;
    }

    const slipHTML = `
      <html>
        <head>
          <title>Gym Flow - Payment Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.4; color: #111; padding: 20px; max-width: 380px; margin: 0 auto; }
            .receipt-header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 12px; }
            .receipt-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .receipt-total { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 6px 0; margin: 12px 0; font-weight: bold; font-size: 16px; }
            .receipt-footer { text-align: center; border-top: 2px dashed #000; padding-top: 12px; margin-top: 20px; font-size: 12px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 8px 16px; background-color: #ea580c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
              Print Slip
            </button>
          </div>
          <div class="receipt-header">
            <h2 style="margin: 0; text-transform: uppercase; letter-spacing: 1px;">GYM FLOW</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px;">FITNESS & STRENGTH STATION</p>
            <p style="margin: 2px 0 0 0; font-size: 11px;">Receipt Copy • Official Invoice</p>
          </div>

          <div class="receipt-row">
            <span>RECEIPT ID:</span>
            <span style="font-weight: bold;">${payment.receiptNumber}</span>
          </div>
          <div class="receipt-row">
            <span>DATE:</span>
            <span>${payment.paymentDate}</span>
          </div>
          <div class="receipt-row">
            <span>STATION AGENT:</span>
            <span>GYM-FLOW-AUTO</span>
          </div>
          
          <div style="border-top: 1px solid #000; margin: 8px 0;"></div>

          <div class="receipt-row">
            <span>MEM CODE:</span>
            <span style="font-weight: bold;">${payment.memberCode}</span>
          </div>
          <div class="receipt-row">
            <span>MEMBER NAME:</span>
            <span>${payment.memberName}</span>
          </div>
          <div class="receipt-row">
            <span>PLAN TYPE:</span>
            <span>${payment.planType}</span>
          </div>
          <div class="receipt-row">
            <span>METHOD:</span>
            <span>${payment.paymentMethod}</span>
          </div>

          <div style="border-top: 1px solid #000; margin: 8px 0;"></div>

          <div class="receipt-row receipt-total">
            <span>TOTAL PAID:</span>
            <span>${formatINR(payment.amountPaid)}</span>
          </div>

          <div class="receipt-row" style="color: ${payment.dueAmount > 0 ? '#b91c1c' : '#111'};">
            <span>OUTSTANDING DUE:</span>
            <span>${formatINR(payment.dueAmount)}</span>
          </div>

          <div class="receipt-footer">
            <p style="margin: 0; font-weight: bold;">THANK YOU FOR YOUR PATRONAGE!</p>
            <p style="margin: 4px 0 0 0;">Sweat is just fat crying.</p>
            <p style="margin: 8px 0 0 0; font-size: 10px; color: #555;">No refund after assignment. Valid till active period expiry.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(slipHTML);
    printWindow.document.close();
  };

  return (
    <div id="receipt-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-fade-in">
      <div id="receipt-modal-container" className="w-[380px] max-w-full bg-white dark:bg-zinc-90 w-full dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-scale-in">
        
        {/* Header bar */}
        <div className="bg-zinc-950 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-orange-500 font-bold" />
            <span className="font-extrabold tracking-tight text-sm">Receipt Generated</span>
          </div>
          <button id="btn-receipt-close" onClick={onClose} className="text-zinc-400 hover:text-white transition p-0.5 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt slip layout */}
        <div id="receipt-invoice-slip" className="p-6 bg-white dark:bg-zinc-900 flex flex-col items-center">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-orange-50/10 dark:bg-orange-950/20 border border-orange-500/20 rounded-full flex items-center justify-center text-orange-600 mb-2 mx-auto">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-lg font-extrabold text-zinc-900 dark:text-white uppercase tracking-widest font-mono">Gym Flow</h4>
            <span className="text-xxs uppercase tracking-wider text-orange-500 font-bold font-mono">Invoice Slip</span>
          </div>

          <div className="w-full space-y-2 text-xs text-zinc-700 dark:text-zinc-350 font-mono border-y border-dashed border-zinc-250 dark:border-zinc-800 py-4 mb-4">
            <div className="flex justify-between">
              <span className="text-zinc-450 text-left">RECEIPT ID:</span>
              <span className="text-right font-bold text-zinc-800 dark:text-white">{payment.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-450 text-left">DATE:</span>
              <span className="text-right text-zinc-800 dark:text-zinc-200">{payment.paymentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-450 text-left">MEMBER CODE:</span>
              <span className="text-right font-bold text-orange-600 dark:text-orange-400">{payment.memberCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-450 text-left">MEMBER NAME:</span>
              <span className="text-right font-semibold text-zinc-800 dark:text-zinc-200">{payment.memberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-450 text-left">PLAN SELECTED:</span>
              <span className="text-right text-zinc-800 dark:text-zinc-200">{payment.planType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-450 text-left">METHOD:</span>
              <span className="text-right text-zinc-800 dark:text-zinc-200 font-semibold">{payment.paymentMethod}</span>
            </div>
          </div>

          <div className="w-full space-y-1 mb-6 text-sm">
            <div className="flex justify-between items-center text-zinc-800 dark:text-zinc-200">
              <span className="font-semibold">Amount Paid</span>
              <span className="font-extrabold text-orange-600 dark:text-orange-400 text-base">{formatINR(payment.amountPaid)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-450">Balance Due</span>
              <span className={`font-semibold ${payment.dueAmount > 0 ? 'text-red-500 font-bold animate-pulse' : 'text-zinc-500'}`}>
                {formatINR(payment.dueAmount)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full flex space-x-2">
            <button
              id="btn-receipt-print"
              onClick={handlePrintSlip}
              className="flex-1 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-805 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold py-2.5 rounded-full text-xs flex items-center justify-center space-x-2 shadow-xs transition"
            >
              <Printer className="w-4 h-4 text-zinc-400" />
              <span>Print Slip</span>
            </button>
            <button
              id="btn-receipt-done"
              onClick={onClose}
              className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-extrabold py-2.5 rounded-full text-xs flex justify-center items-center shadow-xs transition"
            >
              <span>Done</span>
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
