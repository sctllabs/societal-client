import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useDropzone, Accept } from 'react-dropzone';
import clsx from 'clsx';

import { Icon } from 'components/ui-kit/Icon';
import { Button } from 'components/ui-kit/Button';

import styles from './DropFile.module.scss';

type DropFileVariant = 'rectangle' | 'circle';

type DropFileProps = {
  variant: DropFileVariant;
  accept: Accept | undefined;
  onFileChange: (file: File | undefined) => void;
};

const maxFiles = 1;

export function DropFile({
  accept,
  variant = 'rectangle',
  onFileChange
}: DropFileProps) {
  const [file, setFile] = useState<(File & { preview: string }) | undefined>(
    undefined
  );
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const _file = acceptedFiles[0];
    setFile(
      Object.assign(_file, {
        preview: URL.createObjectURL(_file)
      })
    );
  }, []);

  useEffect(() => {
    onFileChange(file);
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => file && URL.revokeObjectURL(file.preview);
  }, [file, onFileChange]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isDragAccept
  } = useDropzone({
    onDrop,
    maxFiles,
    accept
  });

  const handleClick = () => {
    if (file) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(undefined);
  };

  return file ? (
    <div className={styles.thumb}>
      <Image
        className={styles[variant]}
        alt={file.name}
        src={file.preview}
        width={114}
        height={114}
        onLoad={() => {
          URL.revokeObjectURL(file.preview);
        }}
      />
      <Button variant="icon" className={styles.button} onClick={handleClick}>
        <Icon name="close" size="xs" />
      </Button>
    </div>
  ) : (
    <div
      className={clsx(styles.root, styles[variant], {
        [styles['root-accept']]: isDragAccept,
        [styles['root-reject']]: isDragReject
      })}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {!isDragActive && !isDragReject && <Icon size="xl" name="load" />}
      {isDragReject && <Icon className={styles.reject} size="xl" name="load" />}
      {isDragAccept && <Icon className={styles.accept} size="xl" name="load" />}
    </div>
  );
}
