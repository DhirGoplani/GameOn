const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function createWavBuffer(samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = Buffer.alloc(totalSize);

  // RIFF Chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(totalSize - 8, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // audioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write samples
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const int16 = Math.floor(clamped * 32767);
    buffer.writeInt16LE(int16, 44 + i * 2);
  }

  return buffer;
}

// 1. FLAP (Airy wing whoosh + ascending chirp)
function generateFlapSound() {
  const duration = 0.12;
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;

    // Pitch sweep from 280Hz up to 720Hz
    const freq = 280 + 440 * Math.sin(progress * Math.PI * 0.85);
    const phase = 2 * Math.PI * freq * t;

    // Sine tone with triangle harmonic
    const tone = 0.7 * Math.sin(phase) + 0.3 * Math.sin(phase * 2);

    // Subtle airy noise transient
    const noise = (Math.random() * 2 - 1) * Math.exp(-progress * 18) * 0.25;

    // Fast attack (5ms), smooth exponential decay
    const envelope = (1 - Math.exp(-t * 400)) * Math.exp(-progress * 4.5);

    samples[i] = (tone + noise) * envelope * 0.85;
  }

  return createWavBuffer(samples);
}

// 2. POINT (Crystalline two-tone bell ding: B5 988Hz -> E6 1319Hz)
function generatePointSound() {
  const duration = 0.28;
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;

    let sample = 0;

    // First chime (0.00s to 0.14s) - 988Hz
    if (t < 0.14) {
      const t1 = t;
      const freq1 = 987.77;
      const env1 = Math.exp(-t1 * 18);
      sample += (Math.sin(2 * Math.PI * freq1 * t1) + 0.25 * Math.sin(2 * Math.PI * freq1 * 2 * t1)) * env1 * 0.6;
    }

    // Second chime (starts at 0.07s) - 1318.51Hz (High E6)
    if (t >= 0.07) {
      const t2 = t - 0.07;
      const freq2 = 1318.51;
      const env2 = Math.exp(-t2 * 12);
      sample += (Math.sin(2 * Math.PI * freq2 * t2) + 0.3 * Math.sin(2 * Math.PI * freq2 * 2 * t2)) * env2 * 0.85;
    }

    samples[i] = sample;
  }

  return createWavBuffer(samples);
}

// 3. HIT (Punchy retro collision thump)
function generateHitSound() {
  const duration = 0.16;
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;

    // Pitch drop from 240Hz down to 45Hz
    const freq = Math.max(45, 240 * Math.exp(-progress * 14));
    const tone = Math.sin(2 * Math.PI * freq * t);

    // Initial impact transient noise
    const noise = (Math.random() * 2 - 1) * Math.exp(-progress * 28) * 0.45;

    const env = (1 - Math.exp(-t * 600)) * Math.exp(-progress * 6);
    samples[i] = (tone * 0.75 + noise) * env * 0.95;
  }

  return createWavBuffer(samples);
}

// 4. DIE / EXTINCTION (Retro descending slide stinger)
function generateDieSound() {
  const duration = 0.45;
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;

    // Downward pitch bend 600Hz down to 90Hz with retro pulse vibrato
    const baseFreq = Math.max(90, 600 * Math.pow(1 - progress, 1.8));
    const vibrato = Math.sin(2 * Math.PI * 18 * t) * 15;
    const freq = baseFreq + vibrato;

    // Square/triangle wave blend for authentic 8-bit sound
    const phase = 2 * Math.PI * freq * t;
    const square = Math.sin(phase) >= 0 ? 0.6 : -0.6;
    const sine = Math.sin(phase) * 0.4;

    const env = (1 - Math.exp(-t * 300)) * Math.exp(-progress * 3.8);
    samples[i] = (square + sine) * env * 0.8;
  }

  return createWavBuffer(samples);
}

// 5. MILESTONE (Bright arcade high-beep chime for Dino 100-pt marks)
function generateMilestoneSound() {
  const duration = 0.28;
  const totalSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    if (t < 0.12) {
      const env = Math.exp(-t * 16);
      sample += Math.sin(2 * Math.PI * 1174.66 * t) * env * 0.65; // D6
    }
    if (t >= 0.08) {
      const t2 = t - 0.08;
      const env = Math.exp(-t2 * 14);
      sample += Math.sin(2 * Math.PI * 1567.98 * t2) * env * 0.8; // G6
    }

    samples[i] = sample;
  }

  return createWavBuffer(samples);
}

// Write files
const outputDir = path.join(__dirname, '..', 'assets', 'sounds');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'flappy_flap.wav'), generateFlapSound());
fs.writeFileSync(path.join(outputDir, 'flappy_point.wav'), generatePointSound());
fs.writeFileSync(path.join(outputDir, 'flappy_hit.wav'), generateHitSound());
fs.writeFileSync(path.join(outputDir, 'flappy_die.wav'), generateDieSound());
fs.writeFileSync(path.join(outputDir, 'arcade_milestone.wav'), generateMilestoneSound());

console.log('Successfully generated retro arcade audio assets!');
