import fs from "node:fs";
import path from "node:path";

const sampleRate = 44100;
const outputDir = path.resolve("assets", "sounds");

function writeWav(name, duration, sampleAt) {
  const sampleCount = Math.floor(sampleRate * duration);
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const value = Math.max(-1, Math.min(1, sampleAt(time, duration)));
    buffer.writeInt16LE(Math.round(value * 32767), 44 + index * 2);
  }

  fs.writeFileSync(path.join(outputDir, name), buffer);
}

fs.mkdirSync(outputDir, { recursive: true });

writeWav("card-deal.wav", 0.22, (time, duration) => {
  const envelope = Math.pow(1 - time / duration, 2.8);
  const noise = Math.random() * 2 - 1;
  const slide = Math.sin(2 * Math.PI * (135 + time * 420) * time);
  const landing = Math.sin(2 * Math.PI * 72 * time) * Math.exp(-time * 25);
  return (noise * 0.22 + slide * 0.16 + landing * 0.18) * envelope;
});

writeWav("chip-place.wav", 0.16, (time) => {
  const first = Math.sin(2 * Math.PI * 1320 * time) * Math.exp(-time * 34);
  const secondTime = Math.max(0, time - 0.045);
  const second = Math.sin(2 * Math.PI * 1780 * secondTime) * Math.exp(-secondTime * 48);
  const body = Math.sin(2 * Math.PI * 310 * time) * Math.exp(-time * 30);
  return first * 0.45 + second * 0.28 + body * 0.18;
});
