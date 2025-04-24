'use client';

/**
 * Set a cookie in the browser
 * @param name The name of the cookie
 * @param value The value to store
 * @param days Number of days until the cookie expires
 */
export function setCookie(name: string, value: string, days: number): void {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Strict`;
}

/**
 * Get a cookie from the browser
 * @param name The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find(c => c.startsWith(name + '='));
  
  if (!cookie) return null;
  
  return decodeURIComponent(cookie.split('=')[1]);
}

/**
 * Delete a cookie from the browser
 * @param name The name of the cookie to delete
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Strict`;
}

/**
 * Check if a user is logged in from client components
 * @returns Boolean indicating if user is logged in
 */
export function isClientLoggedIn(): boolean {
  return getCookie('user') !== null;
}

/**
 * Get user from client components
 * @returns The user object or null if not logged in
 */
export function getClientUser(): any | null {
  const userCookie = getCookie('user');
  
  if (!userCookie) return null;
  
  try {
    return JSON.parse(userCookie);
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
}

/**
 * Logout the user by removing their cookie
 */
export function logoutUser(): void {
  deleteCookie('user');
} 