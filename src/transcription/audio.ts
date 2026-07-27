const SAMPLE_RATE = 16_000

export async function optimizeAudio(file: File): Promise<File> {
  const context = new AudioContext()
  try {
    const decoded = await context.decodeAudioData(await file.arrayBuffer())
    const length = Math.ceil((decoded.duration * SAMPLE_RATE) / 1.1)
    const offline = new OfflineAudioContext(1, length, SAMPLE_RATE)
    const source = offline.createBufferSource()
    const highpass = offline.createBiquadFilter()
    const compressor = offline.createDynamicsCompressor()

    source.buffer = decoded
    source.playbackRate.value = 1.1
    highpass.type = 'highpass'
    highpass.frequency.value = 80
    compressor.threshold.value = -24
    compressor.ratio.value = 4
    source.connect(highpass).connect(compressor).connect(offline.destination)
    source.start()

    const rendered = await offline.startRendering()
    return new File([encodeWave(rendered)], `${file.name.replace(/\.[^.]+$/, '')}-optimized.wav`, {
      type: 'audio/wav',
    })
  } finally {
    await context.close()
  }
}

function encodeWave(audio: AudioBuffer): Blob {
  const samples = audio.getChannelData(0)
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeAscii(view, 8, 'WAVEfmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)

  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample))
    view.setInt16(44 + index * 2, clamped * (clamped < 0 ? 0x8000 : 0x7fff), true)
  })
  return new Blob([buffer], { type: 'audio/wav' })
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index++) {
    view.setUint8(offset + index, value.charCodeAt(index))
  }
}
