export async function saveRemoteFile(url: string, filename: string) {
  const response = await fetch(url, url.includes("pstatic.net") ? { referrerPolicy: "no-referrer" } : undefined);
  if (!response.ok) throw new Error(String(response.status));
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
