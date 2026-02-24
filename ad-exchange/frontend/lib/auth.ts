export interface User {
  id: string;
  email: string;
  role: 'BLOGGER' | 'ISSUER' | 'ADMIN';
  displayName?: string;
  companyName?: string;
  companyType?: string;
  isVerified?: boolean;
  isPro?: boolean;
  subscriptionTier?: 'BASE' | 'PRO';
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
}

export function getRole(): User['role'] | null {
  const user = getUser();
  return user?.role ?? null;
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function setUser(user: User, token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('access_token', token);
}
