import sanitizeHtml from 'sanitize-html';

export function sitePageHtml(body: string) {
  return sanitizeHtml(body, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'audio', 'video', 's', 'u'],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'width', 'height', 'title'],
      audio: ['src', 'controls', 'preload'],
      video: ['src', 'controls', 'preload', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'], video: ['http', 'https'], audio: ['http', 'https'] },
    allowProtocolRelative: false,
  });
}
