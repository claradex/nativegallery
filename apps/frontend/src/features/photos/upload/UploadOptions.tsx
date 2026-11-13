import { Fragment } from 'react';

const licenses = [
  "Не указана",
  "Copyright ©",
  "Атрибуция (BY)",
  "Атрибуция — С сохранением условий (BY-SA)",
  "Атрибуция — Некоммерческое использование (BY-NC)",
  "Атрибуция — Некоммерческое использование — С сохранением условий (BY-NC-SA)",
  "Атрибуция — Без производных работ (BY-ND)",
  "Атрибуция — Некоммерческое использование — Без производных работ (BY-NC-ND)",
  "Передача в общественное достояние (Zero)",
  "Нет авторских прав (Mark)"
];
const options = [
  [
    "disablecomments",
    "Отключить комментарии",
    [
      "Комментирование Вашего медиа будет ограничено, однако Вы сможете добавлять к нему свои аннотации вне зависимости от настройки."
    ]
  ],
  [
    "disablerating",
    "Отключить оценку фотографии",
    [
      "Никто не сможет оценивать Ваше медиа, однако оно не сможет продвинуться в конкурс."
    ]
  ],
  [
    "disableshowtop",
    "Не продвигать в общем топе",
    [
      "Медиа не будет отображаться в следующих топах: ",
      "Самые популярные за 24 часа",
      "30 самых просматриваемых фото за 24 часа",
      "Случайные фотографии",
      "Лента фотография"
    ]
  ],
  [
    "disableexif",
    "Скрыть EXIF",
    [
      "EXIF (параметры съёмки) фотографии будет скрыт на странице."
    ]
  ],
  [
    "disablesubsnotify",
    "Не уведомлять подписчиков о новом медиа",
    [
      "Ваши подписчики не получат уведомление о публикации Медиа, но они всегда смогут его увидеть из общих топов (если таковая настройка не была отключена"
    ]
  ]
] as const;

export function UploadOptions() {
  return <tbody className="p20">
    <tr><td colSpan={2} className="narrow" style={{ fontSize: 20, padding: '10px 15px 5px' }}>Шаг 5. <b>Выберите опции загрузки:</b></td></tr>
    <tr><td className="lcol">Лицензия:</td><td style={{ paddingBottom: 7 }}>
      <select name="license" defaultValue="1">{licenses.map((label, index) => <option key={label} value={index}>{label}</option>)}</select>
      &nbsp; &nbsp;<a href="https://creativecommons.org/licenses/?lang=ru" target="_blank" className="und sm">Информация о лицензиях</a>
    </td></tr>
    {options.map(([key, label, description]) => <Fragment key={key}>
      <tr><td className="lcol"></td><td style={{ padding: '7px 2px' }}><input type="checkbox" name={key} id={key} value="1" /> <label htmlFor={key}>{label}</label></td></tr>
      <tr><td className="lcol"></td><td className="sm" style={{ color: '#888' }}>{description.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>)}</td></tr>
    </Fragment>)}
    <tr><td className="lcol"></td><td className="sm" style={{ color: '#888' }}><b>Вы можете всегда в любое время изменить эти настройки.</b></td></tr>
    <tr><td></td><td style={{ padding: '20px 2px 12px' }}>
      <button id="submitbtn" className="progress-button" data-loading="Идёт загрузка..." data-finished="Обработка..." type="submit">Опубликовать</button> &nbsp; &nbsp;&nbsp;
      <span id="statusbox" className="narrow" style={{ fontSize: 20, fontWeight: 'bold', position: 'relative', top: -12 }} aria-live="polite"></span>
      <div id="errorsbox" style={{ display: 'none', color: 'red', marginTop: 15, fontWeight: 'bold' }} role="alert"></div>
      <div style={{ marginTop: 20, maxWidth: '50%', backgroundColor: '#f1f1f1' }} id="prgb" className="w3-light-grey"></div>
    </td></tr>
  </tbody>;
}
