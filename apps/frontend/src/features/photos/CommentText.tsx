import { Fragment } from 'react';

export function CommentText({ body }: { body: string }) {
  return body.split(/(\[\d+\/[\w-]+\])/g).map((text, index) => {
    const code = /^\[(\d+\/[\w-]+)\]$/.exec(text)?.[1];
    return code ? <img key={index} src={'/static/img/smileys/' + code + '.gif'} className="emoji"
      alt={text} data-code={text} loading="lazy" /> : <Fragment key={index}>{text}</Fragment>;
  });
}
