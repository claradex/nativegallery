import type { CityRef, VehicleDetails, VehicleEvent } from './Vehicles';

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

export { legacyDate, shootingDate, siteDay } from './Date';

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
  processing: boolean;
  videoUrl: string | null;
  priority: number;
  contestEntry: boolean;
  contestPlaces: number[];
  exif: { label: string; value: string }[];
  /** Vehicles on the photo, left to right. */
  vehicles: PhotoVehicleData[];
  /** Navbar colour of the first vehicle's entity kind, or null for the site default. */
  navColor: string | null;
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
    /** Contest voting buttons: shown unless this is the viewer's own contest video. */
    contest: { id: number; current: number | null } | null;
  } | null;
}

export interface VehiclePageData {
  vehicle: VehicleDetails;
  /** Newest first; `takenAt` is the shooting date and `route` the route the vehicle ran on it. */
  photos: (TopPhoto & { comments: number; takenAt: number; route: string })[];
  /** Explicit events plus the ones derived from the vehicle's dates, in no particular order. */
  events: VehicleEvent[];
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

export const profileFields = ["aboutrid","aboutlive","aboutbirthday","aboutlangs","aboutmemo","abouttelegram","aboutvk","abouttwitter","aboutyoutube","aboutemail","aboutinstagram","abouttransphoto","aboutwebsite","aboutfavs_trains","aboutfavs_countries","aboutfavs_cities"] as const;

export interface ProfileSettingsData {
  id: number;
  username: string;
  photourl: string;
  fields: Record<typeof profileFields[number], string>;
}
export interface ProfileSession {
  id: number;
  /** Browser and its major version, such as "Chrome 131"; empty for sessions started before it was recorded. */
  device: string;
  os: string;
  ip: string;
  createdAt: number;
  lastActivity: number;
  current: boolean;
}
export interface PhotoVehicleData {
  id: number; title: string; heading: string; status: number; model: { id: number; title: string } | null;
  fields: { label: string; value: string }[];
  route: string; note: string; angle: number;
}
export interface UploadOptionsData {
  galleries: { id: number; title: string }[];
  entities: { id: number; title: string; color: string }[];
  cities: CityRef[];
  username: string;
  uploadIndex: number;
  directUpload: boolean;
}
export interface GalleryData {
  title: string;
  photos: {
    id: number;
    photourl: string;
    postbody: string;
    place: string;
    postedAt: number;
    uploadedAt: number;
    authorId: number;
    author: string;
    views: number;
  }[];
}
export interface CommentFeedEntry {
  id: number;
  photoId: number;
  photoUrl: string;
  authorId: number;
  author: string;
  admin: number;
  photoCount: number;
  body: string;
  postedAt: number;
  positive: number;
  negative: number;
}
export interface SitePageData {
  title: string;
  html: string;
}

export * from './Settings';

/** A kind of entity (Трамвай, Троллейбус …): the `t` of `/models?t=`. */
export interface EntityType {
  id: number;
  title: string;
}

export interface ModelListEntry {
  id: number;
  title: string;
  /** Production years, e.g. «2014–2023». */
  years: string;
  vehicles: number;
  active: number;
  /** Submodels (71-931М under 71-931) are listed under their parent. */
  children: ModelListEntry[];
}

/** `/models?t=`: the models of one entity type, grouped by manufacturer. */
export interface ModelListData {
  type: EntityType & { color: string; navColor: string | null };
  types: (EntityType & { models: number })[];
  groups: { title: string; models: ModelListEntry[] }[];
}

export * from './Vehicles';
