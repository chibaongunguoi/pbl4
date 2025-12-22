export function getRawFileHref(cv) {
  if (cv.startsWith('http')) {
    return cv;
  }
  if (cv.startsWith('/files')) {
    return cv;
  }
  const path = '/files' + cv;
  return path;
}