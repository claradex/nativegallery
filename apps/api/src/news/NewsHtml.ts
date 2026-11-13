import sanitizeHtml from 'sanitize-html';

export function newsHtml(body: string) {
  return sanitizeHtml(body, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt', 'width', 'height', 'title'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
  });
}
