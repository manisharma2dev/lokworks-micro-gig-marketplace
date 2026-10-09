export type UserRole = 'gig_host' | 'gig_partner' | 'client' | 'service_partner' | 'admin';

export type MarketplaceCategory = 'micro_gig' | 'local_services';

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  mobile?: string;
  role: UserRole;
  avatar: string;
  location: string;
  category: MarketplaceCategory | 'admin';
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
  password?: string;
  isStudent?: boolean;
  isCollegeStudent?: boolean;
  age?: number;
  collegeName?: string;
  studentWorkLimit?: number; // e.g., 8
  studentJobsCompletedThisMonth?: number; // e.g., 1
  studentWorkLimitMonth?: string; // e.g., '2026-10' (resets automatically each calendar month)
  reliabilityScore: number; // 0 - 100
  rating: number; // 0 - 5
  reviewCount: number;
  cancellationCount: number;
  cancellationRate: number; // %
  isSuspended: boolean;
  suspensionReason?: string;
  suspensionEndDate?: string;
  verificationStatus: {
    kycGovtId: boolean;
    skillVerified: boolean;
    experiencedPro: boolean;
    phoneVerified: boolean;
    emailVerified: boolean;
  };
  skills: string[];
  experienceYears?: number;
  walletBalance: number;
  escrowLockedBalance: number;
  bio?: string;
  activeSubscriptions?: string[];
}

export type GigJobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface GigJob {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  description: string;
  category: 'event_helper' | 'flyer_distribution' | 'store_replenish' | 'queue_standing' | 'packing_warehouse' | 'delivery_errand';
  location: {
    city: string;
    area: string;
    address: string;
    lat: number;
    lng: number;
  };
  date: string;
  startTime: string;
  endTime: string;
  requiredWorkers: number;
  filledSlots: number;
  payPerWorker: number; // in INR ₹
  skillsRequired: string[];
  status: GigJobStatus;
  waitingListCount: number;
  extendedVisibilityActive?: boolean;
  extendedVisibilityUntil?: string;
  isItemProtected?: boolean;
  createdAt: string;
}

export type BookingStatus = 
  | 'confirmed' 
  | 'waiting_list' 
  | 'arrived_checked_in' 
  | 'completed_pending_approval' 
  | 'approved_paid' 
  | 'cancelled';

export interface GigBooking {
  id: string;
  jobId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  status: BookingStatus;
  waitingListPosition?: number;
  bookedAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  approvedAt?: string;
  escrowStatus: 'held_in_escrow' | 'deducting_fee' | 'released_to_partner' | 'refunded';
  payoutAmount: number;
  platformFee: number;
  referralGroupId?: string;
}

export interface WaitingListEntry {
  id: string;
  jobId: string;
  partnerId: string;
  partnerName: string;
  position: number;
  joinedAt: string;
}

export interface ServiceListing {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  title: string;
  trade: 'Electrician' | 'Plumber' | 'Carpenter' | 'AC Technician' | 'Painter' | 'Appliance Repair' | 'Professional Chef';
  experienceYears: number;
  hourlyRate: number; // in INR ₹
  description: string;
  skills: string[];
  areaCoverage: string[];
  city: string;
  rating: number;
  reviewsCount: number;
  verifiedBadges: string[];
  portfolioImages: string[];
  isAvailable: boolean;
}

export type ServiceBookingStatus = 
  | 'pending_confirmation' 
  | 'secured_escrow' 
  | 'partner_checked_in' 
  | 'work_completed' 
  | 'client_approved' 
  | 'cancelled';

export interface ServiceBooking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  partnerId: string;
  partnerName: string;
  clientId: string;
  clientName: string;
  clientAddress: string;
  city: string;
  date: string;
  timeSlot: string;
  estimatedHours?: number;
  totalAmount: number; // in INR ₹ (Fixed service / shift price)
  platformFee: number;
  escrowStatus: 'held_in_escrow' | 'released' | 'refunded';
  status: ServiceBookingStatus;
  bookedAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  approvedAt?: string;
  clientReview?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface ItemProtectionClaim {
  id: string;
  jobId: string;
  jobTitle: string;
  hostId: string;
  hostName: string;
  partnerId: string;
  partnerName: string;
  itemDescription: string;
  claimedValue: number; // in INR ₹
  incidentType: 'stolen' | 'damaged' | 'misused' | 'lost';
  incidentDate: string;
  evidenceNotes: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  compensationAmount?: number;
  submittedAt: string;
  resolvedAt?: string;
}

export interface SubscriptionPlan {
  id: 'direct_rehire' | 'extended_visibility' | 'new_host_promo';
  title: string;
  price: number; // ₹3,999, ₹4,999, ₹6,999
  validityDays: number;
  features: string[];
  description: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: 'direct_rehire' | 'extended_visibility' | 'new_host_promo';
  planName: string;
  amountPaid: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired';
}

export interface AppNotification {
  id: string;
  recipientId: string;
  roleTarget: UserRole | 'all';
  title: string;
  message: string;
  type: 'job' | 'booking' | 'waitlist' | 'checkin' | 'escrow' | 'claim' | 'subscription' | 'alert' | 'urgent_broadcast';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  meta?: any;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId?: string;
  toUserName?: string;
  amount: number;
  type: 'escrow_lock' | 'escrow_release' | 'platform_commission' | 'claim_refund' | 'subscription_purchase';
  relatedJobId?: string;
  relatedServiceId?: string;
  timestamp: string;
  status: 'completed' | 'pending';
  referenceId: string;
}
