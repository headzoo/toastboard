import { useEffect } from 'react';
import {
  DEFAULT_PAGE_METADATA,
  setPageMetadata,
  type PageMetadata,
} from '../lib/pageMetadata';

export function usePageMetadata(metadata: PageMetadata) {
  const { title, description } = metadata;

  useEffect(() => {
    setPageMetadata({ title, description });

    return () => {
      setPageMetadata(DEFAULT_PAGE_METADATA);
    };
  }, [title, description]);
}
