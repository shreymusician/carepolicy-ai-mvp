export function isValidPdfBuffer(buffer: Buffer | undefined): boolean {
  if (!buffer || !(buffer instanceof Buffer)) {
    return false;
  }

  // PDF files start with %PDF magic number
  if (buffer.length < 4) {
    return false;
  }

  return buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46; // F
}

export function getFilenameFromPath(filepath: string): string {
  return filepath.split(/[\\/]/).pop() || 'unknown';
}

export function isValidConfidenceLevel(value: unknown): value is 'high' | 'medium' | 'low' {
  return value === 'high' || value === 'medium' || value === 'low';
}

export function sanitizeFilename(filename: string): string {
  // Remove any path separators and special characters
  return filename
    .replace(/[/\\]/g, '_')
    .replace(/[<>:"|?*]/g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .slice(0, 255);
}
