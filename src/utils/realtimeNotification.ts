/**
 * Real-time System Notification & Sound Service for SahYog
 * Plays instant audio chime using Web Audio API (zero external network dependency)
 * Dispatches OS/Browser system notifications even when browser is in background/minimized.
 */

// Synthesize pleasant, attention-grabbing dual-chime using Web Audio API
export function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.32);

    // Second tone: B5 (987.77 Hz) - slightly delayed for a bright Ding-Dong feel
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0.01, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.4, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.58);
  } catch (err) {
    console.warn('Audio chime notice:', err);
  }
}

export interface SystemNotificationOptions {
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
}

// Trigger real OS / Browser notification with sound & vibration
export function triggerSystemNotification(title: string, options: SystemNotificationOptions) {
  if (typeof window === 'undefined') return;

  // 1. Play sound chime immediately
  playNotificationChime();

  // 2. Vibrate mobile phone if supported
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  } catch {}

  // 3. Save to local notifications history
  try {
    const raw = localStorage.getItem('sahyog_notifications') || '[]';
    const list = JSON.parse(raw);
    list.unshift({
      id: 'notif_' + Date.now(),
      title,
      message: options.body,
      type: 'booking',
      time: 'Just now',
      read: false,
      timestamp: Date.now()
    });
    localStorage.setItem('sahyog_notifications', JSON.stringify(list.slice(0, 30)));
  } catch {}

  // 4. Dispatch native OS system notification
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: options.body,
          icon: options.icon || '/logo.png',
          badge: '/icons/icon-192.png',
          tag: options.tag || 'sahyog-alert-' + Date.now(),
          requireInteraction: true
        });

        notif.onclick = function () {
          window.focus();
          if (options.url) {
            window.location.href = options.url;
          }
          notif.close();
        };
      } catch (e) {
        console.warn('Notification spawn notice:', e);
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          try {
            const notif = new Notification(title, {
              body: options.body,
              icon: options.icon || '/logo.png',
              tag: options.tag || 'sahyog-alert-' + Date.now()
            });
            notif.onclick = function () {
              window.focus();
              if (options.url) window.location.href = options.url;
              notif.close();
            };
          } catch {}
        }
      });
    }
  }
}

// Request notification permission gracefully
export function requestNotificationPermission() {
  if (typeof window === 'undefined') return;
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      Notification.requestPermission();
    } catch {}
  }
}
