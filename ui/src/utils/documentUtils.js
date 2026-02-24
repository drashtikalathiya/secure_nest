export function formatSize(sizeMb) {
  if (sizeMb >= 1024) return `${(sizeMb / 1024).toFixed(2)} GB`;
  return `${(sizeMb || 0).toFixed(1)} MB`;
}

export function getDocumentLabel(file) {
  return file?.title || file?.name || "Untitled Document";
}

export function formatUploadedAt(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function getFolderTotals(files = []) {
  const totalSize = files.reduce((sum, file) => sum + (file.sizeMb || 0), 0);
  return {
    fileCount: files.length,
    totalSize,
  };
}

export function getPreviewType(fileType = "") {
  const normalized = fileType.toUpperCase();
  if (normalized === "IMAGE") return "image";
  if (normalized === "PDF") return "pdf";
  if (normalized === "DOC" || normalized === "DOCX") return "doc";
  return "file";
}

export async function downloadFile(url, filename) {
  if (!url) return false;
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) {
      throw new Error("Download failed.");
    }
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename || "document";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
    return true;
  } catch (error) {
    console.error(error);
    window.open(url, "_blank", "noopener,noreferrer");
    return false;
  }
}
