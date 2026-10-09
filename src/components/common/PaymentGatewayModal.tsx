import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, CreditCard, Smartphone, Building2, AlertCircle, X } from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  title: string;
  subtitle: string;
  beneficiaryName: string;
  isEscrow?: boolean;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  title,
  subtitle,
  beneficiaryName,
  isEscrow = true,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('demo.user@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess();
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Gateway Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
              ₹
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight flex items-center gap-1.5">
                LokWorks SafePay
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded font-mono">
                  ESCROW 256-BIT
                </span>
              </div>
              <p className="text-xs text-slate-400">Simulated Payment Gateway</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Demo Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span><strong>Demo Payment:</strong> No real money is transferred. Escrow state will be simulated.</span>
        </div>

        {/* Order Details */}
        <div className="p-6">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-5">
            <div className="text-xs text-slate-500">{title}</div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">{subtitle}</div>
            <div className="text-xs text-slate-600 mt-1">Recipient: <span className="font-medium text-slate-900">{beneficiaryName}</span></div>
            
            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Total Escrow Amount</span>
              <span className="text-xl font-bold font-mono text-slate-900">₹{amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Demo Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                <span className="text-xs block">UPI / QR</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                <span className="text-xs block">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                <span className="text-xs block">NetBanking</span>
              </button>
            </div>
          </div>

          {/* Method specifics */}
          {paymentMethod === 'upi' && (
            <div className="mb-5">
              <label className="block text-xs text-slate-600 mb-1">Simulated Virtual Payment Address (VPA)</label>
              <input 
                type="text" 
                value={upiId} 
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="mb-5 space-y-2">
              <input 
                type="text" 
                value="4111 2222 3333 4444" 
                readOnly 
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 font-mono text-slate-600"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value="12/28" 
                  readOnly 
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 font-mono text-slate-600"
                />
                <input 
                  type="password" 
                  value="982" 
                  readOnly 
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 font-mono text-slate-600"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div className="mb-5">
              <select className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white">
                <option>HDFC Bank - Instant Demo Gateway</option>
                <option>ICICI Bank - NetBanking</option>
                <option>State Bank of India</option>
                <option>Axis Bank</option>
              </select>
            </div>
          )}

          {/* Escrow assurance note */}
          {isEscrow && (
            <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Escrow Guarantee:</strong> Funds will be locked in the platform escrow account. Payout is released to {beneficiaryName} strictly upon job completion approval.
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={handlePay}
              disabled={isProcessing || isSuccess}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Securing in Escrow...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>Escrow Secured Successfully!</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirm & Lock ₹{amount.toLocaleString('en-IN')} in Escrow</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
