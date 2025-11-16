import { createClient } from '../supabase/client';

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
    id: string;
    email: string;
    user_metadata: {
      first_name: string;
      last_name: string;
      full_name: string;
      school_name?: string;
    };
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

class AuthAPI {
  private supabase = createClient()

  async register(data: RegisterData): Promise<{ message: string; email: string }> {
    try {
      console.log('📤 Sending registration request to Supabase:', data);
      
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            full_name: `${data.first_name} ${data.last_name}`,
            school_name: data.school_name || '',
          },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) {
        console.error('❌ Registration error:', error);
        throw new Error(error.message);
      }

      console.log('✅ User registered successfully:', authData);

      return {
        message: 'Registration successful! Please check your email to verify your account.',
        email: data.email,
      };
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('📤 Sending login request to Supabase');
      
      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
        }
        
        throw new Error(error.message || 'Login failed');
      }

      if (!authData.user || !authData.session) {
        throw new Error('Login failed - no user data returned');
      }

      console.log('✅ Login successful:', authData.user);

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          user_metadata: authData.user.user_metadata as any,
        },
        session: authData.session,
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) throw new Error(error.message);

      return { message: 'Verification email sent! Please check your inbox.' };
    } catch (error: any) {
      console.error('❌ Resend verification error:', error);
      throw error;
    }
  }

  async getProfile() {
    const { data: { user }, error } = await this.supabase.auth.getUser();

    if (error || !user) {
      throw new Error('Not authenticated');
    }

    return {
      id: user.id,
      email: user.email!,
      first_name: user.user_metadata.first_name,
      last_name: user.user_metadata.last_name,
      full_name: user.user_metadata.full_name,
      school_name: user.user_metadata.school_name,
      profile_pic: user.user_metadata.profile_pic || '',
    };
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    if (error) {
      console.error('Get session error:', error);
      return null;
    }
    return session;
  }
}

export const authAPI = new AuthAPI();