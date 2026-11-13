function GeneralRules() {
  return <>
    <h1>Правила сайта</h1>
    <div className="p20" style={{ padding: 20 }}><b>Основные правила сайта.</b></div>
  </>;
}

function PhotoRules() {
  return <>
    <h1>Правила подписи фотографий</h1>
    <div className="p20" style={{ padding: 20 }}><b>Правила подписи фотографий</b></div>
  </>;
}

function VideoRules() {
  return <>
    <h1>Правила видеотеки</h1>
    <div className="p20" style={{ padding: 20 }}><b>Правила видеокаталога</b></div>
  </>;
}

function PublicationRules() {
  return <>
    <h1>Правила отбора фотографий</h1>
    <div className="p20" style={{ padding: 20 }}><b>Правила публикации фотографий</b></div>
  </>;
}

const pages = new Map([
  ['rules', GeneralRules],
  ['rules/photo', PhotoRules],
  ['rules/video', VideoRules],
  ['rules/pub', PublicationRules],
]);

export function rulesContent(path: string) {
  return pages.get(path);
}
