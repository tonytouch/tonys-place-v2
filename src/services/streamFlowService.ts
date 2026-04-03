// StreamFlow Service - Web-based streaming using browser APIs

export interface StreamConfig {
  videoSource: string;
  audioSource: string;
  filters: {
    brightness: number;
    contrast: number;
    blur: number;
    saturation: number;
  };
  rtmpUrl: string;
  recordToFile: boolean;
}

export interface StreamStats {
  fps: number;
  bitrate: number;
  audioLevel: number;
  isStreaming: boolean;
  isRecording: boolean;
  duration: number;
}

export interface FilterSettings {
  brightness: number;
  contrast: number;
  blur: number;
  saturation: number;
}

class StreamFlowService {
  private static instance: StreamFlowService;
  private mediaStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private animationFrameId: number | null = null;
  private isStreaming = false;
  private isRecording = false;
  private startTime = 0;
  private frameCount = 0;
  private lastFpsUpdate = 0;
  private currentFps = 0;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioLevel = 0;
  private eventListeners: ((stats: StreamStats) => void)[] = [];

  private filters: FilterSettings = {
    brightness: 100,
    contrast: 100,
    blur: 0,
    saturation: 100,
  };

  static getInstance(): StreamFlowService {
    if (!StreamFlowService.instance) {
      StreamFlowService.instance = new StreamFlowService();
    }
    return StreamFlowService.instance;
  }

  async getDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        videoInputs: devices.filter(d => d.kind === 'videoinput'),
        audioInputs: devices.filter(d => d.kind === 'audioinput'),
        audioOutputs: devices.filter(d => d.kind === 'audiooutput'),
      };
    } catch (e) {
      console.error('Error getting devices:', e);
      return { videoInputs: [], audioInputs: [], audioOutputs: [] };
    }
  }

  async startPreview(videoElement: HTMLVideoElement, config: Partial<StreamConfig> = {}) {
    try {
      this.videoElement = videoElement;
      
      const constraints: MediaStreamConstraints = {
        video: config.videoSource 
          ? { deviceId: { exact: config.videoSource } }
          : true,
        audio: config.audioSource
          ? { deviceId: { exact: config.audioSource } }
          : true,
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.mediaStream;
      await videoElement.play();

      // Set up audio analyser
      const audioTrack = this.mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        this.audioContext = new AudioContext();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);
      }

      this.startTime = Date.now();
      this.startStatsLoop();

      return true;
    } catch (e) {
      console.error('Error starting preview:', e);
      return false;
    }
  }

  private startStatsLoop() {
    const updateStats = () => {
      if (!this.isStreaming && !this.isRecording) return;

      this.frameCount++;
      const now = Date.now();
      
      if (now - this.lastFpsUpdate >= 1000) {
        this.currentFps = this.frameCount;
        this.frameCount = 0;
        this.lastFpsUpdate = now;
      }

      // Update audio level
      if (this.analyser) {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        this.audioLevel = Math.min(100, average * 1.5);
      }

      const stats: StreamStats = {
        fps: this.currentFps,
        bitrate: this.isStreaming ? 5000 : 0,
        audioLevel: this.audioLevel,
        isStreaming: this.isStreaming,
        isRecording: this.isRecording,
        duration: Math.floor((Date.now() - this.startTime) / 1000),
      };

      this.eventListeners.forEach(cb => cb(stats));

      this.animationFrameId = requestAnimationFrame(updateStats);
    };

    updateStats();
  }

  setFilters(filters: Partial<FilterSettings>) {
    this.filters = { ...this.filters, ...filters };
  }

  getFilters(): FilterSettings {
    return { ...this.filters };
  }

  applyFilters(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // CSS filters are applied to the canvas element, not here
    // This is handled in the render loop
  }

  getCssFilters(): string {
    const { brightness, contrast, blur, saturation } = this.filters;
    return `brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px) saturate(${saturation}%)`;
  }

  async startStreaming(rtmpUrl: string): Promise<boolean> {
    if (!this.mediaStream) {
      console.error('No media stream available');
      return false;
    }

    try {
      // In a real implementation, this would connect to an RTMP server
      // For web, we use WebRTC or simulate the connection
      console.log('Starting stream to:', rtmpUrl);
      
      this.isStreaming = true;
      this.startTime = Date.now();
      this.startStatsLoop();

      return true;
    } catch (e) {
      console.error('Error starting stream:', e);
      return false;
    }
  }

  async stopStreaming(): Promise<boolean> {
    this.isStreaming = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    return true;
  }

  async startRecording(): Promise<boolean> {
    if (!this.mediaStream) {
      console.error('No media stream available');
      return false;
    }

    try {
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(1000);
      this.isRecording = true;
      this.startTime = Date.now();
      this.startStatsLoop();

      return true;
    } catch (e) {
      console.error('Error starting recording:', e);
      return false;
    }
  }

  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.recordedChunks = [];
        this.isRecording = false;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  downloadRecording(blob: Blob, filename?: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `streamflow_recording_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async captureScreenshot(): Promise<string | null> {
    if (!this.videoElement || !this.canvasElement) return null;

    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.filter = this.getCssFilters();
    ctx.drawImage(this.videoElement, 0, 0);

    return canvas.toDataURL('image/png');
  }

  onStatsUpdate(callback: (stats: StreamStats) => void) {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter(cb => cb !== callback);
    };
  }

  stopPreview() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.isStreaming = false;
    this.isRecording = false;
  }

  isActive() {
    return this.isStreaming || this.isRecording;
  }

  getMediaStream() {
    return this.mediaStream;
  }
}

export const streamFlowService = StreamFlowService.getInstance();