import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Briefcase, 
  Wrench, 
  UserCheck, 
  Home, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  LogIn, 
  UserPlus, 
  GraduationCap, 
  Sparkles, 
  Calendar 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  initialRole?: UserRole;
}

interface RoleMeta {
  role: UserRole;
  title: string;
  category: 'micro_gig' | 'local_services' | 'admin';
  categoryLabel: string;
  roleBadge: string;
  subtitle: string;
  description: string;
  accentColor: string;
  badgeBg: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLE_METAS: Record<UserRole, RoleMeta> = {
  gig_host: {
    role: 'gig_host',
    title: 'Gig Host',
    category: 'micro_gig',
    categoryLabel: 'Category 1: Micro-Gig Marketplace',
    roleBadge: 'Micro-Gig Marketplace • Job Provider',
    subtitle: 'Job Provider',
    description: 'Post operational micro-gigs, manage team slot quotas, and release automated escrow payouts.',
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    icon: Briefcase,
  },
  gig_partner: {
    role: 'gig_partner',
    title: 'Gig Partner',
    category: 'micro_gig',
    categoryLabel: 'Category 1: Micro-Gig Marketplace',
    roleBadge: 'Micro-Gig Marketplace • Job Finder',
    subtitle: 'Job Finder',
    description: 'Find flexible shifts, book confirmed slots, GPS check-in, and earn on-time escrow payouts.',
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    icon: UserCheck,
  },
  client: {
    role: 'client',
    title: 'Client',
    category: 'local_services',
    categoryLabel: 'Category 2: Local Service Marketplace',
    roleBadge: 'Local Service Marketplace • Service Seeker',
    subtitle: 'Service Seeker',
    description: 'Book verified master electricians, plumbers, and home artisans with 100% escrow custody.',
    accentColor: 'purple',
    badgeBg: 'bg-purple-50 border-purple-200 text-purple-700',
    icon: Home,
  },
  service_partner: {
    role: 'service_partner',
    title: 'Service Partner',
    category: 'local_services',
    categoryLabel: 'Category 2: Local Service Marketplace',
    roleBadge: 'Local Service Marketplace • Skilled Provider',
    subtitle: 'Skilled Service Provider',
    description: 'Offer certified trade expertise to householders with guaranteed upfront escrow payments.',
    accentColor: 'amber',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: Wrench,
  },
  admin: {
    role: 'admin',
    title: 'Admin Monitor',
    category: 'admin',
    categoryLabel: 'Platform Governance',
    roleBadge: 'Platform Governance • Ecosystem Admin',
    subtitle: 'Ecosystem Monitor',
    description: 'Live oversight across all four marketplace roles, escrow ledgers, and KYC verifications.',
    accentColor: 'rose',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
    icon: ShieldCheck,
  },
};

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTab = 'login',
  initialRole = 'gig_partner' 
}) => {
  const { registerUser, loginWithCredentials, users } = useApp();
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialTab);

  // Registration Complete Success screen state
  const [registeredSuccessUser, setRegisteredSuccessUser] = useState<{
    show: boolean;
    name: string;
    email: string;
    role: UserRole;
  } | null>(null);

  // Common Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Non-binary' | 'Prefer not to say'>('Male');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Gig Partner specific fields
  const [isCollegeStudent, setIsCollegeStudent] = useState<boolean>(false);
  const [age, setAge] = useState<string>('21');
  const [collegeName, setCollegeName] = useState<string>('');

  // Service Partner specific field
  const [tradeSpecialty, setTradeSpecialty] = useState<string>('Electrician');
  const [experienceYears, setExperienceYears] = useState<number>(5);

  // Sign in state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize on open or props change
  useEffect(() => {
    if (isOpen) {
      const target = initialRole || 'gig_partner';
      setActiveRole(target);
      setAuthMode(initialTab);
      setRegisteredSuccessUser(null);
      setErrorMessage(null);
      setSuccessNotice(null);

      // Set default demo email for convenience
      const defaultUser = users.find(u => u.role === target);
      if (defaultUser) {
        setLoginEmail(defaultUser.email);
        setLoginPassword(defaultUser.password || 'password123');
      } else {
        setLoginEmail('');
        setLoginPassword('');
      }
    }
  }, [isOpen, initialRole, initialTab]);

  // When active role changes, update default demo email and clear errors
  const handleSelectRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    setErrorMessage(null);
    setSuccessNotice(null);
    setRegisteredSuccessUser(null);

    const match = users.find(u => u.role === newRole);
    if (match) {
      setLoginEmail(match.email);
      setLoginPassword(match.password || 'password123');
    } else {
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  if (!isOpen) return null;

  const currentMeta = ROLE_METAS[activeRole] || ROLE_METAS.gig_partner;
  const RoleIcon = currentMeta.icon;

  // Filter demo accounts strictly for current role
  const roleDemoAccounts = users.filter(u => u.role === activeRole);

  // Submit Sign In
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = loginWithCredentials(loginEmail, loginPassword, activeRole);
      setIsSubmitting(false);

      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    }, 250);
  };

  // Submit Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Basic field checks
    if (!fullName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    const digitsOnly = mobile.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!location.trim()) {
      setErrorMessage('Location / Area is required.');
      return;
    }

    // 2. Role-specific validation
    if (activeRole === 'gig_partner') {
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 16 || parsedAge > 80) {
        setErrorMessage('Please enter a valid age between 16 and 80.');
        return;
      }
      if (isCollegeStudent && !collegeName.trim()) {
        // optional or soft prompt
      }
    }

    // 3. Password requirements
    if (!password) {
      setErrorMessage('Password is mandatory.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }
    if (!acceptTerms) {
      setErrorMessage('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerUser({
        name: fullName.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        phone: mobile.trim(),
        location: location.trim(),
        gender,
        password,
        role: activeRole,
        isStudent: activeRole === 'gig_partner' ? isCollegeStudent : false,
        isCollegeStudent: activeRole === 'gig_partner' ? isCollegeStudent : false,
        age: activeRole === 'gig_partner' ? parseInt(age, 10) : undefined,
        collegeName: activeRole === 'gig_partner' && isCollegeStudent ? collegeName.trim() : undefined,
        skills: activeRole === 'service_partner' 
          ? [tradeSpecialty, 'Certified Technical Service', 'Safety Compliance']
          : activeRole === 'gig_partner'
          ? ['Event Operations', 'Retail Helper', 'On-Demand Task Support']
          : undefined,
        experienceYears: activeRole === 'service_partner' ? experienceYears : undefined,
      });

      setIsSubmitting(false);

      if (res.success && res.user) {
        // Show Registration Success view with "Continue to Sign In"
        setRegisteredSuccessUser({
          show: true,
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          role: activeRole,
        });
      } else {
        setErrorMessage(res.error || 'Registration failed. Please verify your details.');
      }
    }, 300);
  };

  // Transition from Registration Complete to Sign In
  const handleContinueToSignIn = () => {
    if (registeredSuccessUser) {
      setLoginEmail(registeredSuccessUser.email);
      setLoginPassword('');
      setSuccessNotice(`Account for ${registeredSuccessUser.name} registered! Please enter your password to sign in.`);
    }
    setRegisteredSuccessUser(null);
    setAuthMode('login');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header & Role Switcher */}
        <div className="bg-slate-900 text-white p-5 shrink-0 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                LW
              </span>
              <div>
                <h3 className="font-bold text-sm sm:text-base leading-tight">LokWorks Authentication</h3>
                <span className="text-[10px] text-slate-400">Independent Multi-Role Portal</span>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Navigation Pills */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Select Role Experience:</span>
              <span className="text-indigo-400 font-mono">Role Isolation Enforced</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              {(['gig_host', 'gig_partner', 'client', 'service_partner'] as UserRole[]).map((r) => {
                const meta = ROLE_METAS[r];
                const isSelected = activeRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSelectRole(r)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <meta.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{meta.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          
          {/* REGISTRATION COMPLETE CONFIRMATION STATE */}
          {registeredSuccessUser && registeredSuccessUser.show ? (
            <div className="py-6 px-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                  <span>Registration Complete!</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {currentMeta.title} Profile Created
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  Your account information has been recorded in the platform registry. You can now authenticate using your credentials.
                </p>
              </div>

              {/* Registration Account Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Registered Name:</span>
                  <span className="font-bold text-slate-900">{registeredSuccessUser.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Account Email:</span>
                  <span className="font-mono font-semibold text-slate-900">{registeredSuccessUser.email}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Designated Role:</span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {currentMeta.title} ({currentMeta.subtitle})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Access Tier:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Strict Portal Protected
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleContinueToSignIn}
                  className="w-full sm:w-auto min-w-[240px] py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <span>Continue to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Role Header Banner */}
              <div className="mb-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${currentMeta.badgeBg}`}>
                    <RoleIcon className="w-3 h-3" />
                    <span>{currentMeta.roleBadge}</span>
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    {authMode === 'login' ? `Sign In to ${currentMeta.title} Portal` : `Create ${currentMeta.title} Account`}
                  </h4>
                  <p className="text-xs text-slate-500 leading-snug">
                    {currentMeta.description}
                  </p>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="bg-slate-100 p-1 rounded-xl shrink-0 flex gap-1">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMessage(null); }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account</span>
                  </button>
                </div>
              </div>

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {successNotice && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{successNotice}</div>
                </div>
              )}

              {/* VIEW 1: SIGN IN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  
                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder={`e.g. yourname@domain.in`}
                        className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Password
                      </label>
                      <span className="text-[10px] text-slate-400">Masked & Secure</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                        title={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Quick-Fill Demo Helper (Role Filtered) */}
                  {roleDemoAccounts.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>Quick Demo Credentials ({currentMeta.title}):</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">pw: password123</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {roleDemoAccounts.map((acc) => (
                          <button
                            key={acc.email}
                            type="button"
                            onClick={() => {
                              setLoginEmail(acc.email);
                              setLoginPassword(acc.password || 'password123');
                              setErrorMessage(null);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] border text-left flex items-center gap-1.5 transition-colors ${
                              loginEmail === acc.email
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span className="font-semibold">{acc.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({acc.email.split('@')[0]})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Sign In to {currentMeta.title} Portal</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Switch to Register link */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Don't have a {currentMeta.title} account? Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    Role-Based Access Control: You may only sign in using credentials registered for the <strong>{currentMeta.title}</strong> role. Cross-portal access is blocked.
                  </p>
                </form>
              )}

              {/* VIEW 2: REGISTRATION FORM */}
              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  
                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Siddharth Verma"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Number & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type="tel"
                          required
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="e.g. 98450 12345"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                        Location / Area <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Koramangala, Bengaluru"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gender Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Used for demographic registry only; never affects task eligibility or ranking.
                    </span>
                  </div>

                  {/* GIG PARTNER SPECIFIC FIELDS */}
                  {activeRole === 'gig_partner' && (
                    <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-900">Gig Partner Academic & Age Verification</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-indigo-900 uppercase mb-1">
                            Age (Years) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="16"
                            max="75"
                            required
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="e.g. 21"
                            className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-xl bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-indigo-900 uppercase mb-1">
                            College Student? <span className="text-rose-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setIsCollegeStudent(true)}
                              className={`py-1.5 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                                isCollegeStudent
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                              }`}
                            >
                              Yes, Student
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsCollegeStudent(false)}
                              className={`py-1.5 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                                !isCollegeStudent
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>

                      {isCollegeStudent && (
                        <div>
                          <label className="block text-[11px] font-semibold text-indigo-900 uppercase mb-1">
                            College / Institution Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={collegeName}
                            onChange={(e) => setCollegeName(e.target.value)}
                            placeholder="e.g. Bangalore University / PES University"
                            className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-xl bg-white"
                          />
                          <span className="text-[10px] text-indigo-700 mt-0.5 block">
                            Note: College student accounts automatically enable the 8 gigs/month academic protection balance.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SERVICE PARTNER SPECIFIC FIELDS */}
                  {activeRole === 'service_partner' && (
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-700" />
                        <span className="text-xs font-bold text-amber-950">Skilled Service Partner Profile</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-amber-950 uppercase mb-1">
                            Primary Trade
                          </label>
                          <select
                            value={tradeSpecialty}
                            onChange={(e) => setTradeSpecialty(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-amber-200 rounded-xl bg-white text-slate-800"
                          >
                            <option>Electrician</option>
                            <option>Plumber</option>
                            <option>Carpenter</option>
                            <option>AC Technician</option>
                            <option>Appliance Specialist</option>
                            <option>Painter</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-amber-950 uppercase mb-1">
                            Years of Experience
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="40"
                            value={experienceYears}
                            onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 1)}
                            className="w-full px-3 py-2 text-xs border border-amber-200 rounded-xl bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MANDATORY PASSWORD & CONFIRM PASSWORD */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase">
                          Password (Min 8 chars) <span className="text-rose-500">*</span>
                        </label>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span>
                        I agree to LokWorks <strong>Platform Terms of Service</strong>, escrow payment protection guidelines, and privacy regulations.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Create {currentMeta.title} Account</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Already have an account */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setErrorMessage(null); }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Already have an account? Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
