'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface SmartSyncOptions {
  /**
   * Interval waktu sinkronisasi saat tab sedang aktif/dilihat (default: 10000 ms / 10 detik).
   */
  activeIntervalMs?: number;

  /**
   * Interval waktu sinkronisasi saat tab sedang di latar belakang/minimize (default: 60000 ms / 60 detik).
   */
  idleIntervalMs?: number;

  /**
   * Apakah sinkronisasi otomatis aktif (default: true).
   */
  enabled?: boolean;

  /**
   * Jalankan sinkronisasi seketika saat window mendapat fokus atau tab kembali aktif (default: true).
   */
  enableOnFocus?: boolean;

  /**
   * Jalankan sinkronisasi seketika saat koneksi internet kembali online (default: true).
   */
  enableOnOnline?: boolean;

  /**
   * Jeda polling jika kondisi ini bernilai true (misal saat modal terbuka atau user sedang menggambar TTD).
   */
  isPaused?: boolean | (() => boolean);
}

/**
 * Smart & Realtime Sync Hook (Anti-Cache, Zero-Leak, Adaptive Interval).
 * Mengatur interval polling yang adaptif antara foreground dan background,
 * mencegah penumpukan memori RAM, dan mengeksekusi instant-refresh saat tab kembali aktif.
 */
export function useSmartSync(
  syncCallback: () => Promise<void> | void,
  options: SmartSyncOptions = {}
) {
  const {
    activeIntervalMs = 10000,
    idleIntervalMs = 60000,
    enabled = true,
    enableOnFocus = true,
    enableOnOnline = true,
    isPaused = false,
  } = options;

  const callbackRef = useRef(syncCallback);
  callbackRef.current = syncCallback;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const [isTabActive, setIsTabActive] = useState<boolean>(true);
  const isExecutingRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const shouldPause = useCallback((): boolean => {
    if (typeof isPausedRef.current === 'function') {
      return isPausedRef.current();
    }
    return Boolean(isPausedRef.current);
  }, []);

  const executeSync = useCallback(async () => {
    if (!enabled || shouldPause() || isExecutingRef.current) {
      return;
    }
    if (typeof document !== 'undefined' && !navigator.onLine) {
      return;
    }

    try {
      isExecutingRef.current = true;
      await callbackRef.current();
    } catch (err) {
      // Kesalahan jaringan dihandle secara senyap agar tidak mengganggu UI user
      console.debug('[SmartSync] Polling cycle error:', err);
    } finally {
      isExecutingRef.current = false;
    }
  }, [enabled, shouldPause]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const clearActiveTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const startTimer = (intervalMs: number) => {
      clearActiveTimer();
      timerRef.current = setInterval(() => {
        executeSync();
      }, intervalMs);
    };

    const handleVisibilityChange = () => {
      const isVisible = typeof document !== 'undefined' && document.visibilityState === 'visible';
      setIsTabActive(isVisible);

      if (isVisible) {
        // Tab baru saja aktif kembali -> jalankan 1x instant-refresh & beralih ke interval cepat
        executeSync();
        startTimer(activeIntervalMs);
      } else {
        // Tab diminimize/ditinggalkan -> perlambat interval untuk menghemat RAM & CPU
        startTimer(idleIntervalMs);
      }
    };

    const handleWindowFocus = () => {
      if (enableOnFocus) {
        executeSync();
      }
    };

    const handleOnline = () => {
      if (enableOnOnline) {
        executeSync();
      }
    };

    // Inisialisasi awal
    const initialVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
    setIsTabActive(initialVisible);
    startTimer(initialVisible ? activeIntervalMs : idleIntervalMs);

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      if (enableOnFocus) {
        window.addEventListener('focus', handleWindowFocus);
      }
      if (enableOnOnline) {
        window.addEventListener('online', handleOnline);
      }
    }

    // Pembersihan resource memori (*Garbage Collection*) saat unmount
    return () => {
      clearActiveTimer();
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleWindowFocus);
        window.removeEventListener('online', handleOnline);
      }
    };
  }, [enabled, activeIntervalMs, idleIntervalMs, enableOnFocus, enableOnOnline, executeSync]);

  return {
    triggerSync: executeSync,
    isTabActive,
  };
}
