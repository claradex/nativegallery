export function UploadLocation() {
  return <>
    <tbody><tr><td colSpan={2} style={{ height: 10 }}></td></tr></tbody>
    <tbody className="p20">
      <tr><td colSpan={2} id="step3" className="narrow" style={{ fontSize: 20, padding: '10px 15px 7px' }}>Шаг 3. <b>Введите подпись для медиафайла:</b></td></tr>
      <tr><td className="lcol">Место съёмки:</td><td style={{ paddingRight: 15 }}>
        <input name="place" id="place" maxLength={255} style={{ width: 506 }} />
      </td></tr>
      <tr><td className="lcol">Описание:<div className="sm" style={{ color: '#999', margin: '3px 5px 0 0', whiteSpace: 'normal' }}>(если требуются)</div></td>
        <td style={{ paddingRight: 15 }}><textarea name="descr" style={{ width: 506, height: 100, marginBottom: 7 }} /></td>
      </tr>
      <tr><td colSpan={2} style={{ height: 7 }}></td></tr>
    </tbody>
    <tbody><tr><td colSpan={2} style={{ height: 10 }}></td></tr><tr><td colSpan={2} style={{ height: 10 }}></td></tr></tbody>
    <tbody className="p20">
      <tr><td colSpan={2} id="step4" className="narrow" style={{ fontSize: 20, padding: '10px 15px 0' }}>Шаг 4. <b>Отметьте точку, с которой было сделано медиа на карте:</b></td></tr>
      <tr><td></td><td style={{ padding: '7px 2px' }}>
        <input type="checkbox" name="nomap" id="nomap" value="1" /> <label htmlFor="nomap">Не указывать координаты</label>
      </td></tr>
      <tr className="upl-map"><td className="lcol">Точка съёмки:</td><td>
        <div id="map_frame" className="s11 p20" style={{ display: 'inline-block', padding: 3 }}>
          <div id="map_canvas" style={{ width: 600, height: 300, overflow: 'hidden' }}></div>
          <div><label htmlFor="mapSelector">Выберите карту:</label> <select id="mapSelector">
            <option value="osm">OpenStreetMap</option><option value="hot">Humanitarian OpenStreetMap Team</option>
            <option value="opnv">OPNVKarte</option><option value="2gis">2ГИС (только Россия)</option><option value="google">Google Maps</option>
          </select>
          <div><label htmlFor="railwayCheckbox">Железная дорога от OpenRailwayMap:</label> <input type="checkbox" id="railwayCheckbox" /></div></div>
        </div>
      </td></tr>
    </tbody>
  </>;
}
