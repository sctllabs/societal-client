export function isValidUrl(_url: string) {
  try {
    const url = new URL(_url);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}
