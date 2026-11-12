export function CommentForm({ photoId, signedIn, allowed }: { photoId: number; signedIn: boolean; allowed: boolean }) {
  return <div style={{ padding: '0 11px 11px' }}>
    {!signedIn ? 'Комментарии могут оставлять только зарегистрированные пользователи.'
      : !allowed ? 'Комментарии могут оставлять только пользователи с подтверждённой почтой.'
      : <form action="/api/photo/comment" method="post" id="f1" encType="multipart/form-data">
        <input type="hidden" name="id" value={photoId} />
        <input type="hidden" name="wtext" id="hiddenContent" />
        <div contentEditable id="wtext" role="textbox" aria-label="Комментарий" aria-multiline="true" /><br />
        <p id="statusSend" role="status" hidden />
        <div className="cmt-submit"><input type="submit" value="Добавить комментарий" id="sbmt" /></div>
      </form>}
  </div>;
}
