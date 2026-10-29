/**
 * Apple-inspired subtle Web Audio chime for Focus Timer session completion.
 * No external sound files or network dependencies required.
 */

export function playTimerCompletionChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Harmonic chord: A pleasant Apple/iOS-like triple chime (C5 -> G5 -> C6)
    const notes = [
      { freq: 523.25, time: now, duration: 0.35, gain: 0.15 },
      { freq: 659.25, time: now + 0.12, duration: 0.4, gain: 0.18 },
      { freq: 783.99, time: now + 0.24, duration: 0.5, gain: 0.22 },
      { freq: 1046.5, time: now + 0.38, duration: 0.75, gain: 0.25 },
    ];

    notes.forEach(({ freq, time, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);

      // Smooth attack and soft exponential release
      gainNode.gain.setValueAtTime(0.0001, time);
      gainNode.gain.exponentialRampToValueAtTime(gain, time + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    });
  } catch (e) {
    // Graceful fallback if audio is not permitted by browser policy
    console.debug("AudioContext chime not permitted or failed:", e);
  }
}
