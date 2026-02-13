import { useState, useEffect } from 'react';
import { ensureAuth, getCurrentUserId } from '@/services/authService';

export const useAuth = () => {
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[useAuth] Initializing...');
        const id = await ensureAuth();
        
        if (id) {
          console.log('[useAuth] Auth ready, userId:', id);
          setUserId(id);
          setIsReady(true);
        } else {
          console.error('[useAuth] Auth failed');
          setError('Falha na autenticação');
          // Try one more time
          const retryId = await getCurrentUserId();
          if (retryId) {
            setUserId(retryId);
            setIsReady(true);
            setError(null);
          }
        }
      } catch (err) {
        console.error('[useAuth] Error:', err);
        setError('Erro ao inicializar autenticação');
      }
    };

    initAuth();
  }, []);

  return { isReady, userId, error };
};
