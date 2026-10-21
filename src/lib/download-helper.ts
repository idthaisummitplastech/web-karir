/**
 * Universal safe file download helper for PT Indonesia Thai Summit Plastech (Web Karir & ATS).
 * 
 * Key Features:
 * 1. Intelligent MIME & Magic-Byte Extension Correction:
 *    Prevents damaged files by ensuring the downloaded file extension matches its actual content
 *    (e.g., if a candidate uploaded a JPG photo named as CV, it downloads as .jpg instead of corrupted .pdf).
 * 2. High-performance Blob Conversion:
 *    Uses native browser fetch() for data URLs which decodes base64 in C++ without JS memory limits.
 * 3. Direct File Saving:
 *    Triggers browser download manager directly without popup-blocker issues or opening blank tabs.
 */

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'text/csv': 'csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'text/plain': 'txt',
};

function detectExtFromMagicBytes(bytes: Uint8Array): string | null {
  if (bytes.length < 4) return null;
  // %PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'pdf';
  }
  // JPEG (FF D8 FF)
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'jpg';
  }
  // PNG (89 50 4E 47)
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'png';
  }
  // GIF (47 49 46 38)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return 'gif';
  }
  // ZIP / XLSX / DOCX (PK\x03\x04)
  if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return 'zip'; // caller will preserve .xlsx or .docx if already requested
  }
  return null;
}

export function sanitizeAndCorrectFilename(filename: string, mime?: string, magicBytes?: Uint8Array): string {
  let cleanName = (filename || 'download')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .trim()
    .replace(/\s+/g, '_');

  const detectedFromMagic = magicBytes ? detectExtFromMagicBytes(magicBytes) : null;
  const detectedFromMime = mime ? MIME_TO_EXT[mime.toLowerCase().split(';')[0].trim()] : null;

  let expectedExt = (detectedFromMagic && detectedFromMagic !== 'zip') ? detectedFromMagic : detectedFromMime;

  // If magic bytes indicated a ZIP-based Office format and filename has xlsx or docx, preserve it
  if (detectedFromMagic === 'zip') {
    if (cleanName.toLowerCase().endsWith('.xlsx')) expectedExt = 'xlsx';
    else if (cleanName.toLowerCase().endsWith('.docx')) expectedExt = 'docx';
    else if (!expectedExt) expectedExt = 'xlsx';
  }

  if (expectedExt) {
    const dotIndex = cleanName.lastIndexOf('.');
    if (dotIndex !== -1) {
      const currentExt = cleanName.slice(dotIndex + 1).toLowerCase();
      // If current extension contradicts actual file type, fix it!
      const isImageContradiction = (currentExt === 'pdf' && ['jpg', 'png', 'webp', 'gif'].includes(expectedExt));
      const isPdfContradiction = (['jpg', 'jpeg', 'png', 'webp'].includes(currentExt) && expectedExt === 'pdf');
      const isExcelContradiction = (currentExt === 'csv' && expectedExt === 'xlsx');

      if (isImageContradiction || isPdfContradiction || isExcelContradiction || currentExt !== expectedExt) {
        cleanName = `${cleanName.slice(0, dotIndex)}.${expectedExt}`;
      }
    } else {
      cleanName = `${cleanName}.${expectedExt}`;
    }
  }

  return cleanName;
}

export async function downloadFile(urlOrData: string, filename: string): Promise<boolean> {
  if (!urlOrData || typeof window === 'undefined') return false;

  try {
    // 1. Data URL
    if (urlOrData.startsWith('data:')) {
      const parts = urlOrData.split(',');
      if (parts.length >= 2) {
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

        let blob: Blob;
        try {
          // Native browser fetch on data URL is fast and handles all edge cases in C++
          const res = await fetch(urlOrData);
          blob = await res.blob();
        } catch {
          // Fallback to manual decoding
          let rawData = parts[1].trim().replace(/\s+/g, '');
          if (rawData.includes('%')) {
            try { rawData = decodeURIComponent(rawData); } catch {}
          }
          const bstr = atob(rawData);
          const u8arr = new Uint8Array(bstr.length);
          for (let i = 0; i < bstr.length; i++) {
            u8arr[i] = bstr.charCodeAt(i);
          }
          blob = new Blob([u8arr], { type: mime });
        }

        // Extract first 16 bytes for magic bytes inspection
        const arrayBuffer = await blob.slice(0, 16).arrayBuffer();
        const magicBytes = new Uint8Array(arrayBuffer);
        const finalFilename = sanitizeAndCorrectFilename(filename, mime, magicBytes);

        const objectUrl = URL.createObjectURL(blob);
        triggerAnchor(objectUrl, finalFilename);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 20000);
        return true;
      }
    }

    // 2. Blob URL
    if (urlOrData.startsWith('blob:')) {
      const finalFilename = sanitizeAndCorrectFilename(filename);
      triggerAnchor(urlOrData, finalFilename);
      return true;
    }

    // 3. HTTP / HTTPS / Relative URL
    try {
      const response = await fetch(urlOrData, { mode: 'cors' });
      if (response.ok) {
        const mime = response.headers.get('content-type') || '';
        const blob = await response.blob();
        const arrayBuffer = await blob.slice(0, 16).arrayBuffer();
        const magicBytes = new Uint8Array(arrayBuffer);
        const finalFilename = sanitizeAndCorrectFilename(filename, mime, magicBytes);

        const objectUrl = URL.createObjectURL(blob);
        triggerAnchor(objectUrl, finalFilename);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 20000);
        return true;
      }
    } catch {
      // If direct fetch is blocked by CORS, proceed to direct link fallback
    }

    // Fallback: direct anchor trigger
    const finalFilename = sanitizeAndCorrectFilename(filename);
    triggerAnchor(urlOrData, finalFilename);
    return true;
  } catch (err) {
    console.error('downloadFile execution error:', err);
    triggerAnchor(urlOrData, sanitizeAndCorrectFilename(filename));
    return false;
  }
}

function triggerAnchor(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
