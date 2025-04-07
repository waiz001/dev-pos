
// Type definitions for Web Speech API
// These definitions are needed because TypeScript doesn't include them by default

interface Window {
  webkitSpeechRecognition: new () => SpeechRecognition;
  SpeechRecognition: new () => SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onnomatch: () => void;
  onstart: () => void;
  onaudiostart: () => void;
  onaudioend: () => void;
  onsoundstart: () => void;
  onsoundend: () => void;
  onspeechstart: () => void;
  onspeechend: () => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: 'aborted' | 'audio-capture' | 'bad-grammar' | 'language-not-supported' | 'network' | 'no-speech' | 'not-allowed' | 'service-not-allowed' | string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
