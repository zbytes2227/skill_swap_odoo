import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const filename = searchParams.get('filename');

  try {
    const blob = await put(filename, req, {
      access: 'public',
      allowOverwrite: true,
    });

    res.status(200).json(blob);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
}
