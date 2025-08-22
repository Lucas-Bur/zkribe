import { audioBufferToMp3Blob, prepareAudio } from './audio-utils'

export const compressAudioToOptimizedMp3 = async (
  audioFile: File,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        const processedBuffer = await prepareAudio(audioBuffer, 1.15)
        const mp3Blob = audioBufferToMp3Blob(processedBuffer, 64)
        const extension = audioFile.name.split('.').pop()
        const newFileName = audioFile.name.replace(
          `.${extension}`,
          '_optimized.mp3',
        )
        const convertedFile = new File([mp3Blob], newFileName, {
          type: 'audio/mp3',
        })
        resolve(convertedFile)
      } catch (error) {
        console.error(
          '❌ Error compressing existing audio to optimized MP3:',
          error,
        )
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Error reading audio file'))
    reader.readAsArrayBuffer(audioFile)
  })
}
