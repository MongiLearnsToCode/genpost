// Platform-related types
export type PlatformID = string;

export interface Platform {
  id: PlatformID;
  name: string;
  icon: string;
  color: string;
  maxCharCount?: number;
  recommendedHashtagCount?: number;
  imageLimit?: number;
  supportsMultiImage?: boolean;
}

// Content-related types
export interface BaseImage {
  id: string;
  file: File | null;
  previewUrl: string;
  name: string;
}

export interface PlatformSpecificPostContent {
  caption: string;
  selectedHashtags: Set<string>;
  selectedImageIds: string[];
}

export interface GeneratedContent {
  captions: string[];
  hashtags: string[];
}

// Analytics-related types
export interface PlatformAnalyticsData {
  platformId: PlatformID;
  engagementRate: number;
  reachCount: number;
  impressionsCount: number;
  interactionsCount: number;
  period: 'last7days' | 'last30days';
}

export interface QuickInsight {
  id: string;
  title: string;
  description: string;
  platformId: PlatformID | null; // null means it applies to all platforms
}
