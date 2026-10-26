/**
 * RELOOP Cross-Tab Synchronization Bus
 * 
 * Provides lightweight, non-authoritative invalidation signals between
 * browser tabs on the same origin using BroadcastChannel with a localStorage
 * event fallback.
 * 
 * Rules:
 * 1. Broadcasts ONLY invalidation metadata (entity type, optional id).
 * 2. Never carries authoritative business or private customer data.
 * 3. Receiving tabs must query the backend for fresh, authorized data.
 */

const CHANNEL_NAME = 'reloop_sync_channel';

class SyncBus {
  constructor() {
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;
    this.listeners = new Set();

    if (this.channel) {
      this.channel.onmessage = (event) => {
        this.emit(event.data);
      };
    }

    // Cross-tab fallback for environments where BroadcastChannel is constrained
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'reloop_sync_event' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.emit(data);
          } catch {
            // Ignore malformed payloads
          }
        }
      });
    }
  }

  emit(data) {
    if (!data || !data.entity) return;
    this.listeners.forEach((fn) => {
      try {
        fn(data);
      } catch (err) {
        console.error('[RELOOP Sync] Listener error:', err);
      }
    });
  }

  notify(entity, id = null) {
    const payload = {
      type: 'RELOOP_SYNC',
      entity, // 'products' | 'orders' | 'trade-in' | 'passport'
      id,
      timestamp: Date.now(),
    };

    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (err) {
        console.warn('[RELOOP Sync] BroadcastChannel postMessage error:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('reloop_sync_event', JSON.stringify(payload));
      } catch {
        // Quota or access error
      }
    }
  }

  subscribe(callback) {
    if (typeof callback !== 'function') return () => {};
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const syncBus = new SyncBus();

export const notifyDataChanged = (entity, id = null) => {
  syncBus.notify(entity, id);
};

export const subscribeToSync = (callback) => {
  return syncBus.subscribe(callback);
};
