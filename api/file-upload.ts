import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DIFY_API_KEY;
  const apiUrl = process.env.DIFY_API_URL;

  if (!apiKey || !apiUrl) {
    return res.status(500).json({
      code: 'server_config_error',
      message: 'Server configuration error: Missing API credentials',
      status: 500,
    });
  }

  try {
    // Parse multipart form data
    const formData = new FormData();

    // Get file and user from request
    // Note: You may need to use a library like 'formidable' or 'busboy' for proper multipart parsing
    // This is a simplified version
    const contentType = req.headers['content-type'] || '';

    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({
        code: 'invalid_content_type',
        message: 'Content-Type must be multipart/form-data',
        status: 400,
      });
    }

    // Forward the request to Dify API
    const response = await fetch(`${apiUrl}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Don't set Content-Type here, let fetch handle it for FormData
      },
      body: req as any, // Forward the original request body
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific file upload errors
      if (response.status === 413) {
        return res.status(413).json({
          code: 'file_too_large',
          message: 'File size exceeds the maximum allowed limit',
          status: 413,
        });
      }

      if (response.status === 415) {
        return res.status(415).json({
          code: 'unsupported_file_type',
          message: 'Unsupported file type',
          status: 415,
        });
      }

      return res.status(response.status).json({
        code: errorData.code || 'upload_error',
        message: errorData.message || 'File upload failed',
        status: response.status,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({
      code: 'internal_server_error',
      message: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    });
  }
}
