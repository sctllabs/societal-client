type MetaData = {
  title: string;
  description: string;
};

export function parseMeta(meta?: string): MetaData | null {
  return meta ? JSON.parse(meta) : null;
}
