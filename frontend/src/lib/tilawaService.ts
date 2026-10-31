/**
 * tilawaService.ts
 * Integrasi Quran Verse & Speech Recognition berbasis @tilawa/core (Yazin Sai)
 * dan Hugging Face pre-trained Zipformer / CTC model.
 */

import type { RecognitionSession } from '@tilawa/core';

export interface TilawaMatchEvent {
  surah: number;
  ayah: number;
  confidence?: number;
  raw?: string;
}

export class TilawaVoiceService {
  private session: RecognitionSession | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private isListening = false;
  private onMatchCallback: ((event: TilawaMatchEvent) => void) | null = null;
  private onErrorCallback: ((err: any) => void) | null = null;
  private isModelLoading = false;

  constructor() {}

  public onMatch(cb: (event: TilawaMatchEvent) => void) {
    this.onMatchCallback = cb;
  }

  public onError(cb: (err: any) => void) {
    this.onErrorCallback = cb;
  }

  /**
   * Inisialisasi model Tilawa ONNX (Zipformer Tajweed Phoneme Engine)
   */
  public async initEngine(): Promise<boolean> {
    if (this.session) return true;
    if (this.isModelLoading) return false;

    this.isModelLoading = true;
    try {
      const ort = await import('onnxruntime-web');
      const { createRecognitionSession } = await import('@tilawa/core');

      // Setup session dengan assets dari Hugging Face / GitHub Releases
      const session = await createRecognitionSession({
        engine: 'zipformer',
        ort,
        model: () =>
          fetch(
            'https://github.com/yazinsai/tilawa/releases/download/zipformer-a0w-ep1-a0.5/zipformer_a0w_ep1_a05.int8.onnx'
          ).then((r) => r.arrayBuffer()),
        corpus: () =>
          fetch('https://github.com/yazinsai/tilawa/releases/download/v0.3.0/zipformer_quran.json').then((r) =>
            r.json()
          ),
        onOutput: (msg: any) => {
          if (msg && msg.type === 'verse_match' && this.onMatchCallback) {
            this.onMatchCallback({
              surah: msg.surah,
              ayah: msg.ayah,
              confidence: msg.confidence || 0.95,
              raw: msg.verse_text,
            });
          }
        },
      } as any);

      this.session = session;
      this.isModelLoading = false;
      return true;
    } catch (err) {
      console.warn('Tilawa ONNX model initialization note (fallback active):', err);
      this.isModelLoading = false;
      return false;
    }
  }

  /**
   * Mulai mendengarkan audio microphone pada sample rate 16kHz
   */
  public async startListening(): Promise<boolean> {
    if (this.isListening) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.mediaStream = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      this.audioContext = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // Gunakan buffer 4096 untuk streaming chunks ke recognizer
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      this.processor = processor;

      processor.onaudioprocess = async (e) => {
        if (!this.isListening || !this.session) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const chunk = new Float32Array(inputData);
        try {
          await this.session.feed(chunk);
        } catch {
          // ignore chunk feed error
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
      this.isListening = true;
      return true;
    } catch (err) {
      console.warn('Microphone permission or audio pipeline:', err);
      if (this.onErrorCallback) this.onErrorCallback(err);
      return false;
    }
  }

  /**
   * Hentikan streaming audio
   */
  public stopListening() {
    this.isListening = false;
    if (this.processor) {
      try {
        this.processor.disconnect();
      } catch {}
      this.processor = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.session) {
      try {
        this.session.reset();
      } catch {}
    }
  }
}
