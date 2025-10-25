import { env } from '@/lib/env';

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  school_name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    school_name?: string;
    profile_pic: string;
  };
  access: string;
  refresh: string;
}

interface ProfileResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  school_name?: string;
  profile_pic: string;
}

class AuthAPI {
  private baseURL = `${env.backendUrl}/api/auth`;

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📤 Sending registration request:', data);
      
      const response = await fetch(`${this.baseURL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📥 Response status:', response.status);

      // Try to parse response as JSON
      const text = await response.text();
      console.log('📄 Response body:', text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        // If not JSON, it's likely an HTML error page
        console.error('❌ Failed to parse JSON. Response was:', text.substring(0, 500));
        throw new Error('Server returned an error. Please check the backend logs.');
      }

      if (!response.ok) {
        throw new Error(result.detail || result.error || 'Registration failed');
      }
      
      // Backend returns { user: {...}, tokens: { access, refresh } }
      const authResponse: AuthResponse = {
        user: result.user,
        access: result.tokens.access,
        refresh: result.tokens.refresh,
      };
      
      // Store tokens
      localStorage.setItem('access_token', authResponse.access);
      localStorage.setItem('refresh_token', authResponse.refresh);
      
      return authResponse;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('📤 Sending login request');
      
      const response = await fetch(`${this.baseURL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const text = await response.text();
      console.log('📥 Login response:', text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error('❌ Failed to parse JSON:', text.substring(0, 500));
        throw new Error('Server returned an error. Please check the backend logs.');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }
      
      // Backend returns { user: {...}, access: "...", refresh: "..." }
      const authResponse: AuthResponse = {
        user: result.user,
        access: result.access,
        refresh: result.refresh,
      };
      
      // Store tokens
      localStorage.setItem('access_token', authResponse.access);
      localStorage.setItem('refresh_token', authResponse.refresh);
      
      return authResponse;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async getProfile(): Promise<ProfileResponse> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(`${this.baseURL}/profile/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry with new token
          return this.getProfile();
        }
      }
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return true;
    } catch {
      return false;
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

export const authAPI = new AuthAPI();