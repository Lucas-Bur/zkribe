import * as lamejs from "@breezystack/lamejs"

export const audioBufferToMp3Blob = (audioBuffer: AudioBuffer, bitrate = 64): Blob => {
  try {
    const samples = audioBuffer.getChannelData(0)

    const int16Samples = new Int16Array(samples.length)
    const scalingFactor = 0x7fff

    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i]
      if (sample === undefined) {
        console.error("❌ Sample at index", i, "is undefined")
        throw new Error("Sample at index " + i + " is undefined")
      }
      int16Samples[i] = Math.max(-1, Math.min(1, sample)) * scalingFactor
    }

    let encoder
    try {
      encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, bitrate)
    } catch (encoderError) {
      console.error("❌ Failed to create Mp3Encoder:", encoderError)
      throw encoderError
    }

    const mp3Data: Uint8Array[] = []
    const MAX_CHUNK_SIZE = 1152

    let processedChunks = 0
    for (let i = 0; i < int16Samples.length; i += MAX_CHUNK_SIZE) {
      const chunk = int16Samples.subarray(i, i + MAX_CHUNK_SIZE)

      try {
        const mp3buf = encoder.encodeBuffer(chunk)
        if (mp3buf.length > 0) {
          mp3Data.push(new Uint8Array(mp3buf))
        }
        processedChunks++
      } catch (chunkError) {
        console.error(`❌ Error encoding chunk ${processedChunks + 1}:`, chunkError)
        throw chunkError
      }
    }

    try {
      const mp3buf = encoder.flush()
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf))
      }
    } catch (flushError) {
      console.error("❌ Error during flush:", flushError)
      throw flushError
    }

    const blob = new Blob(mp3Data as BlobPart[], { type: "audio/mp3" }) // as BlobPart[] is necessary for TypeScript compatibility. it works correctly at runtime

    return blob
  } catch (error) {
    console.error("❌ Critical error in audioBufferToMp3Blob:", error)
    throw error
  }
}

export const prepareAudio = async (audioBuffer: AudioBuffer, playbackRate = 1.0): Promise<AudioBuffer> => {

  const targetSampleRate = 16000
  const targetChannels = 1

  if (
    audioBuffer.sampleRate === targetSampleRate &&
    audioBuffer.numberOfChannels === targetChannels &&
    playbackRate === 1.0
  ) {
    return audioBuffer
  }

  try {
    const newLength = Math.ceil((audioBuffer.length * targetSampleRate) / audioBuffer.sampleRate / playbackRate)

    const offlineContext = new OfflineAudioContext(targetChannels, newLength, targetSampleRate)

    const source = offlineContext.createBufferSource()
    source.buffer = audioBuffer
    source.playbackRate.setValueAtTime(playbackRate, offlineContext.currentTime)

    const highPassFilter = offlineContext.createBiquadFilter()
    highPassFilter.type = "highpass"
    highPassFilter.frequency.setValueAtTime(80, offlineContext.currentTime)
    highPassFilter.Q.setValueAtTime(0.707, offlineContext.currentTime)

    const compressor = offlineContext.createDynamicsCompressor()
    compressor.threshold.setValueAtTime(-24, offlineContext.currentTime)
    compressor.ratio.setValueAtTime(4, offlineContext.currentTime)
    compressor.attack.setValueAtTime(0.003, offlineContext.currentTime)
    compressor.release.setValueAtTime(0.25, offlineContext.currentTime)
    compressor.knee.setValueAtTime(30, offlineContext.currentTime)

    source.connect(highPassFilter)
    highPassFilter.connect(compressor)
    compressor.connect(offlineContext.destination)

    source.start(0)
    const renderedBuffer = await offlineContext.startRendering()

    return renderedBuffer
  } catch (error) {
    console.error("❌ Error in prepareAudio:", error)
    throw error
  }
}
