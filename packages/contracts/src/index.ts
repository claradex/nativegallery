export interface LoginRequest {
  username: string;
  password: string;
}

export type LoginResponse =
  | { errorcode: '0'; error: 0; token: string }
  | { errorcode: '1'; error: 1 };

export interface Viewer {
  id: number;
  username: string;
  admin: number;
  status: number;
  unreadPhotos: number;
  pendingPhotos: number;
}

export const jobKinds = ['ExecContests', 'BlurNewImage', 'CompressImage', 'RenderVideo'] as const;
export type JobKind = typeof jobKinds[number];

export interface MediaJob {
  input: string;
  output: string;
}

export { legacyDate } from './Date';

export interface SiteOverview {
  users: number;
  photos: number;
  online: number;
  staff: { id: number; username: string; photourl: string; admin: number }[];
}

export interface TopPhoto {
  id: number;
  photourl: string;
  place: string;
  postbody: string;
  timeupload: number;
  authorId: number;
  author: string;
  views: number;
}

export interface PhotoDetailsData {
  id: number;
  url: string;
  author: string;
  publishedAt: number;
  views: number;
  comments: number;
}

export interface PhotoCommentData {
  id: number;
  authorId: number;
  author: { id: number; username: string; photourl: string; admin: number } | null;
  publishedPhotos: number;
  body: string;
  postedAt: number;
  edited: boolean;
  attachmentType: 'img' | 'video' | null;
  attachmentUrl: string | null;
  pinned: boolean;
  positive: number;
  negative: number;
  ownVote: number | null;
  canEdit: boolean;
  canPin: boolean;
}

export interface PhotoPageData {
  id: number;
  authorId: number;
  author: string;
  url: string;
  place: string;
  description: string;
  takenAt: number;
  publishedAt: number;
  published: boolean;
  videoUrl: string | null;
  priority: number;
  contestEntry: boolean;
  contestPlaces: number[];
  exif: { label: string; value: string }[];
  vehicle: { id: number; title: string; fields: { label: string; value: string }[] } | null;
  vehicleRoute: string;
  previousId: number | null;
  nextId: number | null;
  views: number;
  favorite: boolean;
  signedIn: boolean;
  commentsEnabled: boolean;
  canComment: boolean;
  rating: {
    total: number;
    current: number | null;
    votes: { id: number; authorId: number; author: string; type: number }[];
  } | null;
}

export interface VehiclePageData {
  vehicle: NonNullable<PhotoPageData["vehicle"]>;
  photos: (TopPhoto & { comments: number })[];
}

export interface ContestWinnerData {
  id: number;
  contestId: number;
  date: number;
  place: number;
  photoId: number;
  photoUrl: string;
  theme: string;
}

export interface PhotoSearchResult {
  authorId: number;
  total: number;
  page: number;
  pages: number;
  photos: { id: number; photourl: string; place: string; postbody: string; timeupload: number; author: string; views: number; comments: number }[];
}
export interface UploadHistoryPhoto {
  id: number;
  photourl: string;
  place: string;
  posted_at: number;
  endmoderation: number;
  moderated: number;
  declineReason: number;
  declineComment: string | null;
  rating: string;
}

export interface UploadHistoryData {
  author: { id: number; username: string };
  photos: UploadHistoryPhoto[];
}
