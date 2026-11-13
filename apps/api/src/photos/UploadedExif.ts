const mainTags = {
  0x010f: 'Make', 0x0110: 'Model', 0x0112: 'Orientation', 0x011a: 'XResolution',
  0x011b: 'YResolution', 0x0128: 'ResolutionUnit', 0x0131: 'Software', 0x0132: 'DateTime',
  0x013b: 'Artist', 0x8298: 'Copyright',
};

const captureTags = {
  0x829a: 'ExposureTime', 0x829d: 'FNumber', 0x8822: 'ExposureProgram', 0x8827: 'ISOSpeedRatings',
  0x9003: 'DateTimeOriginal', 0x9004: 'DateTimeDigitized', 0x9201: 'ShutterSpeedValue',
  0x9202: 'ApertureValue', 0x9203: 'BrightnessValue', 0x9204: 'ExposureBiasValue',
  0x9205: 'MaxApertureValue', 0x9207: 'MeteringMode', 0x9208: 'LightSource',
  0x9209: 'Flash', 0x920a: 'FocalLength', 0xa001: 'ColorSpace',
  0xa002: 'PixelXDimension', 0xa003: 'PixelYDimension', 0xa402: 'ExposureMode',
  0xa403: 'WhiteBalance', 0xa405: 'FocalLengthIn35mmFilm', 0xa406: 'SceneCaptureType',
};

export function uploadedExif(bytes?: Buffer) {
  if (!bytes) return {};
  const tiff = bytes.subarray(bytes.subarray(0, 6).equals(Buffer.from('Exif\0\0')) ? 6 : 0);
  if (tiff.length < 8) return {};
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const order = view.getUint16(0);
  if (order !== 0x4949 && order !== 0x4d4d) return {};
  const little = order === 0x4949;
  const short = (at: number) => view.getUint16(at, little);
  const long = (at: number) => view.getUint32(at, little);
  if (short(2) !== 42) return {};

  const fields: Record<string, string | number> = {};
  let captureOffset = 0;
  function directory(offset: number, prefix: string, tags: Record<number, string>) {
    if (offset < 8 || offset + 2 > tiff.length) return;
    const count = short(offset);
    if (offset + 2 + count * 12 > tiff.length) return;
    for (let i = 0; i < count; i++) {
      const entry = offset + 2 + i * 12;
      const tag = short(entry);
      const type = short(entry + 2);
      const size = long(entry + 4);
      if (prefix === 'IFD0' && tag === 0x8769 && type === 4 && size === 1) captureOffset = long(entry + 8);
      if (!Object.hasOwn(tags, tag) || !size || size > 4096) continue;
      const key = prefix + '.' + tags[tag];
      if (type === 2) {
        const start = size <= 4 ? entry + 8 : long(entry + 8);
        if (start + size <= tiff.length) fields[key] = tiff.toString('utf8', start, start + size).split('\0')[0].trim();
      } else if (size === 1 && type === 3) {
        fields[key] = short(entry + 8);
      } else if (size === 1 && type === 4) {
        fields[key] = long(entry + 8);
      } else if (size === 1 && (type === 5 || type === 10)) {
        const start = long(entry + 8);
        if (start + 8 > tiff.length) continue;
        const numerator = type === 5 ? long(start) : view.getInt32(start, little);
        const denominator = type === 5 ? long(start + 4) : view.getInt32(start + 4, little);
        if (denominator) fields[key] = numerator + '/' + denominator;
      }
    }
  }
  directory(long(4), 'IFD0', mainTags);
  directory(captureOffset, 'EXIF', captureTags);
  return fields;
}
