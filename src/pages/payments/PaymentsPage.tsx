import React, { useState } from 'react';
import {
  Wallet, ArrowDownLeft, ArrowUpRight, CreditCard,
  Clock, CheckCircle2, XCircle, AlertCircle, Send,
  DollarSign, TrendingUp, TrendingDown, Shield, Lock, X
} from 'lucide-react';

type TxType = 'deposit' | 'withdraw' | 'payment_sent' | 'payment_received';
type TxStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
  id: string;
  type: TxType;
  description: string;
  amount: number;
  date: string;
  time: string;
  status: TxStatus;
  counterparty: string;
}

const TX_TYPE_CONFIG: Record<TxType, { label: string; color: string; bg: string; border: string; icon: JSX.Element; sign: string }> = {
  deposit: { label: 'Deposit', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: <ArrowDownLeft size={14} />, sign: '+' },
  withdraw: { label: 'Withdraw', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: <ArrowUpRight size={14} />, sign: '-' },
  payment_sent: { label: 'Payment Sent', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', icon: <Send size={14} />, sign: '-' },
  payment_received: { label: 'Payment Received', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: <DollarSign size={14} />, sign: '+' }
};

const TX_STATUS_CONFIG: Record<TxStatus, { label: string; color: string; bg: string; icon: JSX.Element }> = {
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle2 size={11} /> },
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={11} /> },
  failed: { label: 'Failed', color: 'text-red-500', bg: 'bg-red-50', icon: <XCircle size={11} /> }
};

const PaymentsPage: React.FC = () => {
  const [balance, setBalance] = useState(24850.00);
  const [activeTxFilter, setActiveTxFilter] = useState('all');

  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundType, setFundType] = useState('deposit');
  const [fundAmount, setFundAmount] = useState('');
  const [fundNote, setFundNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentTo, setPaymentTo] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'tx-001', type: 'deposit', description: 'Wallet Top-up via Bank Transfer', amount: 10000, date: '2025-01-28', time: '09:15 AM', status: 'completed', counterparty: 'Chase Bank ****4521' },
    { id: 'tx-002', type: 'payment_sent', description: 'Investment - TechStart Inc.', amount: 5000, date: '2025-01-25', time: '02:30 PM', status: 'completed', counterparty: 'TechStart Inc.' },
    { id: 'tx-003', type: 'payment_received', description: 'Milestone Payment - Phase 1', amount: 2500, date: '2025-01-22', time: '11:00 AM', status: 'completed', counterparty: 'Mike Johnson' },
    { id: 'tx-004', type: 'withdraw', description: 'Withdrawal to Bank Account', amount: 3000, date: '2025-01-20', time: '04:45 PM', status: 'completed', counterparty: 'Wells Fargo ****7832' },
    { id: 'tx-005', type: 'payment_sent', description: 'Consulting Fee - Legal Advisory', amount: 1200, date: '2025-01-18', time: '10:20 AM', status: 'pending', counterparty: 'Legal Advisors LLC' },
    { id: 'tx-006', type: 'deposit', description: 'Investor Funding Received', amount: 15000, date: '2025-01-15', time: '03:00 PM', status: 'completed', counterparty: 'Sarah Smith' },
    { id: 'tx-007', type: 'payment_sent', description: 'Platform Subscription Fee', amount: 99, date: '2025-01-10', time: '12:00 AM', status: 'completed', counterparty: 'Nexus Platform' },
    { id: 'tx-008', type: 'withdraw', description: 'Withdrawal to PayPal', amount: 2000, date: '2025-01-08', time: '06:30 PM', status: 'failed', counterparty: 'PayPal *email@gmail.com' },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join('  ') : '';
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + ' / ' + cleaned.slice(2);
    }
    return cleaned;
  };

  const handleFundSubmit = () => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (fundType === 'withdraw' && amount > balance) return;
    setIsProcessing(true);
    setTimeout(() => {
      const newTx: Transaction = {
        id: 'tx-' + Math.random().toString(36).substr(2, 6),
        type: fundType,
        description: fundType === 'deposit' ? 'Wallet Deposit' : 'Withdrawal to Bank',
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        counterparty: fundType === 'deposit' ? 'Bank Transfer ****' + Math.floor(1000 + Math.random() * 9000) : 'Bank Account'
      };
      setTransactions(prev => [newTx, ...prev]);
      setBalance(prev => fundType === 'deposit' ? prev + amount : prev - amount);
      setIsProcessing(false);
      setIsFundModalOpen(false);
      setFundAmount('');
      setFundNote('');
    }, 1500);
  };

  const handlePaymentSubmit = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (amount > balance) return;
    if (!cardNumber.replace(/\s/g, '').length || !cardExpiry.length || !cardCvv.length || !cardName.trim() || !paymentTo.trim()) return;
    setIsPaymentProcessing(true);
    setTimeout(() => {
      const newTx: Transaction = {
        id: 'tx-' + Math.random().toString(36).substr(2, 6),
        type: 'payment_sent',
        description: 'Payment to ' + paymentTo.trim(),
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: Math.random() > 0.2 ? 'completed' : 'pending',
        counterparty: paymentTo.trim()
      };
      setTransactions(prev => [newTx, ...prev]);
      setBalance(prev => prev - amount);
      setIsPaymentProcessing(false);
      setIsPaymentModalOpen(false);
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardName('');
      setPaymentAmount('');
      setPaymentTo('');
      setPaymentNote('');
    }, 2000);
  };

  const filteredTransactions = activeTxFilter === 'all' ? transactions : transactions.filter(function(tx) { return tx.type === activeTxFilter; });

  const txCounts = {
    all: transactions.length,
    deposit: transactions.filter(function(t) { return t.type === 'deposit'; }).length,
    withdraw: transactions.filter(function(t) { return t.type === 'withdraw'; }).length,
    payment_sent: transactions.filter(function(t) { return t.type === 'payment_sent'; }).length,
    payment_received: transactions.filter(function(t) { return t.type === 'payment_received'; }).length,
  };

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  const fundBtnClass = fundType === 'deposit'
    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-200/50'
    : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-200/50';

  const fundIcon = fundType === 'deposit' ? <ArrowDownLeft size={18} className="text-white hidden sm:block" /> : <ArrowUpRight size={18} className="text-white hidden sm:block" />;
  const fundIconMobile = fundType === 'deposit' ? <ArrowDownLeft size={16} className="text-white sm:hidden" /> : <ArrowUpRight size={16} className="text-white sm:hidden" />;
  const fundLabel = fundType === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds';

  const isFundDisabled = !fundAmount || parseFloat(fundAmount) <= 0 || (fundType === 'withdraw' && parseFloat(fundAmount) > balance) || isProcessing;
  const isPayDisabled = !paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > balance || !cardNumber.replace(/\s/g, '').length || !cardExpiry.length || !cardCvv.length || !cardName.trim() || !paymentTo.trim() || isPaymentProcessing;

  const renderProcessing = function(text: string) {
    return (
      <span className="flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
        {text}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-1 sm:mb-2">Payments</h2>
        <p className="text-sm text-gray-400">Manage your wallet, transactions, and funding</p>
      </div>

      {/* Wallet Card + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">

        {/* Main Wallet Card */}
        <div className="sm:col-span-2 xl:col-span-2 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-violet-200/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8 sm:mb-12">
              <div className="flex items-center gap-2">
                <Wallet size={20} className="text-white/70" />
                <span className="text-sm font-semibold text-white/70">Wallet Balance</span>
              </div>
              <Shield size={20} className="text-white/40" />
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-8">{formatCurrency(balance)}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-white/50 mb-1">Account Holder</p>
                <p className="text-sm font-bold">Business Nexus User</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/50 mb-1">Account ID</p>
                <p className="text-sm font-bold font-mono">NX-WLT-8472</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Received</p>
              <p className="text-lg font-extrabold text-gray-900">{formatCurrency(transactions.filter(function(t) { return t.type === 'deposit' || t.type === 'payment_received'; }).reduce(function(sum, t) { return sum + t.amount; }, 0))}</p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Spent</p>
              <p className="text-lg font-extrabold text-gray-900">{formatCurrency(transactions.filter(function(t) { return t.type === 'withdraw' || t.type === 'payment_sent'; }).reduce(function(sum, t) { return sum + t.amount; }, 0))}</p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-400 rounded-full" style={{ width: '35%' }} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={function() { setFundType('deposit'); setIsFundModalOpen(true); setFundAmount(''); setFundNote(''); }} className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-200/50 transition-all active:scale-[0.98]">
            <ArrowDownLeft size={18} className="hidden sm:block" />
            <ArrowDownLeft size={16} className="sm:hidden" />
            <span>Deposit</span>
          </button>
          <button onClick={function() { setFundType('withdraw'); setIsFundModalOpen(true); setFundAmount(''); setFundNote(''); }} className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-200/50 transition-all active:scale-[0.98]">
            <ArrowUpRight size={18} className="hidden sm:block" />
            <ArrowUpRight size={16} className="sm:hidden" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Send Payment Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900">Send Payment</h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Pay startups, consultants, or service providers</p>
          </div>
          <button onClick={function() { setIsPaymentModalOpen(true); }} className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-violet-200/60 transition-all w-full sm:w-auto justify-center shrink-0">
            <CreditCard size={16} />
            <span className="hidden sm:inline">New Payment</span>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-green-600">{transactions.filter(function(t) { return t.status === 'completed'; }).length}</p>
            <p className="text-[10px] sm:text-xs font-semibold text-green-500 uppercase tracking-wider mt-0.5">Completed</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-amber-600">{transactions.filter(function(t) { return t.status === 'pending'; }).length}</p>
            <p className="text-[10px] sm:text-xs font-semibold text-amber-500 uppercase tracking-wider mt-0.5">Pending</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-red-500">{transactions.filter(function(t) { return t.status === 'failed'; }).length}</p>
            <p className="text-[10px] sm:text-xs font-semibold text-red-500 uppercase tracking-wider mt-0.5">Failed</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900">Transaction History</h3>
            <div className="flex gap-1 sm:gap-1.5 bg-white p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-x-auto w-full sm:w-auto">
              {['all', 'deposit', 'withdraw', 'payment_sent', 'payment_received'].map(function(tab) {
                var count = txCounts[tab as keyof typeof txCounts] || 0;
                return (
                  <button key={tab} onClick={function() { setActiveTxFilter(tab); }} className={'px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-all capitalize whitespace-nowrap ' + (activeTxFilter === tab ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50')}>
                    {tab === 'all' ? 'All (' + txCounts.all + ')' : tab === 'deposit' ? 'Deposits (' + txCounts.deposit + ')' : tab === 'withdraw' ? 'Withdrawals (' + txCounts.withdraw + ')' : tab === 'payment_sent' ? 'Sent (' + txCounts.payment_sent + ')' : 'Received (' + txCounts.payment_received + ')'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Transaction</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Counterparty</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {/* Transactions */}
        <div className="divide-y divide-gray-50">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Wallet size={28} className="text-gray-200" />
              </div>
              <p className="text-sm font-medium text-gray-400">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map(function(tx) {
              var typeConf = TX_TYPE_CONFIG[tx.type];
              var statusConf = TX_STATUS_CONFIG[tx.status];
              return (
                <div key={tx.id} className="group hover:bg-gray-50/50 transition-colors">
                  {/* Desktop Row */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 items-center">
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className={'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ' + typeConf.bg + ' ' + typeConf.border}>
                        {typeConf.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{tx.description}</p>
                        <p className="text-[11px] text-gray-400">{typeConf.label}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">{tx.date}</p>
                      <p className="text-[11px] text-gray-400">{tx.time}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 truncate">{tx.counterparty}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className={'text-sm font-bold ' + typeConf.color}>{typeConf.sign}{formatCurrency(tx.amount)}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ' + statusConf.bg + ' ' + statusConf.color}>
                        {statusConf.icon}
                        {statusConf.label}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Row */}
                  <div className="sm:hidden p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ' + typeConf.bg + ' ' + typeConf.border}>
                        {typeConf.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{tx.description}</p>
                        <p className="text-[11px] text-gray-400">{tx.date} · {tx.time}</p>
                      </div>
                      <p className={'text-sm font-bold shrink-0 ' + typeConf.color}>{typeConf.sign}{formatCurrency(tx.amount)}</p>
                    </div>
                    <div className="flex items-center justify-between ml-12">
                      <p className="text-xs text-gray-500 truncate">{tx.counterparty}</p>
                      <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ' + statusConf.bg + ' ' + statusConf.color}>
                        {statusConf.icon}
                        {statusConf.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============================== */}
      {/* DEPOSIT / WITHDRAW MODAL */}
      {/* ============================== */}
      {isFundModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={function() { setIsFundModalOpen(false); }}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto" onClick={function(e) { e.stopPropagation(); }}>
            <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <div className={'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ' + fundBtnClass}>
                  {fundIcon}
                  {fundIconMobile}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">{fundLabel}</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400">{fundType === 'deposit' ? 'Add money to your wallet' : 'Transfer money to your bank'}</p>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-4 sm:space-y-5">
              <div className={'rounded-xl p-4 border ' + (fundType === 'deposit' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200')}>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Current Balance</p>
                <p className="text-xl font-extrabold text-gray-900">{formatCurrency(balance)}</p>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Amount (USD) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                  <input type="number" value={fundAmount} onChange={function(e) { setFundAmount(e.target.value); }} placeholder="0.00" min="0" step="0.01" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
                </div>
                {fundType === 'withdraw' && parseFloat(fundAmount) > balance && (
                  <p className="text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} /> Insufficient balance
                  </p>
                )}
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Select</p>
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map(function(amt) {
                    return (
                      <button key={amt} onClick={function() { setFundAmount(amt.toString()); }} className={'px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ' + (fundAmount === amt.toString() ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100')}>
                        {formatCurrency(amt)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Note (optional)</label>
                <input type="text" value={fundNote} onChange={function(e) { setFundNote(e.target.value); }} placeholder="e.g. January funding round..." className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
              </div>
            </div>

            <div className="px-5 sm:px-7 py-4 sm:py-5 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button onClick={function() { setIsFundModalOpen(false); }} className="flex-1 px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-bold transition">Cancel</button>
              <button onClick={handleFundSubmit} disabled={isFundDisabled} className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-200/50 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2">
                {isProcessing ? renderProcessing('Processing...') : (
                  <span className="flex items-center gap-2">{fundIconMobile}<span>{fundLabel}</span></span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* PAYMENT MODAL */}
      {/* ============================== */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={function() { setIsPaymentModalOpen(false); }}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto" onClick={function(e) { e.stopPropagation(); }}>
            <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <CreditCard size={16} className="text-white sm:hidden" />
                  <CreditCard size={18} className="text-white hidden sm:block" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Send Payment</h3>
                  <p className="text-[11px] sm:text-xs text-gray-400">Mock Stripe payment</p>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-4 sm:space-y-5">
              {/* Card Preview */}
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8 sm:mb-12">
                    <div className="w-8 h-8 rounded bg-yellow-400 flex items-center justify-center">
                      <span className="text-[10px] font-extrabold text-gray-800">VISA</span>
                    </div>
                    <CreditCard size={20} className="text-white/40" />
                  </div>
                  <p className="font-mono text-base sm:text-lg tracking-widest mb-4 sm:mb-6">{cardNumber ? formatCardNumber(cardNumber) : '**** **** **** ****'}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] sm:text-[10px] text-white/40 uppercase mb-0.5">Card Holder</p>
                      <p className="text-xs sm:text-sm font-bold">{cardName || 'YOUR NAME'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] sm:text-[10px] text-white/40 uppercase mb-0.5">Expires</p>
                      <p className="text-xs sm:text-sm font-bold font-mono">{cardExpiry || 'MM / YY'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Card Number *</label>
                <input type="text" value={formatCardNumber(cardNumber)} onChange={function(e) { setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16)); }} placeholder="4242 4242 4242 4242" maxLength={19} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition tracking-wider" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Expiry Date *</label>
                  <input type="text" value={formatExpiry(cardExpiry)} onChange={function(e) { setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4)); }} placeholder="MM / YY" maxLength={7} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">CVV *</label>
                  <input type="password" value={cardCvv} onChange={function(e) { setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); }} placeholder="***" maxLength={4} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Cardholder Name *</label>
                <input type="text" value={cardName} onChange={function(e) { setCardName(e.target.value); }} placeholder="John Doe" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
              </div>

              <div className="border-t border-gray-100 pt-4 sm:pt-5 space-y-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Pay To *</label>
                  <input type="text" value={paymentTo} onChange={function(e) { setPaymentTo(e.target.value); }} placeholder="e.g. TechStart Inc." className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Amount (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                    <input type="number" value={paymentAmount} onChange={function(e) { setPaymentAmount(e.target.value); }} placeholder="0.00" min="0" step="0.01" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
                  </div>
                  {parseFloat(paymentAmount) > balance && (
                    <p className="text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> Insufficient balance</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Note (optional)</label>
                  <input type="text" value={paymentNote} onChange={function(e) { setPaymentNote(e.target.value); }} placeholder="e.g. Series A investment..." className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                <Lock size={14} className="text-green-600" />
                <p className="text-[11px] font-semibold text-green-700">Secured by 256-bit SSL encryption (mock)</p>
              </div>
            </div>

            <div className="px-5 sm:px-7 py-4 sm:py-5 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button onClick={function() { setIsPaymentModalOpen(false); }} className="flex-1 px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-bold transition">Cancel</button>
              <button onClick={handlePaymentSubmit} disabled={isPayDisabled} className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-200/60 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2">
                {isPaymentProcessing ? renderProcessing('Processing...') : (
                  <span className="flex items-center gap-2"><Send size={14} /> Pay {paymentAmount ? formatCurrency(parseFloat(paymentAmount)) : ''}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-4 sm:h-6" />
    </div>
  );
};

export default PaymentsPage;