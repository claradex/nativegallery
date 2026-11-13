const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const twoDigits = (value: number) => String(value).padStart(2, '0');

export function UploadMedia({ galleries }: { galleries: { id: number; title: string }[] }) {
  return <tbody className="p20">
    <tr><td colSpan={2} id="step1" className="narrow" style={{ fontSize: 20, padding: '10px 15px 7px' }}>
      Шаг 1. <b>Выберите фотографию или видео для загрузки и укажите дату съёмки:</b>
    </td></tr>
    <tr><td></td><td style={{ padding: '2px 15px 5px 2px' }}>
      <label className="button">Выбрать файл... <input type="file" name="image" id="image" accept="image/*, video/*" /></label>
      &nbsp; <span id="filename"></span>
      <div style={{ padding: '5px 0 10px' }} className="sm">Принимаемые форматы:<br />
        JPG, JPEG, PNG, GIF, WEBP, MP4, AVI, 3GP, MKV<br />
        Для наибольшей совместимости, ваше видео будет обработано в формат MP4 в кодеке H264
      </div>
    </td></tr>
    <tr id="tableFaces" style={{ display: 'none' }}><td></td><td style={{ padding: '2px 15px 5px 2px' }}><div id="faceNotify"></div></td></tr>
    <tr id="tableFaces2" style={{ display: 'none' }}><td></td><td style={{ padding: '2px 15px 5px 2px' }}><br /><div id="facesCanvas"></div><br /><br /><div id="inputFields"></div></td></tr>
    <tr><td className="lcol">Дата съёмки:</td><td style={{ paddingBottom: 12 }}>
      <span style={{ display: 'inline-block', marginBottom: 3 }}><select name="day" id="day" style={{ width: 48 }}>
        <option value="0">??</option>{Array.from({ length: 31 }, (_, index) => <option key={index} value={index + 1}>{twoDigits(index + 1)}</option>)}
      </select><select name="month" id="month" style={{ width: 160, margin: '0 -1px' }}>
        <option value="0">?? — Неизвестно</option>{months.map((label, index) => <option key={label} value={index + 1}>{twoDigits(index + 1)} — {label}</option>)}
      </select><select name="year" id="year" style={{ width: 65 }}>
        <option value="0">????</option>{Array.from({ length: 175 }, (_, index) => <option key={index} value={2024 - index}>{2024 - index}</option>)}
      </select>&nbsp; </span>&nbsp; <span id="dateLoaded" style={{ position: 'relative', top: 2, padding: '2px 6px', display: 'none' }} className="nw label-green">Установлена дата из EXIF</span><span id="dateAbsent" style={{ position: 'relative', top: 2, padding: '2px 6px', display: 'none' }} className="nw label-orange">Укажите дату съёмки (нет в EXIF)</span>&nbsp; <span className="sm nw">
        <a href="#" className="dot" data-date="today">Сегодня</a> · <a href="#" className="dot" data-date="yesterday">Вчера</a> · <a href="#" className="dot" data-date="unknown">Неизвестно</a>
      </span>
    </td></tr>
    <tr className="lnk-gallery"><td className="lcol">Галерея:</td><td style={{ paddingRight: 15 }}>
      <select name="gallery" id="search_gid"><option value="0">Общая</option>
        {galleries.map(gallery => <option key={gallery.id} value={gallery.id}>{gallery.title}</option>)}
      </select>
    </td></tr>
    <tr className="lnk-gallery" style={{ display: 'none' }}><td></td><td style={{ paddingRight: 15 }}><input type="button" id="addGalleryBtn" value="Добавить" /></td></tr>
  </tbody>;
}
