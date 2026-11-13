'use client';

import { useEffect } from 'react';
import { bindPhotoActions } from './PhotoActions';
import { bindCommentEmoji } from './CommentEmoji';

export function PhotoInteractions() {
  useEffect(() => {
    const events = new AbortController();
    bindPhotoActions(events.signal);
    bindCommentEmoji(events.signal);
    return () => events.abort();
  }, []);
  return null;
}
