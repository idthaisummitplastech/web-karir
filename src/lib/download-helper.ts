/**
 * Universal safe file download helper for PT Indonesia Thai Summit Plastech (Web Karir & ATS).
 * 
 * Solves:
 * 1. Base64 data URLs: Browsers block direct `a.href="data:..."` for large files or trigger "download" with no extension / 0 byte files. Converts to Blob Object URL.
 * 2. Cross-origin URLs: HTML5 `download` attribute is ignored by Chrome/Edge for cross-origin URLs. Fetches as Blob to force exact filename.
 * 3. Fallback: Opens in new tab if CORS prevents blob fetch.
 */
export async function downloadFile(urlOrData: string, filename: string): Promise<boolean> {
  if (!urlOrData || typeof window === 'undefined') return false;

  try {
    // 1. Base64 data URL
    if (urlOrData.startsWith('data:')) {
      const parts = urlOrData.split(',');
      if (parts.length >= 2) {
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const objectUrl = URL.createObjectURL(blob);
        triggerAnchor(objectUrl, filename);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
        return true;
      }
    }

    // 2. Blob URL
    if (urlOrData.startsWith('blob:')) {
      triggerAnchor(urlOrData, filename);
      return true;
    }

    // 3. HTTP/HTTPS or relative URL
    try {
      const response = await fetch(urlOrData, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        triggerAnchor(objectUrl, filename);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
        return true;
      }
    } catch {
      // Fetch failed or blocked by CORS, proceed to fallback
    }

    // Fallback: direct anchor trigger
    triggerAnchor(urlOrData, filename);
    return true;
  } catch (err) {
    console.error('downloadFile error:', err);
    window.open(urlOrData, '_blank');
    return false;
  }
}

function triggerAnchor(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
