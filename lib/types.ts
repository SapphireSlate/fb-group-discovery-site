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