export function videoContainer(buffer: Buffer) {
  if (buffer.length < 12) return null;
  if (buffer.toString('ascii', 4, 8) === 'ftyp') return 'mov';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'AVI ') return 'avi';
  if (buffer.readUInt32BE(0) === 0x1a45dfa3) return 'matroska';
  return null;
}
