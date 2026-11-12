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
