/**
 * Downloads an image by fetching it as a blob and triggering a browser download.
 * This works for cross-origin images where the HTML `download` attribute is ignored.
 */
export async function downloadImageBlob(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    // Cleanup after a short delay to ensure download starts
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    }, 200);
  } catch (error) {
    // Fallback: open in new tab if blob download fails
    console.error("Blob download failed, falling back to new tab:", error);
    window.open(url, "_blank");
  }
}
