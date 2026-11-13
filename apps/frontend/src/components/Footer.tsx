export function Footer({ databaseVersion }: { databaseVersion: string }) {
  const revision = process.env.SITE_REVISION ?? '4ebe9c8';
  return <td className="footer">
    <p>Aloha, Hawaii! | Node.js {process.versions.node.split('.')[0]} | MySQL {databaseVersion} | Версия {revision}</p>
    <b><a href="/">Главная</a> &nbsp; &nbsp; <a href="/lk/">Личный кабинет</a> &nbsp; &nbsp; <a href="/rules">Правила</a> &nbsp; &nbsp; <a href="/about">О сервере</a></b><br />
  </td>;
}
