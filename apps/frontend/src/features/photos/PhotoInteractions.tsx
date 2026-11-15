'use client';

import { useEffect } from 'react';
import { usePageVersion } from '../../components/ClientNavigation';
import { bindPhotoActions } from './PhotoActions';
import { bindCommentEmoji } from './CommentEmoji';

export function PhotoInteractions() {
  const version = usePageVersion();
  useEffect(() => {
    const events = new AbortController();
    bindPhotoActions(events.signal);
    bindCommentEmoji(events.signal);
    return () => events.abort();
  }, [version]);
  return null;
}
