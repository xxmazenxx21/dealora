import { Request } from 'express';
export interface JwtPayload {
  sub: string;
  workspace_id: string;
  role: string;
}
export type AuthenticatedRequest = Request & { user: JwtPayload };
