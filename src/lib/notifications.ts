import React from "react";
import { toast } from "sonner";
import { ResponseCompletedToast } from "../components/ResponseCompletedToast";
import { UserSettings } from "./schemas";

export interface NotificationOptions {
  visual?: boolean;
  sound?: boolean;
  message?: string;
  settings?: UserSettings | null;
}

/**
 * Show notification when chat response is completed
 */
export function showResponseCompleted(options: NotificationOptions = {}) {
  const {
    visual = true,
    sound = true,
    message = "Response completed",
    settings,
  } = options;

  // Check if notifications are enabled in settings (default: true)
  const notificationsEnabled =
    settings?.enableResponseCompletedNotifications ?? true;

  if (!notificationsEnabled) {
    return;
  }

  // Visual notification (custom toast)
  if (visual) {
    toast.custom(
      (t) =>
        React.createElement(ResponseCompletedToast, { message, toastId: t }),
      {
        duration: 4000,
      },
    );
  }

  // Audio notification
  if (sound) {
    playNotificationSound();
  }
}

/**
 * Play a sophisticated completion notification sound
 * Creates a harmonious sequence that feels like "task accomplished"
 */
function playNotificationSound() {
  try {
    // Using Web Audio API for a sophisticated notification sequence
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.debug("Web Audio API not available");
      return;
    }

    const audioContext = new AudioContextClass();

    // Create a pleasant chord progression: C4 -> E4 -> G4 (C major chord)
    const frequencies = [261.63, 329.63, 392.0]; // C4, E4, G4
    const duration = 0.6;
    const fadeInTime = 0.05;
    const sustainTime = 0.2;

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Use a warmer sine wave
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

      // Stagger the notes slightly for a more musical effect
      const startTime = audioContext.currentTime + index * 0.08;

      // Gentle volume curve for each note
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.03, startTime + fadeInTime);
      gainNode.gain.setValueAtTime(0.03, startTime + sustainTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });

    // Clean up
    setTimeout(() => {
      audioContext.close();
    }, 1000);
  } catch (error) {
    // Silently fail if audio is not available
    console.debug("Audio notification failed:", error);
  }
}

/**
 * Alternative: Use system notification sound (simpler, more reliable)
 */
export function playSystemNotification() {
  try {
    // Create a very short, high-pitched beep
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjmO0+LIeCEEJHjM8N1xIggSeN7aqXMEA1t09Sy0",
    );
    audio.volume = 0.1;
    audio.play().catch(() => {
      // Ignore errors - notification is optional
    });
  } catch (error) {
    console.debug("System notification failed:", error);
  }
}
