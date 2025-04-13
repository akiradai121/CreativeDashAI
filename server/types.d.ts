import 'express-session';
import { UserSession } from './routes';

declare module 'express-session' {
  interface SessionData {
    user?: UserSession;
  }
}