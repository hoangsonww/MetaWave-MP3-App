import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function exportAlbumZip(
  tracks: { title: string; file_url: string }[],
  albumTitle: string,
) {
  const zip = new JSZip();
  const folder = zip.folder(albumTitle) as JSZip;
  await Promise.all(
    tracks.map(async (t) => {
      const blob = await fetch(t.file_url).then((r) => r.blob());
      folder.file(`${t.title}.mp3`, blob);
    }),
  );
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${albumTitle}.zip`);
}
