import { User, Session as NASession, Account as NAAccount } from 'next-auth';
import { JWT as NAJWT } from 'next-auth/jwt';

declare module 'next-auth/jwt' {
  interface JWT extends NAJWT {
    accessTokenExpires: number;
    refreshToken: string;
    accessToken: string;
    user: User;
    roles: string[];
  }
}

declare module 'next-auth' {
  interface Account extends NAAccount {
    ext_expires_in: number;
    refresh_token: string;
    access_token: string;

    id_token: string;
    provider: string;
    providerAccountId: string;
    scope: string;
    session_state: string;
    token_type: 'Bearer' | string;
    type: 'oauth' | string;
  }

  interface Session extends NASession {
    user: User;
    accessTokenExpires: number;
    roles: string[];
  }
}
