import { supabase } from './supabase';

// Sign up with email and password
export const signUp = async (email: string, password?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: password || 'dummy-password-for-otp-only', // if using passwordless, though password isn't strictly needed for signInWithOtp
  });
  return { data, error };
};

// Sign in with email and password
export const signIn = async (email: string, password?: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password || '',
  });
  return { data, error };
};

// Send OTP to email (passwordless login)
export const sendOTP = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    }
  });
  return { data, error };
};

// Verify OTP
export const verifyOTP = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  return { data, error };
};

// Password reset
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  });
  return { data, error };
};

// Update password
export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Google OAuth login
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  return { data, error };
};

// GitHub OAuth login
export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
  });
  return { data, error };
};
