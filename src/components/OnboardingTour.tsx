import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2, Calendar, Video, FileText, CreditCard, MessageSquare, ShieldCheck } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: <Calendar size={28} />,
    color: 'from-violet-500 to-indigo-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    title: 'Meeting Scheduling',
    description: 'Manage your availability and join video calls from the calendar.',
    features: ['Add availability slots', 'Send & receive requests', 'Join video calls']
  },
  {
    icon: <Video size={28} />,
    color: 'from-blue-500 to-cyan-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    title: 'Video Conferencing',
    description: 'Face-to-face calls with mic, camera, and screen sharing controls.',
    features: ['Start & end calls', 'Toggle mic & camera', 'Screen sharing']
  },
  {
    icon: <FileText size={28} />,
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    title: 'Document Chamber',
    description: 'Upload contracts, preview documents, and simulate e-signatures.',
    features: ['Upload & preview PDFs', 'E-signature simulation', 'Status tracking']
  },
  {
    icon: <CreditCard size={28} />,
    color: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600',
    title: 'Payments & Wallet',
    description: 'Mock payments for deposits, withdrawals, and funding transfers.',
    features: ['Wallet balance', 'Deposit & withdraw', 'Transaction history']
  },
  {
    icon: <MessageSquare size={28} />,
    color: 'from-pink-500 to-rose-600',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
    title: 'Messaging & Chat',
    description: 'Real-time messaging with investors and entrepreneurs.',
    features: ['One-on-one chat', 'Message history', 'Online status']
  },
  {
    icon: <ShieldCheck size={28} />,
    color: 'from-red-500 to-pink-600',
    bgLight: 'bg-red-50',
    textColor: 'text-red-600',
    title: 'Secure Authentication',
    description: 'Multi-step login with password strength meter and verification codes.',
    features: ['Multi-step login', 'Password strength meter', 'Verification codes']
  },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Close button */}
        <div className="flex justify-end p-4 pb-0">
          <button onClick={onComplete} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-6">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-5 shadow-lg`}>
            {step.icon}
          </div>

          {/* Step counter */}
          <span className={`text-xs font-bold uppercase tracking-wider ${step.textColor}`}>
            Step {currentStep + 1} of {steps.length}
          </span>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full my-3">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-violet-500 to-indigo-600" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} 
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{step.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">{step.description}</p>

          {/* Features */}
          <div className="space-y-2 mb-8">
            {step.features.map((feature, idx) => (
              <div key={idx} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${step.bgLight}`}>
                <CheckCircle2 size={16} className={step.textColor} />
                <span className="text-sm font-medium text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-8 bg-violet-600' : idx < currentStep ? 'w-2 bg-violet-300' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {currentStep > 0 ? (
              <button onClick={() => setCurrentStep(currentStep - 1)} className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <button onClick={onComplete} className="px-5 py-3 text-gray-400 text-sm font-bold hover:text-gray-600 transition">
                Skip tour
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button onClick={() => setCurrentStep(currentStep + 1)} className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r ${step.color} text-white rounded-xl text-sm font-bold shadow-lg transition hover:opacity-90`}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={onComplete} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg transition hover:opacity-90">
                <CheckCircle2 size={16} /> Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;