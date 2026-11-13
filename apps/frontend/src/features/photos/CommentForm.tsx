const pickerStyles = `
.emoji-picker {
    display: none;
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-height: 400px;
    overflow-y: auto;
    padding: 10px;
    z-index: 1000;
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
}

.emoji-picker.active {
    display: grid;
}

.emoji-option {
    width: 32px;
    height: 32px;
    cursor: pointer;
    transition: transform 0.1s;
    object-fit: contain;
}

.emoji-option:hover {
    transform: scale(1.2);
}


.editor-emoji {
    width: 35px;
    vertical-align: middle;
    margin: 0 2px;
}
`;

export function CommentForm({ photoId, signedIn, allowed }: { photoId: number; signedIn: boolean; allowed: boolean }) {
  return <div style={{ padding: '0 11px 11px' }}>
    {!signedIn ? 'Комментарии могут оставлять только зарегистрированные пользователи.'
      : !allowed ? 'Комментарии могут оставлять только пользователи с подтверждённой почтой.'
      : <form action="/api/photo/comment" method="post" id="f1" encType="multipart/form-data">
        <input type="hidden" name="id" value={photoId} />
        <input type="hidden" name="wtext" id="hiddenContent" />
        <div contentEditable id="wtext" role="textbox" aria-label="Комментарий" aria-multiline="true" /><br />
        <input type="file" name="filebody" id="comment-file" accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/x-msvideo,video/3gpp,video/x-matroska,.avi,.3gp,.mkv" hidden />
        <div id="fileList" className="mt-3"></div>
        <p id="statusSend" role="status" hidden />
        <div className="cmt-submit">
          <input type="submit" value="Добавить комментарий" id="sbmt" />
          <button type="button" id="attachFile" aria-label="Прикрепить файл"><i className="bx bx-paperclip bx-rotate-90"></i></button>
          <button style={{ display: 'inline' }} type="button" id="showPicker" aria-label="Эмодзи" aria-expanded="false" aria-controls="picker">
            <i className="bx bx-smile"></i>
          </button>
        </div>
        <div id="picker" className="emoji-picker"></div>
        <style>{pickerStyles}</style>
      </form>}
  </div>;
}
