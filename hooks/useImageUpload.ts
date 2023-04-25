import { useCallback } from 'react';

export function useImageUpload(): (file: File) => Promise<string> {
  return useCallback(
    (file: File) =>
      fetch('/api/upload-to-s3', {
        method: 'POST',
        headers: {
          'content-type': file.type
        },
        redirect: 'follow',
        body: file
      }).then((res) => res.text()),
    []
  );
}
