import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CircleDollarSign, Building2, LogIn, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  // --- MENTOR'S ORIGINAL STATES ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- NEW 2FA STATES ---
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);
  
  // --- STEP 1: Check mentor's credentials manually ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      return;
    }

    // MENTOR'S EXACT CREDENTIALS CHECK
    const isValidCredentials = 
      (role === 'entrepreneur' && email === 'sarah@techwave.io' && password === 'password123') ||
      (role === 'investor' && email === 'michael@vcinnovate.com' && password === 'password123');

    if (!isValidCredentials) {
      setError('Invalid email or password');
      return;
    }

    // Correct password! Show 2FA screen
    setStep(2);
  };
  
  // --- MENTOR'S ORIGINAL DEMO FUNCTION ---
  const fillDemoCredentials = (userRole: UserRole) => {
    if (userRole === 'entrepreneur') {
      setEmail('sarah@techwave.io');
      setPassword('password123');
    } else {
      setEmail('michael@vcinnovate.com');
      setPassword('password123');
    }
    setRole(userRole);
  };

  // --- OTP Typing Logic ---
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  // --- FIXED STEP 2: Verify OTP and redirect ---
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    if (enteredOtp !== '123456') {
      setOtpError('Invalid verification code. Hint: Use 123456');
      return;
    }

    setIsLoading(true);
    
    // Run login in background so it doesn't freeze the button
    login(email, password, role).catch(() => {});
    
    // Force redirect after 1 second
    setTimeout(() => {
      setIsLoading(false);
      navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* STEP 1: MENTOR'S EXACT ORIGINAL LOGIN UI */}
        {step === 1 && (
          <>
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-primary-600 rounded-md flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to Business Nexus
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Connect with investors and entrepreneurs
            </p>

            <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {error && (
                <div className="mb-4 bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded-md flex items-start">
                  <AlertCircle size={18} className="mr-2 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${role === 'entrepreneur' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`} onClick={() => setRole('entrepreneur')}>
                      <Building2 size={18} className="mr-2" /> Entrepreneur
                    </button>
                    <button type="button" className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${role === 'investor' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`} onClick={() => setRole('investor')}>
                      <CircleDollarSign size={18} className="mr-2" /> Investor
                    </button>
                  </div>
                </div>
                
                <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth startAdornment={<User size={18} />} />
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500">Forgot your password?</a>
                  </div>
                </div>
                
                <Button type="submit" fullWidth isLoading={isLoading} leftIcon={<LogIn size={18} />}>Sign in</Button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Demo Accounts</span></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => fillDemoCredentials('entrepreneur')} leftIcon={<Building2 size={16} />}>Entrepreneur Demo</Button>
                  <Button variant="outline" onClick={() => fillDemoCredentials('investor')} leftIcon={<CircleDollarSign size={16} />}>Investor Demo</Button>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">Sign up</Link>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: NEW 2FA SCREEN */}
        {step === 2 && (
          <>
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-primary-600 rounded-md flex items-center justify-center">
                <ShieldCheck size={28} className="text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Two-Factor Authentication</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We sent a code to <span className="font-medium text-gray-900">{email}</span>
            </p>

            <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {otpError && (
                <div className="mb-4 bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded-md flex items-start">
                  <AlertCircle size={18} className="mr-2 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Enter the 6-digit code below</label>
                  <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Hint for demo: Use <span className="font-bold text-primary-600">123456</span>
                  </p>
                </div>
                
                <Button type="submit" fullWidth isLoading={isLoading} leftIcon={<ShieldCheck size={18} />}>
                  Verify & Continue
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(['','','','','','']); setOtpError(null); }}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  <ArrowLeft size={16} /> Back to login
                </button>
              </form>
            </div>
          </>
        )}

      </div>
    </div>
  );
};