export const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function api(path: string, options?: RequestInit) {
  // Don't add /api prefix for auth routes
  const isAuthRoute = path.startsWith('/auth');
  const url = isAuthRoute ? `${API}${path}` : `${API}${path.startsWith('/') ? path : '/' + path}`;
  
  console.log(`Fetching from: ${url}`);
  
  // For testing purposes, add a mock user ID if none is provided
  // In a real app, this would come from your authentication system
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // Add a test user ID for development - remove in production
    'user-id': '1', // This corresponds to the first user in the database
    ...(options?.headers || {})
  };
  
  try {
    // Add a timeout to avoid hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      credentials: 'include',
      signal: controller.signal,
      headers,
      mode: 'cors',
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
    
    // Provide more detailed error messages for common issues
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request to ${url} timed out after 10 seconds`);
      } else if (error.message.includes('NetworkError')) {
        throw new Error(`Network error when connecting to ${API}. Please check if the backend server is running.`);
      } else if (error.message.includes('CORS')) {
        throw new Error(`CORS error when connecting to ${API}. Please check backend CORS configuration.`);
      }
    }
    
    // Fallback error message
    throw new Error(`Failed to connect to ${API}. Please check your network connection and make sure the backend server is running.`);
  }
} 