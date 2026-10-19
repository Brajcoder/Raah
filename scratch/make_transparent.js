import fs from 'fs';
import zlib from 'zlib';

const buf = fs.readFileSync('public/logo.png');

let pos = 8;
const chunks = [];
let width = 0;
let height = 0;
let bitDepth = 0;
let colorType = 0;

const idatBuffers = [];

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  const data = buf.subarray(pos + 8, pos + 8 + len);
  const crc = buf.readUInt32BE(pos + 8 + len);
  chunks.push({ type, data, crc });
  if (type === 'IHDR') {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    bitDepth = data[8];
    colorType = data[9];
  } else if (type === 'IDAT') {
    idatBuffers.push(data);
  }
  pos += 12 + len;
}

console.log(`Dimensions: ${width}x${height}, depth: ${bitDepth}, type: ${colorType}`);

// Concat and uncompress IDAT
const compressedData = Buffer.concat(idatBuffers);
const uncompressed = zlib.inflateSync(compressedData);

// PNG scanlines: each row has 1 filter byte + width * 4 bytes (RGBA)
const stride = 1 + width * 4;
console.log(`Uncompressed size: ${uncompressed.length}, expected: ${stride * height}`);

// Unfilter scanlines to get raw RGBA
const raw = Buffer.alloc(width * height * 4);

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

for (let y = 0; y < height; y++) {
  const rowStart = y * stride;
  const filter = uncompressed[rowStart];
  const destRowStart = y * width * 4;

  for (let x = 0; x < width * 4; x++) {
    const rawVal = uncompressed[rowStart + 1 + x];
    const left = x >= 4 ? raw[destRowStart + x - 4] : 0;
    const up = y > 0 ? raw[(y - 1) * width * 4 + x] : 0;
    const upLeft = y > 0 && x >= 4 ? raw[(y - 1) * width * 4 + x - 4] : 0;

    let val = 0;
    if (filter === 0) val = rawVal;
    else if (filter === 1) val = (rawVal + left) & 0xff;
    else if (filter === 2) val = (rawVal + up) & 0xff;
    else if (filter === 3) val = (rawVal + Math.floor((left + up) / 2)) & 0xff;
    else if (filter === 4) val = (rawVal + paeth(left, up, upLeft)) & 0xff;
    else throw new Error(`Unknown filter: ${filter}`);

    raw[destRowStart + x] = val;
  }
}

console.log('Unfiltering complete!');

// Now modify alpha for near-white pixels
let transparentCount = 0;
for (let i = 0; i < raw.length; i += 4) {
  const r = raw[i];
  const g = raw[i + 1];
  const b = raw[i + 2];

  // If pixel is white / background (tolerance > 240)
  if (r > 240 && g > 240 && b > 240) {
    // Gradual feathering for smooth edge anti-aliasing
    const minC = Math.min(r, g, b);
    if (minC >= 252) {
      raw[i + 3] = 0;
      transparentCount++;
    } else {
      // Smooth alpha ramp between 240 and 252
      const alphaFactor = (252 - minC) / 12; // 0 at 252, 1 at 240
      raw[i + 3] = Math.round(raw[i + 3] * alphaFactor);
      transparentCount++;
    }
  }
}

console.log(`Made ${transparentCount} pixels transparent or semi-transparent!`);

// Re-encode with filter 0 (none) for all rows
const filtered = Buffer.alloc(stride * height);
for (let y = 0; y < height; y++) {
  filtered[y * stride] = 0; // Filter 0
  raw.copy(filtered, y * stride + 1, y * width * 4, (y + 1) * width * 4);
}

const newIdatData = zlib.deflateSync(filtered, { level: 9 });

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function calcCrc(typeStr, dataBuf) {
  let crc = 0xffffffff;
  const header = Buffer.from(typeStr, 'ascii');
  for (let i = 0; i < header.length; i++) {
    crc = crcTable[(crc ^ header[i]) & 0xff] ^ (crc >>> 8);
  }
  for (let i = 0; i < dataBuf.length; i++) {
    crc = crcTable[(crc ^ dataBuf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = calcCrc(type, data);
  chunk.writeUInt32BE(crc, 8 + data.length);
  return chunk;
}

const ihdrChunk = chunks.find(c => c.type === 'IHDR');
const newIhdr = makeChunk('IHDR', ihdrChunk.data);
const newIdat = makeChunk('IDAT', newIdatData);
const newIend = makeChunk('IEND', Buffer.alloc(0));

const finalPng = Buffer.concat([
  buf.subarray(0, 8), // PNG signature
  newIhdr,
  newIdat,
  newIend
]);

fs.writeFileSync('public/logo-transparent.png', finalPng);
fs.writeFileSync('src/assets/logo-transparent.png', finalPng);
console.log('Successfully saved public/logo-transparent.png (' + finalPng.length + ' bytes)');
