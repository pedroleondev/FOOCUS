import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Since RLS is disabled, we just need a minimal delay to ensure Supabase client is ready
    const init = async () => {
      try {
        // Just check if Supabase is reachable
        const { error } = await supabase.from('habits').select('count', { count: 'exact', head: true });
        
        if (error && error.code !== 'PGRST116') {
          console.warn('Supabase connection warning:', error.message);
        }
        
        console.log('[AuthProvider] App ready - RLS disabled mode');
        setIsReady(true);
      } catch (err) {
        console.error('[AuthProvider] Error:', err);
        // Even if there's an error, proceed since RLS is disabled
        setIsReady(true);
      }
    };

    init();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
