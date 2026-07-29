import * as Speech from 'expo-speech';

export interface TTSOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

export const ttsService = {
  speak: (text: string, options?: TTSOptions) => {
    // Android TTS often fails silently if invalid options are provided.
    // We sanitize them here.
    const speechOptions: any = {
      language: options?.language || 'en-US',
      pitch: options?.pitch || 1.0,
      rate: options?.rate || 1.0,
    };
    
    if (options?.voice) {
      speechOptions.voice = options.voice;
    }

    // Wrap in try-catch to catch immediate synchronous errors
    try {
      Speech.speak(text, speechOptions);
      
      // Manually trigger onDone after a short delay since Android sometimes swallows callbacks
      if (options?.onDone) {
        setTimeout(options.onDone, 2000);
      }
    } catch (error) {
      console.error("TTS Direct Error:", error);
      if (options?.onError) options.onError(error as Error);
    }
  },

  stop: async () => {
    await Speech.stop();
  },

  pause: async () => {
    await Speech.pause();
  },

  resume: async () => {
    await Speech.resume();
  },

  isSpeakingAsync: async () => {
    return await Speech.isSpeakingAsync();
  },

  getAvailableVoicesAsync: async () => {
    const voices = await Speech.getAvailableVoicesAsync();
    // Expo Speech native voices are typically offline.
    // We sort them to bring specific high quality or network-independent ones first if possible.
    return voices.sort((a, b) => {
      // Prioritize high quality
      if (a.quality === 'Enhanced' && b.quality !== 'Enhanced') return -1;
      if (b.quality === 'Enhanced' && a.quality !== 'Enhanced') return 1;
      return a.name.localeCompare(b.name);
    });
  }
};
