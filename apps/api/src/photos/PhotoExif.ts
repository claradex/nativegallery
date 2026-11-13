const labels: Record<string, string> = {
  "FILE.FileName": "Имя файла",
  "FILE.FileSize": "Размер файла",
  "FILE.FileDateTime": "Дата и время файла",
  "COMPUTED.MimeType": "Тип MIME",
  "IFD0.Make": "Производитель камеры",
  "IFD0.Model": "Модель камеры",
  "IFD0.Orientation": "Ориентация",
  "IFD0.XResolution": "Разрешение по X",
  "IFD0.YResolution": "Разрешение по Y",
  "IFD0.ResolutionUnit": "Единица разрешения",
  "IFD0.Software": "Программное обеспечение",
  "IFD0.DateTime": "Дата и время",
  "IFD0.Artist": "Автор",
  "IFD0.Copyright": "Авторские права",
  "EXIF.ExposureTime": "Время экспозиции",
  "EXIF.FNumber": "Диафрагма",
  "EXIF.ExposureProgram": "Программа экспозиции",
  "EXIF.ISOSpeedRatings": "ISO",
  "EXIF.ExifVersion": "Версия EXIF",
  "EXIF.DateTimeOriginal": "Дата и время оригинала",
  "EXIF.DateTimeDigitized": "Дата и время оцифровки",
  "EXIF.ShutterSpeedValue": "Значение выдержки",
  "EXIF.ApertureValue": "Значение диафрагмы",
  "EXIF.BrightnessValue": "Значение яркости",
  "EXIF.ExposureBiasValue": "Экспокоррекция",
  "EXIF.MaxApertureValue": "Максимальная диафрагма",
  "EXIF.MeteringMode": "Режим экспозамера",
  "EXIF.LightSource": "Источник света",
  "EXIF.Flash": "Вспышка",
  "EXIF.FocalLength": "Фокусное расстояние",
  "EXIF.SubjectArea": "Область объекта",
  "EXIF.FlashpixVersion": "Версия Flashpix",
  "EXIF.ColorSpace": "Цветовое пространство",
  "EXIF.PixelXDimension": "Размер изображения по X",
  "EXIF.PixelYDimension": "Размер изображения по Y",
  "EXIF.SensingMethod": "Метод съёмки",
  "EXIF.SceneType": "Тип сцены",
  "EXIF.ExposureMode": "Режим экспозиции",
  "EXIF.WhiteBalance": "Баланс белого",
  "EXIF.FocalLengthIn35mmFilm": "Фокусное расстояние для 35мм плёнки",
  "EXIF.SceneCaptureType": "Тип съёмки",
  "EXIF.GainControl": "Регулировка усиления",
  "EXIF.Contrast": "Контрастность",
  "EXIF.Saturation": "Насыщенность",
  "EXIF.Sharpness": "Резкость",
  "GPS.GPSLatitude": "Широта",
  "GPS.GPSLongitude": "Долгота",
  "GPS.GPSAltitude": "Высота",
  "GPS.GPSTimeStamp": "Время GPS",
  "GPS.GPSDateStamp": "Дата GPS"
};

const descriptions: Record<string, { entries: Record<string, string>; fallback: string }> = {
  "EXIF.Flash": {
    "entries": {
      "0": "Выключена",
      "1": "Включена",
      "2": "Сработала с подавлением эффекта красных глаз",
      "3": "Сработала в принудительном режиме",
      "4": "Выключена в принудительном режиме",
      "5": "Автоматический режим",
      "6": "Автоматический режим"
    },
    "fallback": "Неизвестное значение вспышки"
  },
  "IFD0.Orientation": {
    "entries": {
      "1": "0° (По умолчанию)",
      "3": "180°",
      "6": "90° по часовой стрелке",
      "8": "270° по часовой стрелке"
    },
    "fallback": "Не определена"
  },
  "IFD0.ResolutionUnit": {
    "entries": {
      "1": "Дюймы",
      "2": "Сантиметры"
    },
    "fallback": "Неизвестная единица"
  },
  "EXIF.WhiteBalance": {
    "entries": {
      "0": "Автоматический",
      "1": "Ручной"
    },
    "fallback": "Неизвестный баланс белого"
  },
  "IFD0.LightSource": {
    "entries": {
      "0": "Неизвестный источник",
      "1": "Дневной свет",
      "2": "Лампа накаливания",
      "3": "Лампа флуоресцентная",
      "4": "Лампа с высоким давлением",
      "5": "Лампа с низким давлением",
      "255": "Другой источник"
    },
    "fallback": "Неизвестный источник света"
  },
  "EXIF.ColorSpace": {
    "entries": {
      "1": "sRGB",
      "2": "Adobe RGB",
      "3": "Uncalibrated"
    },
    "fallback": "Неизвестное цветовое пространство"
  },
  "EXIF.SceneType": {
    "entries": {
      "0": "Неизвестный тип",
      "1": "Сцена с обычным светом",
      "2": "Сцена с высоким контрастом",
      "3": "Сцена с низким контрастом",
      "4": "Сцена с движением"
    },
    "fallback": "Неизвестный тип съёмки"
  }
};

export function photoExif(raw: string): { label: string; value: string }[] {
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return []; }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
  const fields = data as Record<string, unknown>;
  if (fields.type === 'none') return [];
  return Object.entries(fields).flatMap(([key, value]) => {
    if (!Object.hasOwn(labels, key)) return [];
    const text = Array.isArray(value) ? value.map(scalar).join(', ') : scalar(value);
    const description = Object.hasOwn(descriptions, key) ? descriptions[key] : undefined;
    const translated = description && Object.hasOwn(description.entries, text) ? description.entries[text] : description?.fallback;
    return [{ label: labels[key], value: translated ?? text }];
  });
}

function scalar(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value === true ? '1' : '';
}
