export const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function api(path: string, options?: RequestInit) {
  // Don't add /api prefix for auth routes
  const isAuthRoute = path.startsWith('/auth');
  const url = isAuthRoute ? `${API}${path}` : `${API}${path.startsWith('/') ? path : '/' + path}`;
  
  try {
    console.log(`Fetching from: ${url}`);
    const response = await fetch(url, {
      credentials: 'include',
      ...options
    });
    
    return response;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
} 