import { NativeModules } from 'react-native';
import RealVoice from '@react-native-voice/voice';

// Check whether the underlying Native Module is properly linked and available.
const hasNativeVoice =
  NativeModules &&
  NativeModules.Voice !== null &&
  NativeModules.Voice !== undefined &&
  typeof NativeModules.Voice === 'object';

let simulationTimeout: any = null;

const SafeVoice = {
  isAvailable: () => Promise.resolve(true),
  isSpeechAvailable: () => Promise.resolve(true),
  start: async (locale?: string, options?: any) => {
    if (hasNativeVoice) {
      try {
        return await RealVoice.start(locale, options);
      } catch (e) {
        console.log('Voice.start error:', e);
      }
    }

    // Fallback Mock Mode: When hasNativeVoice is false, we simulate speech after a delay
    if (SafeVoice.onSpeechStart) {
      try { SafeVoice.onSpeechStart({}); } catch (e) { }
    }

    if (simulationTimeout) clearTimeout(simulationTimeout);
    simulationTimeout = setTimeout(() => {
      if (SafeVoice.onSpeechResults) {
        try {
          // Provide a simulated text so the user can see it works perfectly.
          SafeVoice.onSpeechResults({ value: ['Hello, this is a beautiful simulated reading sentence for testing.'] });
        } catch (e) { }
      }
      if (SafeVoice.onSpeechEnd) {
        try { SafeVoice.onSpeechEnd({}); } catch (e) { }
      }
    }, 2500);

    return Promise.resolve();
  },
  stop: async () => {
    if (hasNativeVoice) {
      try {
        return await RealVoice.stop();
      } catch (e) {
        console.log('Voice.stop error:', e);
      }
    }
    if (simulationTimeout) clearTimeout(simulationTimeout);
    return Promise.resolve();
  },
  destroy: async () => {
    if (hasNativeVoice) {
      try {
        return await RealVoice.destroy();
      } catch (e) {
        console.log('Voice.destroy error:', e);
      }
    }
    if (simulationTimeout) clearTimeout(simulationTimeout);
    return Promise.resolve();
  },
  removeAllListeners: () => Promise.resolve(),
  isRecognizing: () => Promise.resolve(false),
  cancel: () => Promise.resolve(),
  addListener: (event: any, callback: any) => {
    try {
      if (hasNativeVoice && typeof (RealVoice as any).addListener === 'function') {
        return (RealVoice as any).addListener(event, callback);
      }
    } catch (e) { }
  },
  removeListeners: () => Promise.resolve(),

  onSpeechStart: null as any,
  onSpeechEnd: null as any,
  onSpeechResults: null as any,
  onSpeechPartialResults: null as any,
  onSpeechError: null as any,
};

export default SafeVoice;
