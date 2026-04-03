import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, XCircle } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'text-gray-300', width: '0%', hex: '#E5E7EB' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (/[@#$%^&*!]/.test(password)) score++;

    if (score <= 2) return { label: 'Weak', color: 'text-red-500', width: '25%', hex: '#EF4444' };
    if (score <= 3) return { label: 'Fair', color: 'text-orange-500', width: '50%', hex: '#F97316' };
    if (score <= 4) return { label: 'Good', color: 'text-blue-500', width: '75%', hex: '#3B82F6' };
    return { label: 'Strong', color: 'text-green-500', width: '100%', hex: '#22C55E' };
  };

  const strength = getPasswordStrength();

  const checks = [
    { label: '6+ chars', pass: password.length >= 6 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special', pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your full name'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email'); return; }
    if (!password) { setError('Please enter a password'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 flex flex-col items-center justify-center p-6">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-white/20">
              <User size={28} className="text-white/80" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1">Create Account</h1>
            <p className="text-violet-200 text-sm">Join Business Nexus today</p>
          </div>

          <div className="px-6 sm:px-8 py-6 sm:py-8">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-6">
                <XCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs font-semibold text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="John Doe" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" autoFocus />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@company.com" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="Min 6 characters" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Strength</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${strength.color}`}>{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, backgroundColor: strength.hex }} />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {checks.map((item) => (
                        <div key={item.label} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${item.pass ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                          <CheckCircle2 size={11} className={item.pass ? 'text-green-500' : 'text-gray-300'} />
                          <span className={`text-[10px] font-semibold ${item.pass ? 'text-green-600' : 'text-gray-400'}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} placeholder="Re-enter password" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-200/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </form>

            <div className="text-center mt-6 border-t border-gray-100 pt-5">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-violet-600 font-semibold hover:text-violet-700 transition">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { RegisterPage };