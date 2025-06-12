
export enum PlatformID {
  Instagram = "instagram",
  X = "x",
  LinkedIn = "linkedin",
}

export interface BaseImage {
  id: string; // Unique ID for the image
  file: File; // The actual file object
  previewUrl: string; // For local thumbnail previews (using URL.createObjectURL)
  name: string; // File name
}

export interface Platform {
  id: PlatformID;
  name: string;
  icon: React.ReactNode; // SVG icon
  color: string; // Tailwind color class
  characterLimit?: number;
  imageLimit?: number; // Max number of images allowed
  supportsMultiImage?: boolean; // If the platform allows more than one image
}

// Represents content specific to a platform
export interface PlatformSpecificPostContent {
  caption: string;
  selectedHashtags: Set<string>; // Storing as Set for easier manipulation
  selectedImageIds: string[]; // Array of BaseImage IDs
}

// Represents a grounding chunk from Google Search if used
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export enum PostStatus {
  Draft = "draft",
  Scheduled = "scheduled",
  Published = "published", // Future use
  Error = "error", // If publishing failed
}

// Unified Post Object for management
export interface ManagedPost {
  id: string; // Unique ID for the post
  status: PostStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  scheduledDate: string | null; // ISO string (date part only for scheduling)
  scheduledTime: string | null; // e.g., "10:00 AM"
  platforms: PlatformID[]; // Platforms this post is intended for
  content: Partial<Record<PlatformID, PlatformSpecificPostContent>>; // Content for each selected platform
  topic?: string; // Optional original topic/brief
  errorMessage?: string; // If status is Error
}


// For VisualCalendar - now derived from ManagedPost
export interface ScheduledPostDisplayItem { 
  id: string; // Unique combined ID for calendar item e.g. post.id + platform.id
  originalPostId: string; // ID of the original ManagedPost
  date: string; // e.g., "YYYY-MM-DD"
  time?: string; // e.g., "10:00 AM"
  platformId: PlatformID; 
  primaryPlatformId: PlatformID; // The platform this calendar entry represents
  captionSnippet: string;
  imageCount: number;
  status: PostStatus;
  originalPost: ManagedPost; // Reference to the full post
}


// For BasicAnalytics (remains mostly the same for now)
export interface PlatformMetric {
  label: string;
  value: string | number;
  change?: string; // e.g., "+5%"
}

export interface PlatformAnalyticsData {
  platformId: PlatformID;
  metrics: PlatformMetric[];
}

export interface QuickInsight {
  id: string;
  text: string;
}