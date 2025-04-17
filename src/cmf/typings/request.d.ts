import { MediaFiles } from './context';

export interface Request {
  files?: MediaFiles;
}

export interface LoginLogRequest {
  ids: string[];
}
