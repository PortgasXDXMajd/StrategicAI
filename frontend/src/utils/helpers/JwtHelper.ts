import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  email: string;
  first_login: boolean;
  exp: number;
}

export const JwtHelper = {
  decodeToken(token: string): DecodedToken {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      sub: decoded.sub,
      email: decoded.email,
      first_login: decoded.first_login,
      exp: decoded.exp * 1000,
    };
  },

  isTokenExpired(token: string): boolean {
    const { exp } = jwtDecode<DecodedToken>(token);
    const now = Date.now() / 1000;
    return exp < now;
  },
};
