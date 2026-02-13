import { supabase } from '@/services/supabaseClient';

const USER_ID_KEY = 'focus_user_id';
const USER_EMAIL_KEY = 'focus_user_email';

let cachedUserId: string | null = null;
let authPromise: Promise<string | null> | null = null;

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getStoredCredentials = () => {
  try {
    const userId = localStorage.getItem(USER_ID_KEY);
    const email = localStorage.getItem(USER_EMAIL_KEY);
    return { userId, email };
  } catch {
    return { userId: null, email: null };
  }
};

const storeCredentials = (userId: string, email: string) => {
  try {
    localStorage.setItem(USER_ID_KEY, userId);
    localStorage.setItem(USER_EMAIL_KEY, email);
  } catch (e) {
    console.warn('Could not store credentials:', e);
  }
};

const signInWithStoredCredentials = async (email: string): Promise<string | null> => {
  const uniqueId = email.replace('user_', '').replace('@focus.app', '');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: uniqueId,
  });

  if (error) {
    console.log('Stored credentials login failed:', error.message);
    return null;
  }

  if (data.user) {
    cachedUserId = data.user.id;
    return data.user.id;
  }

  return null;
};

const createNewUser = async (): Promise<string | null> => {
  const uniqueId = generateId();
  const email = `user_${uniqueId}@focus.app`;
  const password = uniqueId;

  // Try to sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        app: 'focus',
        created_at: new Date().toISOString(),
      },
    },
  });

  if (signUpError) {
    console.log('Sign up error:', signUpError.message);

    // If user exists, try to sign in
    if (signUpError.message?.includes('already registered') || signUpError.status === 422) {
      const userId = await signInWithStoredCredentials(email);
      if (userId) return userId;
    }

    return null;
  }

  if (signUpData.user) {
    storeCredentials(signUpData.user.id, email);
    cachedUserId = signUpData.user.id;

    // Wait a moment for session to be established
    await new Promise(resolve => setTimeout(resolve, 500));

    return signUpData.user.id;
  }

  return null;
};

const ensureAuthInternal = async (): Promise<string | null> => {
  console.log('[Auth] Starting auth process...');

  // Check if already have cached user
  if (cachedUserId) {
    console.log('[Auth] Using cached user:', cachedUserId);
    return cachedUserId;
  }

  // Check for existing session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    console.log('[Auth] Found existing session:', session.user.id);
    cachedUserId = session.user.id;
    storeCredentials(session.user.id, session.user.email || '');
    return cachedUserId;
  }

  // Try stored credentials
  const { email } = getStoredCredentials();

  if (email && !email.includes('undefined') && !email.includes('null')) {
    console.log('[Auth] Trying stored credentials:', email);
    const userIdFromStored = await signInWithStoredCredentials(email);
    if (userIdFromStored) {
      console.log('[Auth] Successfully logged in with stored credentials');
      return userIdFromStored;
    }
  }

  // Create new user
  console.log('[Auth] Creating new user...');
  const newUserId = await createNewUser();

  if (newUserId) {
    console.log('[Auth] New user created:', newUserId);
    return newUserId;
  }

  console.error('[Auth] Failed to authenticate');
  return null;
};

export const ensureAuth = async (): Promise<string | null> => {
  // If there's already an auth promise in flight, return it
  if (authPromise) {
    return authPromise;
  }

  // Create new auth promise
  authPromise = ensureAuthInternal().finally(() => {
    authPromise = null;
  });

  return authPromise;
};

export const getCurrentUserId = async (): Promise<string | null> => {
  if (cachedUserId) {
    return cachedUserId;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    cachedUserId = user.id;
    return user.id;
  }

  return await ensureAuth();
};

export const isAuthenticated = async (): Promise<boolean> => {
  const userId = await getCurrentUserId();
  return userId !== null;
};

export const clearAuth = () => {
  cachedUserId = null;
  authPromise = null;
  try {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
  } catch { /* localStorage cleanup is best-effort */ }
};

// Initialize auth on module load (but don't wait for it)
ensureAuth().then(userId => {
  if (userId) {
    console.log('[Auth] Auto-initialized with user:', userId);
  } else {
    console.warn('[Auth] Auto-initialization failed');
  }
});
