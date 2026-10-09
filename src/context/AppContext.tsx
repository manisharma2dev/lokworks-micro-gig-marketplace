import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  GigJob, 
  GigBooking, 
  BookingStatus,
  ServiceListing, 
  ServiceBooking, 
  ItemProtectionClaim, 
  SubscriptionPlan, 
  UserSubscription,
  AppNotification, 
  Transaction,
  UserRole,
  WaitingListEntry,
  MarketplaceCategory
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_GIG_JOBS, 
  INITIAL_GIG_BOOKINGS, 
  INITIAL_WAITING_LIST,
  INITIAL_SERVICE_LISTINGS, 
  INITIAL_SERVICE_BOOKINGS, 
  SUBSCRIPTION_PLANS, 
  INITIAL_SUBSCRIPTIONS,
  INITIAL_ITEM_CLAIMS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_TRANSACTIONS 
} from '../data/mockData';
import { playNotificationChime, playExtendedVisibilityBroadcast } from '../utils/soundEffects';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  gigJobs: GigJob[];
  gigBookings: GigBooking[];
  waitingList: WaitingListEntry[];
  serviceListings: ServiceListing[];
  serviceBookings: ServiceBooking[];
  itemClaims: ItemProtectionClaim[];
  subscriptionPlans: SubscriptionPlan[];
  userSubscriptions: UserSubscription[];
  notifications: AppNotification[];
  transactions: Transaction[];
  activeView: string;
  setActiveView: (view: string) => void;

  // Auth / Role Control
  loginWithCredentials: (email: string, password?: string, targetRole?: UserRole) => { success: boolean; user?: User; error?: string };
  logout: () => void;
  registerUser: (newUser: Partial<User>) => { success: boolean; user?: User; error?: string };
  isAIChatOpen: boolean;
  setIsAIChatOpen: (open: boolean) => void;

  // Gig Marketplace Actions
  postGigJob: (job: Omit<GigJob, 'id' | 'hostId' | 'hostName' | 'filledSlots' | 'waitingListCount' | 'status' | 'createdAt'>) => { success: boolean; error?: string };
  bookGigSlot: (jobId: string) => { success: boolean; error?: string; waitingListRequired?: boolean };
  joinWaitingList: (jobId: string) => { success: boolean; position: number };
  cancelGigBooking: (bookingId: string) => void;
  referSlotsBulk: (jobId: string, count: number) => { success: boolean; message: string };
  checkInGig: (bookingId: string) => void;
  checkOutGig: (bookingId: string) => void;
  approveGigCompletion: (bookingId: string) => void;

  // Local Services Actions
  createServiceListing: (listing: Omit<ServiceListing, 'id' | 'partnerId' | 'partnerName' | 'partnerAvatar' | 'rating' | 'reviewsCount' | 'verifiedBadges'>) => void;
  bookService: (serviceId: string, details: { date: string; timeSlot: string; estimatedHours?: number; clientAddress: string }) => { success: boolean; error?: string };
  checkInServiceBooking: (bookingId: string) => void;
  checkOutServiceBooking: (bookingId: string) => void;
  approveServiceBooking: (bookingId: string) => void;
  reviewServiceBooking: (bookingId: string, rating: number, comment: string) => void;

  // Claims & Protection
  submitItemClaim: (claim: Omit<ItemProtectionClaim, 'id' | 'hostId' | 'hostName' | 'status' | 'submittedAt'>) => void;
  resolveItemClaim: (claimId: string, approved: boolean, compensationAmount?: number) => void;

  // Subscriptions
  purchaseSubscription: (planId: 'direct_rehire' | 'extended_visibility' | 'new_host_promo') => void;
  activateExtendedVisibility: (jobId: string) => void;
  directRehirePartner: (partnerId: string, title: string, pay: number) => void;

  // Admin Controls
  verifyUserKyc: (userId: string) => void;
  suspendUser: (userId: string, reason: string) => void;
  restoreUser: (userId: string) => void;

  // Notifications
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  bannerAlert: { title: string; message: string; type?: 'info' | 'success' | 'warning' } | null;
  clearBannerAlert: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'lokworks_marketplace_state_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from LocalStorage if available with backwards compatibility
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(u => u.id));
        const merged: User[] = parsed.map(u => {
          const initial = INITIAL_USERS.find(iu => iu.id === u.id);
          return {
            ...u,
            password: u.password || initial?.password || 'password123',
            gender: u.gender || initial?.gender || 'Prefer not to say',
            fullName: u.fullName || u.name,
            mobile: u.mobile || u.phone,
            isCollegeStudent: u.isCollegeStudent ?? u.isStudent ?? initial?.isCollegeStudent ?? false,
            age: u.age || initial?.age,
            collegeName: u.collegeName || initial?.collegeName,
          };
        });
        for (const iu of INITIAL_USERS) {
          if (!existingIds.has(iu.id)) {
            merged.push(iu);
          }
        }
        return merged;
      } catch (e) {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // 1. Session storage has active authenticated session for the current browser session/tab
    try {
      const sessionSaved = sessionStorage.getItem(`${STORAGE_KEY}_currUser`);
      if (sessionSaved) {
        return JSON.parse(sessionSaved);
      }
    } catch (e) {
      // ignore
    }

    // Unauthenticated visitor starts with null (displaying login page first on any shared link)
    // Clear any stale persistent storage user to prevent unintended auto-login on shared URLs
    try {
      localStorage.removeItem(`${STORAGE_KEY}_currUser`);
    } catch (e) {
      // ignore
    }
    return null;
  });

  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const [gigJobs, setGigJobs] = useState<GigJob[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_gigJobs`);
    return saved ? JSON.parse(saved) : INITIAL_GIG_JOBS;
  });

  const [gigBookings, setGigBookings] = useState<GigBooking[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_gigBookings`);
    return saved ? JSON.parse(saved) : INITIAL_GIG_BOOKINGS;
  });

  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_waitingList`);
    return saved ? JSON.parse(saved) : INITIAL_WAITING_LIST;
  });

  const [serviceListings, setServiceListings] = useState<ServiceListing[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_serviceListings`);
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_LISTINGS;
  });

  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_serviceBookings`);
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_BOOKINGS;
  });

  const [itemClaims, setItemClaims] = useState<ItemProtectionClaim[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_itemClaims`);
    return saved ? JSON.parse(saved) : INITIAL_ITEM_CLAIMS;
  });

  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_userSubscriptions`);
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [bannerAlert, setBannerAlert] = useState<{ title: string; message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      try {
        sessionStorage.setItem(`${STORAGE_KEY}_currUser`, JSON.stringify(currentUser));
        localStorage.setItem(`${STORAGE_KEY}_currUser`, JSON.stringify(currentUser));
      } catch (e) {
        // ignore
      }
    } else {
      try {
        sessionStorage.removeItem(`${STORAGE_KEY}_currUser`);
        localStorage.removeItem(`${STORAGE_KEY}_currUser`);
      } catch (e) {
        // ignore
      }
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_gigJobs`, JSON.stringify(gigJobs));
  }, [gigJobs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_gigBookings`, JSON.stringify(gigBookings));
  }, [gigBookings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_waitingList`, JSON.stringify(waitingList));
  }, [waitingList]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_serviceListings`, JSON.stringify(serviceListings));
  }, [serviceListings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_serviceBookings`, JSON.stringify(serviceBookings));
  }, [serviceBookings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_itemClaims`, JSON.stringify(itemClaims));
  }, [itemClaims]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_userSubscriptions`, JSON.stringify(userSubscriptions));
  }, [userSubscriptions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  // Dynamic monthly reset for College Student academic work limits at beginning of a new calendar month
  useEffect(() => {
    const currentMonthKey = new Date().toISOString().slice(0, 7); // e.g., '2026-10'
    setUsers(prevUsers => {
      let changed = false;
      const updated = prevUsers.map(u => {
        if (u.isStudent) {
          if (u.studentWorkLimitMonth && u.studentWorkLimitMonth !== currentMonthKey) {
            changed = true;
            return {
              ...u,
              studentJobsCompletedThisMonth: 0,
              studentWorkLimitMonth: currentMonthKey,
            };
          } else if (!u.studentWorkLimitMonth) {
            changed = true;
            return {
              ...u,
              studentWorkLimitMonth: currentMonthKey,
            };
          }
        }
        return u;
      });
      return changed ? updated : prevUsers;
    });

    if (currentUser && currentUser.isStudent) {
      if (currentUser.studentWorkLimitMonth && currentUser.studentWorkLimitMonth !== currentMonthKey) {
        setCurrentUser(prev => prev ? {
          ...prev,
          studentJobsCompletedThisMonth: 0,
          studentWorkLimitMonth: currentMonthKey,
        } : null);
      } else if (!currentUser.studentWorkLimitMonth) {
        setCurrentUser(prev => prev ? {
          ...prev,
          studentWorkLimitMonth: currentMonthKey,
        } : null);
      }
    }
  }, [currentUser?.id]);

  const clearBannerAlert = () => setBannerAlert(null);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (notif.type === 'urgent_broadcast') {
      playExtendedVisibilityBroadcast();
    } else {
      playNotificationChime();
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const ROLE_ALLOWED_VIEWS: Record<UserRole, string[]> = {
    gig_partner: ['dashboard', 'gigs_browse', 'map_view', 'my_bookings', 'profile', 'refer_slot'],
    gig_host: ['dashboard', 'post_gig', 'my_gigs', 'claims', 'subscriptions', 'rehire_partners', 'approvals'],
    client: ['dashboard', 'services_browse', 'map_view', 'my_bookings', 'subscriptions'],
    service_partner: ['dashboard', 'my_services', 'my_bookings', 'profile', 'add_service', 'credentials'],
    admin: ['dashboard', 'admin_jobs', 'admin_escrow', 'admin_claims', 'admin_users'],
  };

  // Browser URL hash-based strict access control listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').trim();
      if (!hash) return;
      const parts = hash.split('/');
      const requestedRoleOrView = parts[0];
      const requestedSubView = parts[1] || 'dashboard';

      const validRoles: UserRole[] = ['gig_partner', 'gig_host', 'client', 'service_partner', 'admin'];

      if (validRoles.includes(requestedRoleOrView as UserRole)) {
        const targetRole = requestedRoleOrView as UserRole;
        if (!currentUser) {
          // Unauthenticated: do not redirect away to #/, leave for LoginPage
          return;
        }

        if (currentUser.role !== targetRole) {
          // STRICT ACCESS CONTROL BLOCK!
          setBannerAlert({
            title: '403 Forbidden: Access Denied',
            message: `As a ${currentUser.role.replace('_', ' ')}, you are strictly prohibited from accessing ${targetRole.replace('_', ' ')} pages. Redirected to your dashboard.`,
            type: 'warning',
          });
          // App.tsx renders the 403 route protection view and safely redirects
          setActiveView('dashboard');
          return;
        }

        // Permitted
        const allowed = ROLE_ALLOWED_VIEWS[currentUser.role];
        if (allowed.includes(requestedSubView)) {
          setActiveView(requestedSubView);
        } else {
          setActiveView('dashboard');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  const formatRoleTitle = (role?: UserRole): string => {
    switch (role) {
      case 'gig_host': return 'Gig Host';
      case 'gig_partner': return 'Gig Partner';
      case 'client': return 'Client';
      case 'service_partner': return 'Service Partner';
      case 'admin': return 'Admin Monitor';
      default: return 'User';
    }
  };

  const loginWithCredentials = (email: string, password?: string, targetRole?: UserRole) => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Lookup user by registered email
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: 'Invalid email or password. No account registered with this email.' };
    }

    // Verify password
    const validPassword = user.password || 'password123';
    if (password !== validPassword) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Authenticated successfully: assign session and route to user's assigned role dashboard
    try {
      sessionStorage.setItem(`${STORAGE_KEY}_currUser`, JSON.stringify(user));
      localStorage.setItem(`${STORAGE_KEY}_currUser`, JSON.stringify(user));
    } catch (e) {
      // ignore
    }
    setCurrentUser(user);
    setActiveView('dashboard');
    window.location.hash = `#/${user.role}/dashboard`;

    addNotification({
      recipientId: user.id,
      roleTarget: user.role,
      title: 'Portal Access Authenticated',
      message: `Signed in as ${user.name} (${formatRoleTitle(user.role)}). Access granted to your portal.`,
      type: 'alert',
    });

    return { success: true, user };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
    localStorage.removeItem(`${STORAGE_KEY}_currUser`);
    sessionStorage.removeItem(`${STORAGE_KEY}_currUser`);
    window.location.hash = '#/login';
  };

  const registerUser = (data: Partial<User>) => {
    const displayName = (data.fullName || data.name || '').trim();
    if (!displayName) {
      return { success: false, error: 'Full name is required.' };
    }
    const cleanEmail = (data.email || '').toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!data.role) {
      return { success: false, error: 'Account role is required.' };
    }

    const mobileRaw = (data.mobile || data.phone || '').trim();
    const digitsOnly = mobileRaw.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }

    if (!data.location || !data.location.trim()) {
      return { success: false, error: 'Location / Area is required.' };
    }

    if (!data.password || data.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    // Check duplicate email for the SAME role
    const existingForRole = users.find(u => u.email.toLowerCase() === cleanEmail && u.role === data.role);
    if (existingForRole) {
      return {
        success: false,
        error: `An account with this email is already registered as a ${formatRoleTitle(data.role)}. Please sign in or use a different email.`,
      };
    }

    const isStudentVal = Boolean(data.isCollegeStudent ?? data.isStudent);

    const newUser: User = {
      id: `user_${data.role}_${Date.now()}`,
      name: displayName,
      fullName: displayName,
      email: cleanEmail,
      phone: mobileRaw.startsWith('+') ? mobileRaw : `+91 ${mobileRaw}`,
      mobile: mobileRaw.startsWith('+') ? mobileRaw : `+91 ${mobileRaw}`,
      role: data.role,
      avatar: data.avatar || (
        data.gender === 'Female' 
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
      ),
      location: data.location.trim(),
      category: data.category || (data.role === 'gig_host' || data.role === 'gig_partner' ? 'micro_gig' : 'local_services'),
      gender: data.gender || 'Prefer not to say',
      password: data.password,
      isStudent: isStudentVal,
      isCollegeStudent: isStudentVal,
      age: data.age,
      collegeName: isStudentVal ? data.collegeName : undefined,
      studentWorkLimit: isStudentVal ? 8 : undefined,
      studentJobsCompletedThisMonth: isStudentVal ? 0 : undefined,
      reliabilityScore: 95,
      rating: 5.0,
      reviewCount: 0,
      cancellationCount: 0,
      cancellationRate: 0,
      isSuspended: false,
      verificationStatus: {
        kycGovtId: true,
        skillVerified: data.role === 'service_partner',
        experiencedPro: data.role === 'service_partner',
        phoneVerified: true,
        emailVerified: true,
      },
      skills: data.skills || (
        data.role === 'service_partner' 
          ? ['Master Professional Service', 'Safety Compliance']
          : data.role === 'gig_partner'
          ? ['Event Assistance', 'Retail Stocking', 'General Ops']
          : ['General Management']
      ),
      experienceYears: data.experienceYears,
      walletBalance: data.role === 'gig_host' ? 25000 : data.role === 'client' ? 12000 : 2500,
      escrowLockedBalance: 0,
      bio: data.bio || `Registered ${formatRoleTitle(data.role)} on LokWorks platform.`,
      activeSubscriptions: [],
    };

    setUsers(prev => [...prev, newUser]);
    // NOTE: Keep user unlogged so they see the Registration Complete confirmation with "Continue to Sign In"
    return { success: true, user: newUser };
  };

  // Gig Job Creation
  const postGigJob = (jobData: Omit<GigJob, 'id' | 'hostId' | 'hostName' | 'filledSlots' | 'waitingListCount' | 'status' | 'createdAt'>) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    const totalEscrowRequired = jobData.requiredWorkers * jobData.payPerWorker;

    const newJob: GigJob = {
      ...jobData,
      id: `gig_job_${Date.now()}`,
      hostId: currentUser.id,
      hostName: currentUser.name,
      filledSlots: 0,
      waitingListCount: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    setGigJobs(prev => [newJob, ...prev]);

    // Update host locked escrow balance
    setCurrentUser(prev => prev ? { 
      ...prev, 
      escrowLockedBalance: prev.escrowLockedBalance + totalEscrowRequired 
    } : null);

    setUsers(prev => prev.map(u => u.id === currentUser.id ? {
      ...u,
      escrowLockedBalance: u.escrowLockedBalance + totalEscrowRequired
    } : u));

    // Record escrow transaction
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      amount: totalEscrowRequired,
      type: 'escrow_lock',
      relatedJobId: newJob.id,
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: `ESC-JOB-${Math.floor(10000 + Math.random() * 90000)}`,
    };
    setTransactions(prev => [newTx, ...prev]);

    addNotification({
      recipientId: currentUser.id,
      roleTarget: 'gig_host',
      title: 'Job Published & Escrow Locked',
      message: `Your gig "${jobData.title}" is live! ₹${totalEscrowRequired.toLocaleString('en-IN')} has been safely secured in platform escrow.`,
      type: 'escrow',
    });

    return { success: true };
  };

  // Gig Slot Booking
  const bookGigSlot = (jobId: string) => {
    if (!currentUser || currentUser.role !== 'gig_partner') {
      return { success: false, error: 'Only Gig Partners can book gig slots.' };
    }

    if (currentUser.isSuspended) {
      return { success: false, error: `Account suspended until ${currentUser.suspensionEndDate || '2 weeks'}. Reason: ${currentUser.suspensionReason}` };
    }

    // Check Student academic limit
    if (currentUser.isStudent && (currentUser.studentJobsCompletedThisMonth ?? 0) >= (currentUser.studentWorkLimit ?? 8)) {
      return { 
        success: false, 
        error: `Monthly Work Limit Reached! As a college student, you have reached your monthly limit of ${currentUser.studentWorkLimit ?? 8} jobs for this month to protect your study hours.` 
      };
    }

    const job = gigJobs.find(j => j.id === jobId);
    if (!job) return { success: false, error: 'Job not found.' };

    // Check if partner already booked
    const existing = gigBookings.find(b => b.jobId === jobId && b.partnerId === currentUser.id && b.status !== 'cancelled');
    if (existing) {
      return { success: false, error: 'You already have an active booking or slot reservation for this job.' };
    }

    // Check if slots are full -> Waiting list required (Scenario B)
    if (job.filledSlots >= job.requiredWorkers) {
      return { success: false, waitingListRequired: true, error: 'All slots are filled! You can join the waiting list.' };
    }

    // Book slot
    const platformFee = Math.round(job.payPerWorker * 0.1); // 10%
    const payout = job.payPerWorker - platformFee;

    const newBooking: GigBooking = {
      id: `booking_${Date.now()}`,
      jobId,
      partnerId: currentUser.id,
      partnerName: currentUser.name,
      partnerAvatar: currentUser.avatar,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      escrowStatus: 'held_in_escrow',
      payoutAmount: payout,
      platformFee,
    };

    setGigBookings(prev => [newBooking, ...prev]);

    // Update job filled slots count
    setGigJobs(prev => prev.map(j => j.id === jobId ? { ...j, filledSlots: j.filledSlots + 1 } : j));

    // Notify Partner
    addNotification({
      recipientId: currentUser.id,
      roleTarget: 'gig_partner',
      title: 'Slot Confirmed!',
      message: `You booked a slot for "${job.title}". Check-in will open when you arrive at ${job.location.area}.`,
      type: 'booking',
    });

    // Notify Host
    addNotification({
      recipientId: job.hostId,
      roleTarget: 'gig_host',
      title: 'New Partner Booked Slot',
      message: `${currentUser.name} has reserved a slot for "${job.title}". Slots filled: ${job.filledSlots + 1}/${job.requiredWorkers}.`,
      type: 'booking',
    });

    return { success: true };
  };

  // Join Waiting List
  const joinWaitingList = (jobId: string) => {
    if (!currentUser || currentUser.role !== 'gig_partner') {
      return { success: false, position: 0 };
    }

    const currentWaitlistForJob = waitingList.filter(w => w.jobId === jobId);
    const newPosition = currentWaitlistForJob.length + 1;

    const entry: WaitingListEntry = {
      id: `waitlist_${Date.now()}`,
      jobId,
      partnerId: currentUser.id,
      partnerName: currentUser.name,
      position: newPosition,
      joinedAt: new Date().toISOString(),
    };

    setWaitingList(prev => [...prev, entry]);
    setGigJobs(prev => prev.map(j => j.id === jobId ? { ...j, waitingListCount: j.waitingListCount + 1 } : j));

    addNotification({
      recipientId: currentUser.id,
      roleTarget: 'gig_partner',
      title: `Joined Waiting List (Position #${newPosition})`,
      message: `You are in line at position #${newPosition}. If any confirmed partner cancels, your slot will automatically activate!`,
      type: 'waitlist',
    });

    return { success: true, position: newPosition };
  };

  // Cancel Booking & Auto-Promote Waitlist (Scenario B & G)
  const cancelGigBooking = (bookingId: string) => {
    const booking = gigBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const job = gigJobs.find(j => j.id === booking.jobId);
    if (!job) return;

    // Mark booking cancelled
    setGigBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));

    // Update partner cancellation metrics & check penalty (Scenario G)
    const partner = users.find(u => u.id === booking.partnerId);
    if (partner) {
      const newCancels = partner.cancellationCount + 1;
      let newRelScore = Math.max(partner.reliabilityScore - 12, 35);
      let shouldSuspend = newCancels >= 3;

      const updatedPartner: User = {
        ...partner,
        cancellationCount: newCancels,
        reliabilityScore: newRelScore,
        isSuspended: shouldSuspend,
        suspensionReason: shouldSuspend ? 'Excessive cancellations (3+ confirmed gigs cancelled within 30 days).' : undefined,
        suspensionEndDate: shouldSuspend ? '21 Days' : undefined,
      };

      setUsers(prev => prev.map(u => u.id === partner.id ? updatedPartner : u));
      if (currentUser?.id === partner.id) {
        setCurrentUser(updatedPartner);
      }

      if (shouldSuspend) {
        addNotification({
          recipientId: partner.id,
          roleTarget: 'gig_partner',
          title: 'Account Suspended (3-Week Limit)',
          message: `Your account has been temporarily suspended due to repeated cancellations (${newCancels} cancellations). New bookings are locked.`,
          type: 'alert',
        });
      } else {
        addNotification({
          recipientId: partner.id,
          roleTarget: 'gig_partner',
          title: 'Booking Cancelled',
          message: `You cancelled your booking for "${job.title}". Reliability score adjusted to ${newRelScore}/100.`,
          type: 'booking',
        });
      }
    }

    // Check if someone is on the waiting list for this job! (Scenario B auto-promotion)
    const jobWaitlist = waitingList.filter(w => w.jobId === job.id).sort((a, b) => a.position - b.position);
    if (jobWaitlist.length > 0) {
      const nextInLine = jobWaitlist[0];
      const promotedUser = users.find(u => u.id === nextInLine.partnerId);

      // Create new confirmed booking for the promoted partner
      const platformFee = Math.round(job.payPerWorker * 0.1);
      const promotedBooking: GigBooking = {
        id: `booking_promoted_${Date.now()}`,
        jobId: job.id,
        partnerId: nextInLine.partnerId,
        partnerName: nextInLine.partnerName,
        partnerAvatar: promotedUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        status: 'confirmed',
        bookedAt: new Date().toISOString(),
        escrowStatus: 'held_in_escrow',
        payoutAmount: job.payPerWorker - platformFee,
        platformFee,
      };

      setGigBookings(prev => [promotedBooking, ...prev]);

      // Remove from waiting list and decrement positions of remaining
      setWaitingList(prev => 
        prev.filter(w => w.id !== nextInLine.id).map(w => 
          w.jobId === job.id ? { ...w, position: w.position - 1 } : w
        )
      );

      setGigJobs(prev => prev.map(j => j.id === job.id ? { 
        ...j, 
        waitingListCount: Math.max(j.waitingListCount - 1, 0) 
      } : j));

      // Notify the promoted user!
      addNotification({
        recipientId: nextInLine.partnerId,
        roleTarget: 'gig_partner',
        title: '🎉 Promoted from Waiting List!',
        message: `A slot opened for "${job.title}"! Your waiting list request was automatically promoted to Confirmed.`,
        type: 'waitlist',
      });

      // Notify the host
      addNotification({
        recipientId: job.hostId,
        roleTarget: 'gig_host',
        title: 'Slot Reallocated from Waitlist',
        message: `${nextInLine.partnerName} has automatically received the slot vacated by a cancellation.`,
        type: 'booking',
      });
    } else {
      // Decrement filled slots count
      setGigJobs(prev => prev.map(j => j.id === job.id ? { ...j, filledSlots: Math.max(j.filledSlots - 1, 0) } : j));
    }
  };

  // Bulk Refer Slot (Scenario C)
  const referSlotsBulk = (jobId: string, count: number) => {
    const job = gigJobs.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Job not found' };

    const available = job.requiredWorkers - job.filledSlots;
    if (count > available) {
      return { success: false, message: `Only ${available} slots available for referral group.` };
    }

    const groupId = `grp_referral_${Date.now()}`;
    const newBookings: GigBooking[] = Array.from({ length: count }).map((_, i) => ({
      id: `booking_ref_${Date.now()}_${i + 1}`,
      jobId,
      partnerId: `synthetic_ref_friend_${i + 1}`,
      partnerName: `Referral Teammate #${i + 1}`,
      partnerAvatar: `https://images.unsplash.com/photo-${1530000000000 + i * 200000}?auto=format&fit=crop&w=150&q=80`,
      status: 'confirmed' as BookingStatus,
      bookedAt: new Date().toISOString(),
      escrowStatus: 'held_in_escrow' as const,
      payoutAmount: Math.round(job.payPerWorker * 0.9),
      platformFee: Math.round(job.payPerWorker * 0.1),
      referralGroupId: groupId,
    }));

    setGigBookings(prev => [...newBookings, ...prev]);
    setGigJobs(prev => prev.map(j => j.id === jobId ? { ...j, filledSlots: j.filledSlots + count } : j));

    addNotification({
      recipientId: job.hostId,
      roleTarget: 'gig_host',
      title: 'Bulk Slots Reserved via Referral',
      message: `${count} friends joined slot together for "${job.title}". Slots filled: ${job.filledSlots + count}/${job.requiredWorkers}.`,
      type: 'booking',
    });

    return { success: true, message: `Successfully reserved ${count} slots for your friends!` };
  };

  // Check-In Gig (GPS Simulation verified)
  const checkInGig = (bookingId: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setGigBookings(prev => prev.map(b => b.id === bookingId ? {
      ...b,
      status: 'arrived_checked_in',
      checkedInAt: now,
    } : b));

    const booking = gigBookings.find(b => b.id === bookingId);
    if (booking) {
      const job = gigJobs.find(j => j.id === booking.jobId);
      addNotification({
        recipientId: job?.hostId || '',
        roleTarget: 'gig_host',
        title: 'Partner Arrived & Checked In',
        message: `${booking.partnerName} checked in at ${now} for "${job?.title}". Work in progress.`,
        type: 'checkin',
      });
    }
  };

  // Check-Out Gig
  const checkOutGig = (bookingId: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setGigBookings(prev => prev.map(b => b.id === bookingId ? {
      ...b,
      status: 'completed_pending_approval',
      checkedOutAt: now,
    } : b));

    const booking = gigBookings.find(b => b.id === bookingId);
    if (booking) {
      const job = gigJobs.find(j => j.id === booking.jobId);
      addNotification({
        recipientId: job?.hostId || '',
        roleTarget: 'gig_host',
        title: 'Job Completed – Approval Required',
        message: `${booking.partnerName} checked out at ${now}. Please inspect and approve completion to release payment.`,
        type: 'job',
      });
    }
  };

  // Approve Gig Completion & Release Escrow
  const approveGigCompletion = (bookingId: string) => {
    const booking = gigBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const job = gigJobs.find(j => j.id === booking.jobId);
    if (!job) return;

    // Update booking status
    setGigBookings(prev => prev.map(b => b.id === bookingId ? {
      ...b,
      status: 'approved_paid',
      approvedAt: new Date().toISOString(),
      escrowStatus: 'released_to_partner',
    } : b));

    // Credit partner wallet, increment completed jobs
    setUsers(prev => prev.map(u => {
      if (u.id === booking.partnerId) {
        return {
          ...u,
          walletBalance: u.walletBalance + booking.payoutAmount,
          reviewCount: u.reviewCount + 1,
          studentJobsCompletedThisMonth: u.isStudent ? (u.studentJobsCompletedThisMonth ?? 0) + 1 : u.studentJobsCompletedThisMonth,
        };
      }
      if (u.id === job.hostId) {
        return {
          ...u,
          escrowLockedBalance: Math.max(u.escrowLockedBalance - job.payPerWorker, 0),
        };
      }
      return u;
    }));

    if (currentUser?.id === booking.partnerId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        walletBalance: prev.walletBalance + booking.payoutAmount,
        reviewCount: prev.reviewCount + 1,
        studentJobsCompletedThisMonth: prev.isStudent ? (prev.studentJobsCompletedThisMonth ?? 0) + 1 : prev.studentJobsCompletedThisMonth,
      } : null);
    }

    // Platform Fee Transaction
    const tx: Transaction = {
      id: `tx_payout_${Date.now()}`,
      fromUserId: job.hostId,
      fromUserName: job.hostName,
      toUserId: booking.partnerId,
      toUserName: booking.partnerName,
      amount: booking.payoutAmount,
      type: 'escrow_release',
      relatedJobId: job.id,
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: `REL-ESC-${Math.floor(10000 + Math.random() * 90000)}`,
    };
    setTransactions(prev => [tx, ...prev]);

    // Notify Partner
    addNotification({
      recipientId: booking.partnerId,
      roleTarget: 'gig_partner',
      title: `🎉 Payment Released: ₹${booking.payoutAmount.toLocaleString('en-IN')}`,
      message: `Gig Host approved your work for "${job.title}". ₹${booking.payoutAmount} credited to your wallet (10% platform fee deducted).`,
      type: 'escrow',
    });

    // Notify Host
    addNotification({
      recipientId: job.hostId,
      roleTarget: 'gig_host',
      title: 'Payment Released to Partner',
      message: `You approved completion for ${booking.partnerName}. Escrow funds released.`,
      type: 'escrow',
    });
  };

  // Local Services Creation
  const createServiceListing = (data: Omit<ServiceListing, 'id' | 'partnerId' | 'partnerName' | 'partnerAvatar' | 'rating' | 'reviewsCount' | 'verifiedBadges'>) => {
    if (!currentUser || currentUser.role !== 'service_partner') return;

    const newListing: ServiceListing = {
      ...data,
      id: `service_${Date.now()}`,
      partnerId: currentUser.id,
      partnerName: currentUser.name,
      partnerAvatar: currentUser.avatar,
      rating: currentUser.rating,
      reviewsCount: currentUser.reviewCount,
      verifiedBadges: ['Identity Verified', 'Skill Verified'],
    };

    setServiceListings(prev => [newListing, ...prev]);

    addNotification({
      recipientId: currentUser.id,
      roleTarget: 'service_partner',
      title: 'Service Listing Published',
      message: `Your listing "${newListing.title}" is now discoverable by clients in ${newListing.city}.`,
      type: 'job',
    });
  };

  // Book Service Listing (Client)
  const bookService = (serviceId: string, details: { date: string; timeSlot: string; estimatedHours?: number; clientAddress: string }) => {
    if (!currentUser || currentUser.role !== 'client') {
      return { success: false, error: 'Only Clients can book professional services.' };
    }

    const service = serviceListings.find(s => s.id === serviceId);
    if (!service) return { success: false, error: 'Service not found.' };

    // Fixed service / shift price (not calculated based on hours)
    const totalAmount = service.hourlyRate;
    const platformFee = Math.round(totalAmount * 0.1);

    const newBooking: ServiceBooking = {
      id: `sbooking_${Date.now()}`,
      serviceId,
      serviceTitle: service.title,
      partnerId: service.partnerId,
      partnerName: service.partnerName,
      clientId: currentUser.id,
      clientName: currentUser.name,
      clientAddress: details.clientAddress,
      city: service.city,
      date: details.date,
      timeSlot: details.timeSlot,
      estimatedHours: details.estimatedHours,
      totalAmount,
      platformFee,
      escrowStatus: 'held_in_escrow',
      status: 'secured_escrow',
      bookedAt: new Date().toISOString(),
    };

    setServiceBookings(prev => [newBooking, ...prev]);

    // Lock client funds in Escrow
    setCurrentUser(prev => prev ? { ...prev, escrowLockedBalance: prev.escrowLockedBalance + totalAmount } : null);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, escrowLockedBalance: u.escrowLockedBalance + totalAmount } : u));

    // Record Escrow transaction
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId: service.partnerId,
      toUserName: service.partnerName,
      amount: totalAmount,
      type: 'escrow_lock',
      relatedServiceId: service.id,
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: `ESC-SRV-${Math.floor(10000 + Math.random() * 90000)}`,
    };
    setTransactions(prev => [tx, ...prev]);

    // Notify Service Partner
    addNotification({
      recipientId: service.partnerId,
      roleTarget: 'service_partner',
      title: 'New Service Booking Received',
      message: `${currentUser.name} booked "${service.title}" for ${details.date} (${details.timeSlot}). Escrow ₹${totalAmount} secured.`,
      type: 'booking',
    });

    // Notify Client
    addNotification({
      recipientId: currentUser.id,
      roleTarget: 'client',
      title: 'Booking Confirmed & Escrow Held',
      message: `Your booking with ${service.partnerName} is confirmed. ₹${totalAmount} held safely in LokWorks Escrow until you approve completion.`,
      type: 'escrow',
    });

    return { success: true };
  };

  const checkInServiceBooking = (bookingId: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setServiceBookings(prev => prev.map(b => b.id === bookingId ? {
      ...b,
      status: 'partner_checked_in',
      checkedInAt: now,
    } : b));

    const booking = serviceBookings.find(b => b.id === bookingId);
    if (booking) {
      addNotification({
        recipientId: booking.clientId,
        roleTarget: 'client',
        title: 'Service Partner Arrived',
        message: `${booking.partnerName} checked in at your address. Service work started at ${now}.`,
        type: 'checkin',
      });
    }
  };

  const checkOutServiceBooking = (bookingId: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setServiceBookings(prev => prev.map(b => b.id === bookingId ? {
      ...b,
      status: 'work_completed',
      checkedOutAt: now,
    } : b));

    const booking = serviceBookings.find(b => b.id === bookingId);
    if (booking) {
      addNotification({
        recipientId: booking.clientId,
        roleTarget: 'client',
        title: 'Work Completed – Review & Release Escrow',
        message: `${booking.partnerName} has completed the service. Please verify the work and approve to release payment.`,
        type: 'job',
      });
    }
  };

  const approveServiceBooking = (bookingId: string) => {
    const booking = serviceBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const payout = booking.totalAmount - booking.platformFee;
    setServiceBookings(prev => prev.map(b => b.id === bookingId ? {
      ...b,
      status: 'client_approved',
      escrowStatus: 'released',
      approvedAt: new Date().toISOString(),
    } : b));

    // Release payment to Service Partner
    setUsers(prev => prev.map(u => {
      if (u.id === booking.partnerId) {
        return { ...u, walletBalance: u.walletBalance + payout, reviewCount: u.reviewCount + 1 };
      }
      if (u.id === booking.clientId) {
        return { ...u, escrowLockedBalance: Math.max(u.escrowLockedBalance - booking.totalAmount, 0) };
      }
      return u;
    }));

    if (currentUser?.id === booking.clientId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        escrowLockedBalance: Math.max(prev.escrowLockedBalance - booking.totalAmount, 0),
      } : null);
    }

    // Transaction record
    const tx: Transaction = {
      id: `tx_srv_rel_${Date.now()}`,
      fromUserId: booking.clientId,
      fromUserName: booking.clientName,
      toUserId: booking.partnerId,
      toUserName: booking.partnerName,
      amount: payout,
      type: 'escrow_release',
      relatedServiceId: booking.serviceId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: `REL-SRV-${Math.floor(10000 + Math.random() * 90000)}`,
    };
    setTransactions(prev => [tx, ...prev]);

    // Notify Service Partner
    addNotification({
      recipientId: booking.partnerId,
      roleTarget: 'service_partner',
      title: `🎉 Payment Released: ₹${payout.toLocaleString('en-IN')}`,
      message: `${booking.clientName} approved service completion. ₹${payout} credited to your wallet (10% platform fee deducted).`,
      type: 'escrow',
    });
  };

  const reviewServiceBooking = (bookingId: string, rating: number, comment: string) => {
    setServiceBookings(prev => prev.map(b => b.id === bookingId ? {
      ...b,
      clientReview: { rating, comment, createdAt: new Date().toISOString() }
    } : b));

    const booking = serviceBookings.find(b => b.id === bookingId);
    if (booking) {
      addNotification({
        recipientId: booking.partnerId,
        roleTarget: 'service_partner',
        title: `New Client Review (${rating} ★)`,
        message: `"${comment}" - ${booking.clientName}`,
        type: 'job',
      });
    }
  };

  // Submit Claim
  const submitItemClaim = (data: Omit<ItemProtectionClaim, 'id' | 'hostId' | 'hostName' | 'status' | 'submittedAt'>) => {
    if (!currentUser) return;

    const newClaim: ItemProtectionClaim = {
      ...data,
      id: `claim_${Date.now()}`,
      hostId: currentUser.id,
      hostName: currentUser.name,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    setItemClaims(prev => [newClaim, ...prev]);

    // Notify Admin
    addNotification({
      recipientId: 'user_admin_monitor',
      roleTarget: 'admin',
      title: 'Item Protection Claim Submitted',
      message: `${currentUser.name} reported ₹${data.claimedValue} damage/loss on "${data.jobTitle}".`,
      type: 'claim',
    });

    addNotification({
      recipientId: currentUser.id,
      roleTarget: 'gig_host',
      title: 'Claim Submitted Successfully',
      message: `Your item protection claim for ₹${data.claimedValue} is under administrative review.`,
      type: 'claim',
    });
  };

  // Admin Resolve Claim
  const resolveItemClaim = (claimId: string, approved: boolean, compensationAmount?: number) => {
    const claim = itemClaims.find(c => c.id === claimId);
    if (!claim) return;

    const finalAmount = compensationAmount || claim.claimedValue;

    setItemClaims(prev => prev.map(c => c.id === claimId ? {
      ...c,
      status: approved ? 'approved' : 'rejected',
      compensationAmount: approved ? finalAmount : 0,
      resolvedAt: new Date().toISOString(),
    } : c));

    if (approved) {
      // Refund merchant
      setUsers(prev => prev.map(u => u.id === claim.hostId ? { ...u, walletBalance: u.walletBalance + finalAmount } : u));
      if (currentUser?.id === claim.hostId) {
        setCurrentUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance + finalAmount } : null);
      }

      addNotification({
        recipientId: claim.hostId,
        roleTarget: 'gig_host',
        title: 'Item Protection Claim Approved',
        message: `Your claim has been approved! Compensation of ₹${finalAmount.toLocaleString('en-IN')} refunded to your wallet.`,
        type: 'claim',
      });
    } else {
      addNotification({
        recipientId: claim.hostId,
        roleTarget: 'gig_host',
        title: 'Item Protection Claim Rejected',
        message: 'Evidence provided did not meet platform reimbursement criteria after audit.',
        type: 'claim',
      });
    }
  };

  // Subscriptions
  const purchaseSubscription = (planId: 'direct_rehire' | 'extended_visibility' | 'new_host_promo') => {
    if (!currentUser) return;
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return;

    const newSub: UserSubscription = {
      id: `sub_${Date.now()}`,
      userId: currentUser.id,
      planId,
      planName: plan.title,
      amountPaid: plan.price,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + plan.validityDays * 86400000).toISOString(),
      status: 'active',
    };

    setUserSubscriptions(prev => [newSub, ...prev]);

    // Update user activeSubscriptions list
    const updatedSubs = Array.from(new Set([...(currentUser.activeSubscriptions || []), planId]));
    setCurrentUser(prev => prev ? { ...prev, activeSubscriptions: updatedSubs } : null);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, activeSubscriptions: updatedSubs } : u));

    // Record subscription transaction
    const tx: Transaction = {
      id: `tx_sub_${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      amount: plan.price,
      type: 'subscription_purchase',
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: `SUB-${planId.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setTransactions(prev => [tx, ...prev]);

    addNotification({
      recipientId: currentUser.id,
      roleTarget: currentUser.role,
      title: `${plan.title} Activated!`,
      message: `You now have active access to ${plan.title} for ${plan.validityDays} days.`,
      type: 'subscription',
    });
  };

  // Extended Visibility Broadcast (Scenario H)
  const activateExtendedVisibility = (jobId: string) => {
    const job = gigJobs.find(j => j.id === jobId);
    if (!job) return;

    setGigJobs(prev => prev.map(j => j.id === jobId ? {
      ...j,
      extendedVisibilityActive: true,
      extendedVisibilityUntil: '6 Hours Added',
    } : j));

    // Broadcast urgent notification + sound to all gig partners
    addNotification({
      recipientId: 'all',
      roleTarget: 'gig_partner',
      title: `⚡ URGENT GIG ALERT: ${job.title}`,
      message: `Extended visibility active! ₹${job.payPerWorker} per worker in ${job.location.area}. Open slots available right now. Tap to claim!`,
      type: 'urgent_broadcast',
    });

    setBannerAlert({
      title: 'Extended Visibility Broadcast Sent!',
      message: `Audible broadcast and high-priority push delivered to all active verified partners near ${job.location.area}.`,
      type: 'success',
    });
  };

  // Direct Rehire (Scenario I)
  const directRehirePartner = (partnerId: string, title: string, pay: number) => {
    if (!currentUser) return;
    const partner = users.find(u => u.id === partnerId);
    if (!partner) return;

    const newJob: GigJob = {
      id: `gig_job_rehire_${Date.now()}`,
      hostId: currentUser.id,
      hostName: currentUser.name,
      title: `[Direct Rehire] ${title}`,
      description: `Exclusive direct rehire reservation for proven 5-star partner ${partner.name}.`,
      category: 'event_helper',
      location: {
        city: 'Bengaluru',
        area: 'Indiranagar / Metro Hub',
        address: 'Direct Client Site',
        lat: 12.9716,
        lng: 77.6412,
      },
      date: '2026-10-14',
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      requiredWorkers: 1,
      filledSlots: 1,
      payPerWorker: pay,
      skillsRequired: partner.skills,
      status: 'open',
      waitingListCount: 0,
      createdAt: new Date().toISOString(),
    };

    setGigJobs(prev => [newJob, ...prev]);

    const booking: GigBooking = {
      id: `booking_rehire_${Date.now()}`,
      jobId: newJob.id,
      partnerId: partner.id,
      partnerName: partner.name,
      partnerAvatar: partner.avatar,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      escrowStatus: 'held_in_escrow',
      payoutAmount: Math.round(pay * 0.9),
      platformFee: Math.round(pay * 0.1),
    };

    setGigBookings(prev => [booking, ...prev]);

    addNotification({
      recipientId: partner.id,
      roleTarget: 'gig_partner',
      title: '⭐ Direct Rehire Offer Received!',
      message: `${currentUser.name} hired you directly for "${newJob.title}" at ₹${pay}. Confirmed slot reserved in your dashboard!`,
      type: 'booking',
    });

    setBannerAlert({
      title: 'Direct Rehire Confirmed!',
      message: `${partner.name} has been directly booked for ₹${pay}. Slot is confirmed in escrow.`,
      type: 'success',
    });
  };

  // Admin Controls
  const verifyUserKyc = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      verificationStatus: {
        ...u.verificationStatus,
        kycGovtId: true,
        skillVerified: true,
        experiencedPro: true,
      }
    } : u));

    addNotification({
      recipientId: userId,
      roleTarget: 'all',
      title: 'Verification Approved',
      message: 'Your government KYC identity and skill assessment have been verified by Platform Admin.',
      type: 'alert',
    });
  };

  const suspendUser = (userId: string, reason: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      isSuspended: true,
      suspensionReason: reason,
      suspensionEndDate: '21 Days',
    } : u));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        isSuspended: true,
        suspensionReason: reason,
        suspensionEndDate: '21 Days',
      } : null);
    }

    addNotification({
      recipientId: userId,
      roleTarget: 'all',
      title: 'Account Suspended',
      message: `Your account has been suspended: ${reason}`,
      type: 'alert',
    });
  };

  const restoreUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      isSuspended: false,
      suspensionReason: undefined,
      suspensionEndDate: undefined,
    } : u));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        isSuspended: false,
        suspensionReason: undefined,
        suspensionEndDate: undefined,
      } : null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        gigJobs,
        gigBookings,
        waitingList,
        serviceListings,
        serviceBookings,
        itemClaims,
        subscriptionPlans: SUBSCRIPTION_PLANS,
        userSubscriptions,
        notifications,
        transactions,
        activeView,
        setActiveView,
        loginWithCredentials,
        logout,
        registerUser,
        isAIChatOpen,
        setIsAIChatOpen,
        postGigJob,
        bookGigSlot,
        joinWaitingList,
        cancelGigBooking,
        referSlotsBulk,
        checkInGig,
        checkOutGig,
        approveGigCompletion,
        createServiceListing,
        bookService,
        checkInServiceBooking,
        checkOutServiceBooking,
        approveServiceBooking,
        reviewServiceBooking,
        submitItemClaim,
        resolveItemClaim,
        purchaseSubscription,
        activateExtendedVisibility,
        directRehirePartner,
        verifyUserKyc,
        suspendUser,
        restoreUser,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        bannerAlert,
        clearBannerAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
