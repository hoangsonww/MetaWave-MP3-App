import type { NextApiRequest, NextApiResponse } from "next";
import JSZip from "jszip";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { urls } = req.body as { urls: { title: string; file_url: string }[] };
  if (!urls) return res.status(400).json({ error: "Missing urls" });
  const zip = new JSZip();
  for (const u of urls) {
    const arr = await fetch(u.file_url).then((r) => r.arrayBuffer());
    zip.file(`${u.title}.mp3`, arr);
  }
  const buf = await zip.generateAsync({ type: "nodebuffer" });
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename=tracks.zip`);
  res.send(buf);
}
