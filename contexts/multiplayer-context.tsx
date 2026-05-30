'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isFirebaseInitialized } from '@/lib/firebase-config';
import {
  FirebaseSession,
  FirebasePlayer,
  SharedPreferences,
  createSession,
  joinSession,
  leaveSession,
  updateSessionPreferences,
  setPlayerReady,
  getSessionData,
  onSessionChange,
  updateSessionAnalysis,
} from '@/lib/firebase-utils';

/**
 * Context for multiplayer session management
 */
interface MultiplayerContextType {
  // Session info
  sessionId: string | null;
  userId: string | null;
  username: string | null;
  session: FirebaseSession | null;
  
  // Status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Players
  players: FirebasePlayer[];
  currentPlayer: FirebasePlayer | null;
  
  // Preferences
  preferences: SharedPreferences;
  groupSize: number;
  
  // Actions
  createNewSession: (username: string, groupSize?: number) => Promise<{ sessionId: string; userId: string; success: true } | null>;
  joinExistingSession: (sessionId: string, username: string) => Promise<boolean>;
  leaveCurrentSession: () => Promise<void>;
  updatePreferences: (preferences: Partial<SharedPreferences>) => Promise<void>;
  setReady: (isReady: boolean) => Promise<void>;
  submitAnalysis: (results: any) => Promise<void>;
  setGroupSize: (size: number) => void;
  selectDestination: (countryName: string, index: number) => Promise<void>;
  clearDestination: () => Promise<void>;
  
  // Utilities
  isHost: boolean;
  allPlayersReady: boolean;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  // Session state — safe defaults for SSR; populated from sessionStorage after mount
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [session, setSession] = useState<FirebaseSession | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Restore session from sessionStorage after hydration
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('mp_sessionId');
    const storedUserId = sessionStorage.getItem('mp_userId');
    const storedUsername = sessionStorage.getItem('mp_username');
    if (storedSessionId && storedUserId) {
      setSessionId(storedSessionId);
      setUserId(storedUserId);
      setUsername(storedUsername);
      setIsConnected(true);
    }
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    !isFirebaseInitialized
      ? 'Firebase is not configured. Please set up Firebase environment variables to use multiplayer features.'
      : null
  );

  // Preferences
  const [preferences, setPreferences] = useState<SharedPreferences>({});
  const [groupSize, setGroupSize] = useState<number>(4); // Default to 4

  // Firebase subscription — useRef avoids a re-render each time the listener is (re)created
  const unsubscribeRef = React.useRef<(() => void) | null>(null);

  // Computed values
  const players = session ? Object.values(session.players || {}) : [];
  const currentPlayer = players.find((p) => p.userId === userId) || null;
  const isHost = session?.host.userId === userId;
  const allPlayersReady = players.length > 0 && players.every((p) => p.isReady);

  // Create new session
  const createNewSession = useCallback(async (newUsername: string, newGroupSize?: number) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[mp] createNewSession called — username:', newUsername, '| groupSize:', newGroupSize);

      if (!isFirebaseInitialized) {
        const errorMsg = 'Firebase is not configured. Please set up Firebase environment variables.';
        console.error('[mp] Firebase not initialized');
        setError(errorMsg);
        return null;
      }

      // createSession writes + verifies in Firestore before returning
      const { sessionId: newSessionId, userId: newUserId } = await createSession(newUsername, newGroupSize);

      console.log('[mp] Session confirmed in Firestore — sessionId:', newSessionId, '| userId:', newUserId);

      // Persist to sessionStorage so page reloads and navigation keep the session alive
      sessionStorage.setItem('mp_sessionId', newSessionId);
      sessionStorage.setItem('mp_userId', newUserId);
      sessionStorage.setItem('mp_username', newUsername);
      sessionStorage.setItem('sessionId', newSessionId);

      setSessionId(newSessionId);
      setUserId(newUserId);
      setUsername(newUsername);
      setIsConnected(true);

      if (newGroupSize && newGroupSize >= 2) {
        setGroupSize(newGroupSize);
      }

      // Fire-and-forget analytics
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newUserId, mode: 'squad' }),
      }).catch(() => {});

      // success: true is the gate the lobby uses before redirecting
      return { sessionId: newSessionId, userId: newUserId, success: true as const };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMsg);
      console.error('[mp] createNewSession error:', err);
      return null;
    } finally {
      // Always runs — spinner always stops
      setIsLoading(false);
    }
  }, []);

  // Join existing session
  const joinExistingSession = useCallback(async (joinSessionId: string, newUsername: string) => {
    try {
      setIsLoading(true);

      if (!isFirebaseInitialized) {
        const errorMsg = 'Firebase is not configured. Please set up Firebase environment variables.';
        setError(errorMsg);
        return false;
      }

      setError(null);

      // Verify session exists
      const sessionData = await getSessionData(joinSessionId);
      if (!sessionData) {
        throw new Error(
          `Session "${joinSessionId}" not found. The session may have expired or the ID may be incorrect.`
        );
      }

      const result = await joinSession(joinSessionId, newUsername);
      if (!result) {
        throw new Error('Failed to join session');
      }

      setSessionId(joinSessionId);
      setUserId(result.userId);
      setUsername(newUsername);
      setIsConnected(true);

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to join session';
      setError(errorMsg);
      console.error('[v0] Join session error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Leave session
  const leaveCurrentSession = useCallback(async () => {
    try {
      if (sessionId && userId) {
        await leaveSession(sessionId, userId);
      }

      unsubscribeRef.current?.();
      unsubscribeRef.current = null;

      // Clear persisted session data
      sessionStorage.removeItem('mp_sessionId');
      sessionStorage.removeItem('mp_userId');
      sessionStorage.removeItem('mp_username');
      sessionStorage.removeItem('sessionId');

      setSessionId(null);
      setUserId(null);
      setUsername(null);
      setSession(null);
      setPreferences({});
      setIsConnected(false);
      setError(null);
    } catch (err) {
      console.error('[mp] leaveCurrentSession error:', err);
    }
  }, [sessionId, userId]);

  // Update preferences
  const updatePreferences = useCallback(
    async (newPreferences: Partial<SharedPreferences>) => {
      try {
        if (!sessionId || !userId) {
          throw new Error('Not connected to session');
        }

        await updateSessionPreferences(sessionId, userId, newPreferences);
        setPreferences((prev) => ({ ...prev, ...newPreferences }));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update preferences';
        setError(errorMsg);
        console.error('[v0] Update preferences error:', err);
      }
    },
    [sessionId, userId],
  );

  // Set ready status
  const setReady = useCallback(
    async (isReady: boolean) => {
      try {
        if (!sessionId || !userId) {
          throw new Error('Not connected to session');
        }

        await setPlayerReady(sessionId, userId, isReady);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update ready status';
        setError(errorMsg);
        console.error('[v0] Set ready error:', err);
      }
    },
    [sessionId, userId],
  );

  // Submit analysis results
  const submitAnalysis = useCallback(
    async (results: any) => {
      try {
        if (!sessionId) {
          throw new Error('Not connected to session');
        }

        await updateSessionAnalysis(sessionId, results);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to submit analysis';
        setError(errorMsg);
        console.error('[v0] Submit analysis error:', err);
      }
    },
    [sessionId],
  );

  // Select destination for squad explore
  const selectDestination = useCallback(
    async (countryName: string, index: number) => {
      try {
        if (!sessionId || !userId) {
          throw new Error('Not connected to session');
        }

        await updateSessionPreferences(sessionId, userId, {
          selectedCountry: countryName,
          selectedDestinationIndex: index,
          exploreLoading: true,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to select destination';
        setError(errorMsg);
        console.error('[v0] Select destination error:', err);
      }
    },
    [sessionId, userId],
  );

  // Clear selected destination
  const clearDestination = useCallback(
    async () => {
      try {
        if (!sessionId || !userId) {
          throw new Error('Not connected to session');
        }

        await updateSessionPreferences(sessionId, userId, {
          selectedCountry: null,
          selectedDestinationIndex: null,
          exploreLoading: false,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to clear destination';
        setError(errorMsg);
        console.error('[v0] Clear destination error:', err);
      }
    },
    [sessionId, userId],
  );

  // Subscribe to session changes
  useEffect(() => {
    if (!sessionId) return;

    const unsub = onSessionChange(sessionId, (sessionData) => {
      if (sessionData) {
        setSession(sessionData);
        setPreferences(sessionData.preferences || {});
      } else {
        setSession(null);
      }
    });

    unsubscribeRef.current = unsub;

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [sessionId]);

  const value: MultiplayerContextType = {
    sessionId,
    userId,
    username,
    session,
    isConnected,
    isLoading,
    error,
    players,
    currentPlayer,
    preferences,
    groupSize,
    createNewSession,
    joinExistingSession,
    leaveCurrentSession,
    updatePreferences,
    setReady,
    submitAnalysis,
    setGroupSize,
    selectDestination,
    clearDestination,
    isHost,
    allPlayersReady,
  };

  return <MultiplayerContext.Provider value={value}>{children}</MultiplayerContext.Provider>;
}

/**
 * Hook to use multiplayer context
 */
export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within MultiplayerProvider');
  }
  return context;
}
