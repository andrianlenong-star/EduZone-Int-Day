import { handleUpload } from '@vercel/blob/client';
import { put } from '@vercel/blob';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  // Hanya izinkan method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return res.status(500).json({
      success: false,
      message: 'BLOB_READ_WRITE_TOKEN belum terdeteksi di Vercel Environment Variables.',
    });
  }

  // Cek apakah request berasal dari @vercel/blob/client (client-side upload token request)
  if (req.body && req.body.type && req.body.type.startsWith('blob.')) {
    try {
      const jsonResponse = await handleUpload({
        body: req.body,
        request: req,
        onBeforeGenerateToken: async (pathname) => {
          return {
            allowedContentTypes: [
              'video/mp4',
              'video/quicktime',
              'video/webm',
              'video/x-matroska',
              'video/ogg',
              'application/octet-stream',
            ],
            maximumSizeInBytes: 500 * 1024 * 1024, // 500MB
            tokenPayload: JSON.stringify({ pathname }),
          };
        },
        onUploadCompleted: async ({ blob }) => {
          console.log('[Vercel Blob Client Upload Completed]:', blob.url);
        },
      });

      return res.status(200).json(jsonResponse);
    } catch (clientErr: any) {
      return res.status(400).json({ success: false, message: clientErr.message });
    }
  }

  try {
    const filename = req.query?.filename || `eduzone_video_${Date.now()}.mp4`;

    // Unggah file stream langsung ke Vercel Blob Storage
    const blob = await put(`eduzone/${filename}`, req, {
      access: 'public',
      token,
    });

    return res.status(200).json({
      success: true,
      videoUrl: blob.url,
      fileName: filename,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
    });
  } catch (error: any) {
    console.error('[Vercel Blob Serverless Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengunggah video ke Vercel Blob',
    });
  }
}
