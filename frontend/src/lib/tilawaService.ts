/**
 * tilawaService.ts
 * Integrasi Quran Verse & Speech Recognition berbasis @tilawa/core (Yazin Sai)
 * dan Hugging Face pre-trained Zipformer / FastConformer CTC model.
 */

type RecognitionSession = any;

export interface TilawaMatchEvent {
  surah: number;
  ayah: number;
  confidence?: number;
  raw?: string;
}

export interface TilawaProgressEvent {
  loaded: number;
  total: number;
  percent: number;
  status: 'idle' | 'downloading' | 'compiling' | 'ready' | 'error';
  message?: string;
}

export class TilawaVoiceService {
  private session: RecognitionSession | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private isListening = false;
  private onMatchCallback: ((event: TilawaMatchEvent) => void) | null = null;
  private onErrorCallback: ((err: any) => void) | null = null;
  private onProgressCallback: ((event: TilawaProgressEvent) => void) | null = null;
  private isModelLoading = false;
  public isReady = false;

  constructor() {}

  public onMatch(cb: (event: TilawaMatchEvent) => void) {
    this.onMatchCallback = cb;
  }

  public onError(cb: (err: any) => void) {
    this.onErrorCallback = cb;
  }

  public onProgress(cb: (event: TilawaProgressEvent) => void) {
    this.onProgressCallback = cb;
  }

  private notifyProgress(p: TilawaProgressEvent) {
    if (this.onProgressCallback) {
      this.onProgressCallback(p);
    }
  }

  /**
   * Unduh buffer dengan monitoring progress
   */
  private async fetchWithProgress(url: string, label: string): Promise<ArrayBuffer> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status} saat mengunduh ${label}`);
    const contentLength = res.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    if (!total || !res.body) {
      const buf = await res.arrayBuffer();
      this.notifyProgress({
        loaded: buf.byteLength,
        total: buf.byteLength,
        percent: 100,
        status: 'downloading',
        message: `${label} selesai diunduh`,
      });
      return buf;
    }

    const reader = res.body.getReader();
    let loaded = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.length;
        const percent = Math.min(100, Math.round((loaded / total) * 100));
        this.notifyProgress({
          loaded,
          total,
          percent,
          status: 'downloading',
          message: `Mengunduh ${label}: ${percent}% (${(loaded / (1024 * 1024)).toFixed(1)}MB / ${(total / (1024 * 1024)).toFixed(1)}MB)`,
        });
      }
    }

    const merged = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return merged.buffer;
  }

  /**
   * Inisialisasi model Tilawa ONNX (Zipformer / FastConformer Engine) dari Hugging Face
   */
  public async initEngine(): Promise<boolean> {
    if (this.session) {
      this.isReady = true;
      return true;
    }
    if (this.isModelLoading) return false;

    this.isModelLoading = true;
    this.notifyProgress({
      loaded: 0,
      total: 100,
      percent: 0,
      status: 'downloading',
      message: 'Menghubungkan ke model Quran AI di Hugging Face...',
    });

    try {
      const ort = await (Function('m', 'return import(m)')('onnxruntime-web') as Promise<any>).catch(() => null);
      const tilawaMod = await (Function('m', 'return import(m)')('@tilawa/core') as Promise<any>).catch(() => ({}));
      const createRecognitionSession = tilawaMod?.createRecognitionSession;
      if (!createRecognitionSession) {
        this.isModelLoading = false;
        return false;
      }

      // Model ONNX Quran dari Hugging Face dengan dukungan CORS
      const modelUrl =
        'https://huggingface.co/acibZ/tilawa-quran-onnx/resolve/main/fastconformer_full_mixed.onnx';
      const corpusUrl =
        'https://huggingface.co/acibZ/tilawa-quran-onnx/resolve/main/quran.json';

      this.notifyProgress({
        loaded: 0,
        total: 100,
        percent: 5,
        status: 'downloading',
        message: 'Mengunduh kamus fonem Qur\'an (quran.json)...',
      });

      const corpusRes = await fetch(corpusUrl);
      const corpusData = await corpusRes.json();

      this.notifyProgress({
        loaded: 0,
        total: 100,
        percent: 15,
        status: 'downloading',
        message: 'Mengunduh model neural Quran ONNX (Hugging Face)...',
      });

      const modelBuffer = await this.fetchWithProgress(modelUrl, 'Model ONNX Quran');

      this.notifyProgress({
        loaded: 100,
        total: 100,
        percent: 95,
        status: 'compiling',
        message: 'Menginisialisasi sesi WebAssembly neural engine...',
      });

      const session = await createRecognitionSession({
        engine: 'zipformer',
        ort,
        model: () => Promise.resolve(modelBuffer),
        corpus: () => Promise.resolve(corpusData),
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
      this.isReady = true;
      this.notifyProgress({
        loaded: 100,
        total: 100,
        percent: 100,
        status: 'ready',
        message: 'Model Quran AI Tilawa (Hugging Face) siap digunakan.',
      });
      return true;
    } catch (err) {
      console.warn('Tilawa ONNX Hugging Face note (client fallback active):', err);
      this.isModelLoading = false;
      this.notifyProgress({
        loaded: 0,
        total: 0,
        percent: 0,
        status: 'error',
        message: 'Menggunakan pengenal suara instan browser (Web Speech API + QUL Matcher).',
      });
      return false;
    }
  }

  /**
   * Mulai streaming mikrofon 16kHz
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
