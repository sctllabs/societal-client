type MetaData = {
  title: string;
  description: string;
};

export function parseMeta(meta?: string): MetaData | null {
  if (!meta) {
    return null;
  }

  try {
    return JSON.parse(meta);
  } catch (e) {
    return null;
  }
}
