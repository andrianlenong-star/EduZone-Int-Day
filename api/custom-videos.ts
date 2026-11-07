import { list } from '@vercel/blob';

export default async function handler(req: any, res: any) {
  // Hanya izinkan method GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const countryParam = (req.query?.country as string || '').toLowerCase().trim();
  const cleanCountry = countryParam.replace(/[^a-z0-9]/g, '_');

  if (!token) {
    return res.status(200).json({
      success: true,
      country: countryParam,
      videos: {},
      message: 'Vercel Blob token belum dikonfigurasi.',
    });
  }

  try {
    const { blobs } = await list({
      token,
      prefix: 'eduzone/',
      limit: 100,
    });

    // Urutkan dari yang terbaru (uploadedAt descending)
    blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    const videos: Record<string, any> = {};

    for (const blob of blobs) {
      // Pola nama: eduzone/peru_scene_1_173000_video.mp4 ATAU eduzone/scene_1_...
      const rawName = blob.pathname.replace(/^eduzone\//, '');
      const match = rawName.match(/^(?:([a-z0-9_]+)_)?scene_(\d+)/i);

      if (match) {
        const fileCountry = match[1] || '';
        const sceneNum = parseInt(match[2], 10);

        // Filter negara jika ada parameter negara
        if (!cleanCountry || !fileCountry || fileCountry === cleanCountry) {
          if (!videos[sceneNum]) {
            videos[sceneNum] = {
              videoUrl: blob.url,
              fileName: rawName.split('/').pop() || `Scene_${sceneNum}.mp4`,
              fileSize: blob.size ? `${(blob.size / (1024 * 1024)).toFixed(1)} MB` : '',
              uploadedAt: blob.uploadedAt,
              downloadUrl: blob.downloadUrl,
            };
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      country: countryParam,
      videos,
    });
  } catch (error: any) {
    console.error('[Vercel Blob List Error]:', error);
    return res.status(200).json({
      success: true,
      country: countryParam,
      videos: {},
      error: error.message,
    });
  }
}
