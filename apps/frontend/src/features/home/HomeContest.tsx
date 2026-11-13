interface Contest {
  status: number;
  theme: string;
  closedate: number;
  closepretendsdate: number;
}

export function HomeContest({ contest }: { contest: Contest }) {
  const voting = contest.status === 2;
  const linkStyle = { backgroundColor: '#37009D', color: '#fff' };
  const title = process.env.SITE_TITLE ?? 'NativeGallery';
  return <div id="contestNotify" style={{ float: 'left', border: 'solid 1px #171022', padding: '6px 10px 7px',
    marginBottom: 13, backgroundColor: '#E5D6FF' }}>
    <h4>Фотоконкурс!</h4>
    <span id="timett">{voting ? 'Закончится через:' : 'Начнётся через:'}</span> <b id="countdown"></b><br />
    Тематика: <b>{contest.theme}</b><br />
    {voting
      ? <b style={{ color: '#412378' }}>Голосуйте за лучшие фотографии, которые должны стать победителями сегодняшнего конкурса!</b>
      : <b id="textContest" style={{ color: '#412378' }}>Лучшие фотографии по мнению сообщества {title} будут отмечены</b>}
    <br /><br />
    <div id="contestBtns">{voting
      ? <a href="/voting" style={linkStyle} type="button">Голосовать!</a>
      : <><a href="/voting/sendpretend" style={linkStyle} type="button">Участвовать!</a>{' '}
        <a href="/voting/waiting" style={linkStyle} type="button">Голосовать за претендентов</a></>}
    </div>
    <script src={voting ? "/frontend-scripts/ContestVoting.js" : "/frontend-scripts/ContestAccepting.js"}
      data-contest-time={voting ? contest.closedate : contest.closepretendsdate} defer />
  </div>;
}
