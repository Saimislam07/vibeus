export interface UserSummary {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  district?: string | null;
  country?: string | null;
  skills?: string | null;
  experienceLevel?: string | null;
  role?: string;
  isVerified?: boolean;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  isSelf?: boolean;
  isConnected?: boolean;
  isPending?: boolean;
  _count?: {
    projects?: number;
    posts?: number;
  };
}

export interface PostItem {
  id: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  postType: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
  hasBookmarked: boolean;
  user: UserSummary & {
    role: string;
    isVerified: boolean;
  };
  project?: {
    id: string;
    title: string;
    summary: string;
    category: string;
    techStack: string;
    thumbnailUrl?: string | null;
    liveDemoUrl?: string | null;
    repoUrl?: string | null;
    status: string;
  } | null;
}

export interface ProjectItem {
  id: string;
  title: string;
  summary: string;
  description?: string;
  category: string;
  techStack: string;
  thumbnailUrl?: string | null;
  screenshots?: string[];
  demoVideoUrl?: string | null;
  isVerticalVideo?: boolean;
  liveDemoUrl?: string | null;
  repoUrl?: string | null;
  status: string;
  viewsCount: number;
  createdAt?: string;
  updatedAt?: string;
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
  hasBookmarked: boolean;
  user: UserSummary & {
    role: string;
    isVerified: boolean;
  };
}

export interface DeveloperItem extends UserSummary {
  coverUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  _count?: {
    projects: number;
    posts: number;
  };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  user: UserSummary & { role?: string };
}

export interface ConnectionRequestItem {
  id: string;
  createdAt: string;
  user: UserSummary;
}

export interface ConnectedDeveloperItem extends UserSummary {
  connectionId: string;
  connectedAt: string;
}

export interface ConversationItem {
  user: UserSummary & { isVerified: boolean };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    isSender: boolean;
    isRead: boolean;
  };
  unreadCount: number;
}

export interface DirectMessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface AdminUserItem extends UserSummary {
  email: string;
  role: string;
  isVerified: boolean;
  isSuspended: boolean;
  isBanned: boolean;
  suspensionReason: string | null;
  createdAt: string;
  _count: {
    projects: number;
    posts: number;
    reports: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  totalProjects: number;
  totalPosts: number;
  totalVideos: number;
  totalComments: number;
  pendingReports: number;
}

export interface AdminReportItem {
  id: string;
  targetType: string;
  targetId: string;
  targetSummary: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter?: UserSummary;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
}

export interface TechTagItem {
  id: string;
  name: string;
  category?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  target: string;
  details?: string | null;
  createdAt: string;
  admin?: UserSummary;
}

export interface DeveloperProfile extends UserSummary {
  createdAt: string;
  connectionsCount: number;
  connectionId?: string | null;
  connectionStatus: string;
}
