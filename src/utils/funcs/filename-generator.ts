export function generateFileName(originalFileName: string): string {
  const filePrefix = `${Date.now()}${Math.round(Math.random() * 1_000_000)}`;
  const fileExtension = originalFileName.split(".").at(-1);
  const fileName = `${filePrefix}.${fileExtension}`;
  return fileName;
}
