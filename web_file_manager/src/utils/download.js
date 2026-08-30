import api from '../api/axios';

/**
 * Saving a file the browser cannot simply navigate to.
 *
 * The API authenticates with a bearer header, and a link or a window.open call
 * cannot carry one, so the body is fetched through the same axios instance as
 * everything else and handed to the browser as a blob.
 */
export async function downloadFile(file) {
  const response = await api.get(`/download_file/${file.id}`, { responseType: 'blob' });
  saveBlob(response.data, file.name);
}

/**
 * Files are saved one at a time. Browsers throttle bursts of downloads, and a
 * single failure should not hide the ones that did work.
 */
export async function downloadFiles(files) {
  for (const file of files) {
    await downloadFile(file);
  }
}

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoked on the next tick: releasing the URL in the same one can cancel the
  // download the click just started.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * With `responseType: 'blob'` an error body arrives as a blob too, so the JSON
 * the API sent has to be read back out of it before it can be shown.
 */
export async function readDownloadError(error) {
  const fallback = 'The file could not be downloaded.';
  const data = error.response?.data;

  if (!(data instanceof Blob)) return data?.error ?? fallback;

  try {
    return JSON.parse(await data.text())?.error ?? fallback;
  } catch {
    return fallback;
  }
}
