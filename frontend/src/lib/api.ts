export const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://omtransport-dash.onrender.com';

export async function api(path: string, options?: RequestInit) {
  // Don't add /api prefix for auth routes
  const isAuthRoute = path.startsWith('/auth');
  const url = isAuthRoute ? `${API}${path}` : `${API}${path.startsWith('/') ? path : '/' + path}`;
  
  console.log(`Fetching from: ${url}`);
  
  try {
    // Add a timeout to avoid hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      credentials: 'include',
      signal: controller.signal,
      ...options
    });
    
    clearTimeout(timeoutId);
    
    // If this is an OTP request, log the response for debugging
    if (path === '/auth/request-otp') {
      try {
        // We need to clone the response before reading it
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        console.log('OTP Response:', data);
        console.log('Environment:', process.env.NODE_ENV);
        
        if (data.otp) {
          console.log('----------------------------------------');
          console.log('🔑 OTP CODE:', data.otp);
          console.log('----------------------------------------');
        } else {
          console.log('⚠️ No OTP in response. Please check backend environment settings.');
        }
      } catch (error) {
        console.error('Error reading OTP response:', error);
      }
    }
    
    return response;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    // Check if it's an AbortError (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after 10 seconds`);
    }
    throw error;
  }
} 