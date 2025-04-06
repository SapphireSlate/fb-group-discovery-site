export interface User {
  id: string;
  email: string;
  password?: string; // Hashed
  displayName: string;
  avatar?: string; // URL
  createdAt: Date;
  lastLogin?: Date;
  reputation: number;
  submittedGroups: string[]; // Group IDs
  upvotedGroups: string[]; // Group IDs
  downvotedGroups: string[]; // Group IDs
}

export interface Group {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  size?: number;
  activityLevel?: string;
  screenshot?: string; // URL
  submittedBy: string; // User ID
  submittedAt: Date;
  lastVerified?: Date;
  upvotes: number;
  downvotes: number;
  averageRating: number;
  viewCount: number;
  isPrivate: boolean;
  isVerified: boolean;
  status: 'active' | 'pending' | 'removed';
}

export interface Review {
  id: string;
  groupId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
  helpfulVotes: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  groupCount: number;
}

export interface Tag {
  id: string;
  name: string;
  groupCount: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Mock data type for development
export interface MockData {
  users: User[];
  groups: Group[];
  reviews: Review[];
  categories: Category[];
  tags: Tag[];
}

// Add verification status type
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'needs_review' | 'flagged';

export interface VerificationLog {
  id: string;
  group_id: string;
  user_id: string;
  status: VerificationStatus;
  notes: string | null;
  created_at: string;
  user?: UserProfile; // Optional join with user profile
}

export interface VerificationStats {
  verification_status: VerificationStatus;
  count: number;
  last_verification_date: string | null;
}

export interface GroupWithVerification extends Group {
  verification_date: string | null;
  verified_by: string | null;
  verification_notes: string | null;
  verification_status: VerificationStatus;
  verification_logs?: VerificationLog[];
  category?: { id: string; name: string };
  submitted_by_user?: { id: string; display_name: string; avatar_url?: string | null };
  verified_by_user?: { id: string; display_name: string; avatar_url?: string | null };
  submitted_at: string;
}

// Add to existing interfaces
export interface GroupsApiResponse {
  // ... existing code ...
  verification_stats?: VerificationStats[];
}

// Find the existing UserProfile interface or add it if it doesn't exist
export interface UserProfile {
  id: string;
  email?: string;
  display_name: string;
  avatar_url?: string | null;
  role?: string;
  reputation?: number;
  created_at?: string;
  last_login?: string;
} 