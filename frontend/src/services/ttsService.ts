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
    console.log("🗣️ TTS Service called with text:", text);
    try {
      const speechOptions: any = {};
      
      if (options?.language) speechOptions.language = options.language;
      if (options?.onDone) speechOptions.onDone = options.onDone;
      if (options?.onStopped) speechOptions.onStopped = options.onStopped;
      if (options?.onError) speechOptions.onError = options.onError;

      Speech.speak(text, speechOptions);
      
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
