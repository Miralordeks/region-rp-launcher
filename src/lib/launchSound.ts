/** Короткий UI-звук запуска без внешних файлов */
export function playLaunchSound(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.22, now + 0.02)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)
    master.connect(ctx.destination)

    const tones = [
      { freq: 392, start: 0, dur: 0.18 },
      { freq: 523.25, start: 0.08, dur: 0.22 },
      { freq: 659.25, start: 0.16, dur: 0.35 },
    ]

    for (const tone of tones) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(tone.freq, now + tone.start)
      gain.gain.setValueAtTime(0.0001, now + tone.start)
      gain.gain.exponentialRampToValueAtTime(0.9, now + tone.start + 0.02)
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + tone.start + tone.dur,
      )
      osc.connect(gain)
      gain.connect(master)
      osc.start(now + tone.start)
      osc.stop(now + tone.start + tone.dur + 0.02)
    }

    window.setTimeout(() => {
      void ctx.close()
    }, 800)
  } catch {
    // audio optional
  }
}
