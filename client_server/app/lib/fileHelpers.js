export function getRawFileHref(cv) {
  if (cv.startsWith('http')) {
    return cv;
  }
  const path = '/files' + cv;
  return path;
}