// DJ Controller Service for tonys_place_v2

export interface ControllerDevice {
  id: string;
  name: string;
  type: 'midi' | 'hid' | 'usb' | 'bluetooth';
  isConnected: boolean;
  vendorId: number;
  productId: number;
}

export interface ControllerEvent {
  deviceId: string;
  control: string;
  value: number;
  isPressed: boolean;
  timestamp: Date;
}

export type ControllerControl =
  | 'playDeckA' | 'pauseDeckA' | 'stopDeckA'
  | 'playDeckB' | 'pauseDeckB' | 'stopDeckB'
  | 'pitchFaderA' | 'pitchFaderB'
  | 'crossfader'
  | 'gainDeckA' | 'gainDeckB'
  | 'eqLowA' | 'eqMidA' | 'eqHighA'
  | 'eqLowB' | 'eqMidB' | 'eqHighB'
  | 'filterDeckA' | 'filterDeckB'
  | 'jogWheelA' | 'jogWheelB'
  | 'hotcue1A' | 'hotcue2A' | 'hotcue3A' | 'hotcue4A'
  | 'hotcue1B' | 'hotcue2B' | 'hotcue3B' | 'hotcue4B'
  | 'loopInA' | 'loopOutA' | 'loopInB' | 'loopOutB'
  | 'beatSyncA' | 'beatSyncB';

export const supportedControllers: Record<string, number[]> = {
  'Pioneer DDJ-1000': [0x1FC9, 0x0125],
  'Pioneer DDJ-800': [0x1FC9, 0x0121],
  'Pioneer DDJ-1000SRT': [0x1FC9, 0x0130],
  'Pioneer DJM-900NXS2': [0x1FC9, 0x0132],
  'Pioneer DJM-450': [0x1FC9, 0x012F],
  'Denon DJ MC7000': [0x1B73, 0x2302],
  'Denon DJ Prime 4': [0x1B73, 0x2801],
  'Numark NS7III': [0x1CA3, 0xC002],
  'Numark Mixtrack Pro FX': [0x1B3D, 0x0500],
  'Roland DJ-505': [0x0582, 0x0148],
  'Roland DJ-808': [0x0582, 0x0177],
  'Traktor Kontrol S4': [0x17CC, 0x0210],
  'Traktor Kontrol S2': [0x17CC, 0x020E],
  'Hercules DJControl Inpulse 500': [0x0784, 0x0262],
  'Hercules DJControl Instinct': [0x0784, 0x0246],
  'Reloop Beatpad 2': [0x1E56, 0x0202],
  'Reloop Terminal Mix 4': [0x1E56, 0x0201],
  'Native Instruments Traktor S4 MK3': [0x17CC, 0x0215],
  'Generic MIDI': [0x0000, 0x0001],
  'Generic HID': [0x0000, 0x0002],
};

export interface AudioEngine {
  isPlaying: boolean;
  volume: number;
  pitch: number;
  gain: number;
  filter: number;
  currentPosition: number;
  duration: number;
  bpm: number;
  eqValues: { low: number; mid: number; high: number };
  hotcues: (number | null)[];
  loopStart: number;
  loopEnd: number;
}

class DjControllerService {
  private static instance: DjControllerService;
  private devices: ControllerDevice[] = [];
  private isInitialized = false;
  private eventListeners: ((event: ControllerEvent) => void)[] = [];
  private stateListeners: (() => void)[] = [];

  private deckA: AudioEngine = {
    isPlaying: false,
    volume: 0.8,
    pitch: 0,
    gain: 1,
    filter: 0,
    currentPosition: 0,
    duration: 180,
    bpm: 124,
    eqValues: { low: 0, mid: 0, high: 0 },
    hotcues: [null, null, null, null, null, null, null, null],
    loopStart: -1,
    loopEnd: -1,
  };

  private deckB: AudioEngine = {
    isPlaying: false,
    volume: 0.8,
    pitch: 0,
    gain: 1,
    filter: 0,
    currentPosition: 0,
    duration: 180,
    bpm: 126,
    eqValues: { low: 0, mid: 0, high: 0 },
    hotcues: [null, null, null, null, null, null, null, null],
    loopStart: -1,
    loopEnd: -1,
  };

  private masterVolume = 0.75;
  private crossfader = 0.5;
  private selectedMapping = 'Generic MIDI';

  static getInstance(): DjControllerService {
    if (!DjControllerService.instance) {
      DjControllerService.instance = new DjControllerService();
    }
    return DjControllerService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;
    this.scanForControllers();
    this.isInitialized = true;
  }

  private scanForControllers() {
    this.devices = Object.entries(supportedControllers)
      .filter(([name]) => name !== 'Generic MIDI' && name !== 'Generic HID')
      .map(([name, [vendorId, productId]]) => ({
        id: `${name}_${Date.now()}`,
        name,
        type: (name.includes('MIDI') ? 'midi' : 'hid') as ControllerDevice['type'],
        isConnected: true,
        vendorId,
        productId,
      }));
    this.notifyStateChange();
  }

  getDevices() {
    return this.devices;
  }

  getDeckA() { return { ...this.deckA }; }
  getDeckB() { return { ...this.deckB }; }
  getMasterVolume() { return this.masterVolume; }
  getCrossfader() { return this.crossfader; }
  getSelectedMapping() { return this.selectedMapping; }

  setSelectedMapping(mapping: string) {
    this.selectedMapping = mapping;
    this.notifyStateChange();
  }

  // Transport controls
  togglePlayA() {
    this.deckA.isPlaying = !this.deckA.isPlaying;
    this.notifyStateChange();
  }

  togglePlayB() {
    this.deckB.isPlaying = !this.deckB.isPlaying;
    this.notifyStateChange();
  }

  stopA() {
    this.deckA.isPlaying = false;
    this.deckA.currentPosition = 0;
    this.notifyStateChange();
  }

  stopB() {
    this.deckB.isPlaying = false;
    this.deckB.currentPosition = 0;
    this.notifyStateChange();
  }

  // Pitch control
  setPitchA(value: number) {
    this.deckA.pitch = Math.max(-0.5, Math.min(0.5, value));
    this.deckA.bpm = 120 * (1 + this.deckA.pitch);
    this.notifyStateChange();
  }

  setPitchB(value: number) {
    this.deckB.pitch = Math.max(-0.5, Math.min(0.5, value));
    this.deckB.bpm = 120 * (1 + this.deckB.pitch);
    this.notifyStateChange();
  }

  // Volume control
  setVolumeA(value: number) {
    this.deckA.volume = Math.max(0, Math.min(1, value));
    this.notifyStateChange();
  }

  setVolumeB(value: number) {
    this.deckB.volume = Math.max(0, Math.min(1, value));
    this.notifyStateChange();
  }

  // EQ control
  setEqA(band: 'low' | 'mid' | 'high', value: number) {
    this.deckA.eqValues[band] = Math.max(-1, Math.min(1, value));
    this.notifyStateChange();
  }

  setEqB(band: 'low' | 'mid' | 'high', value: number) {
    this.deckB.eqValues[band] = Math.max(-1, Math.min(1, value));
    this.notifyStateChange();
  }

  // Filter
  setFilterA(value: number) {
    this.deckA.filter = Math.max(0, Math.min(1, value));
    this.notifyStateChange();
  }

  setFilterB(value: number) {
    this.deckB.filter = Math.max(0, Math.min(1, value));
    this.notifyStateChange();
  }

  // Crossfader
  setCrossfader(value: number) {
    this.crossfader = Math.max(0, Math.min(1, value));
    this.deckA.volume = (1 - this.crossfader) * 0.8;
    this.deckB.volume = this.crossfader * 0.8;
    this.notifyStateChange();
  }

  // Master
  setMasterVolume(value: number) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    this.notifyStateChange();
  }

  // Hotcues
  triggerHotcueA(index: number, pressed: boolean) {
    if (pressed) {
      if (this.deckA.hotcues[index] !== null) {
        this.deckA.currentPosition = this.deckA.hotcues[index]!;
      } else {
        this.deckA.hotcues[index] = this.deckA.currentPosition;
      }
    }
    this.notifyStateChange();
  }

  triggerHotcueB(index: number, pressed: boolean) {
    if (pressed) {
      if (this.deckB.hotcues[index] !== null) {
        this.deckB.currentPosition = this.deckB.hotcues[index]!;
      } else {
        this.deckB.hotcues[index] = this.deckB.currentPosition;
      }
    }
    this.notifyStateChange();
  }

  // Loops
  setLoopInA() {
    this.deckA.loopStart = Math.floor(this.deckA.currentPosition);
    this.notifyStateChange();
  }

  setLoopOutA() {
    this.deckA.loopEnd = Math.floor(this.deckA.currentPosition);
    this.notifyStateChange();
  }

  setLoopInB() {
    this.deckB.loopStart = Math.floor(this.deckB.currentPosition);
    this.notifyStateChange();
  }

  setLoopOutB() {
    this.deckB.loopEnd = Math.floor(this.deckB.currentPosition);
    this.notifyStateChange();
  }

  // Beat sync
  syncA() {
    this.deckA.bpm = this.deckB.bpm;
    this.notifyStateChange();
  }

  syncB() {
    this.deckB.bpm = this.deckA.bpm;
    this.notifyStateChange();
  }

  // Event handling
  onEvent(callback: (event: ControllerEvent) => void) {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter(cb => cb !== callback);
    };
  }

  onStateChange(callback: () => void) {
    this.stateListeners.push(callback);
    return () => {
      this.stateListeners = this.stateListeners.filter(cb => cb !== callback);
    };
  }

  private notifyStateChange() {
    this.stateListeners.forEach(cb => cb());
  }

  processMidiEvent(channel: number, note: number, velocity: number) {
    // Map MIDI to controls based on selected mapping
    const event: ControllerEvent = {
      deviceId: 'midi',
      control: `note_${note}`,
      value: velocity / 127,
      isPressed: velocity > 0,
      timestamp: new Date(),
    };
    this.eventListeners.forEach(cb => cb(event));
  }

  // Simulate position updates
  tick() {
    if (this.deckA.isPlaying) {
      this.deckA.currentPosition = (this.deckA.currentPosition + 0.1) % this.deckA.duration;
    }
    if (this.deckB.isPlaying) {
      this.deckB.currentPosition = (this.deckB.currentPosition + 0.1) % this.deckB.duration;
    }
    this.notifyStateChange();
  }
}

export const djControllerService = DjControllerService.getInstance();