import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    const { task_id, user } = req.body;

    if (!task_id || !user) {
      return res.status(400).json({
        code: 'invalid_param',
        message: 'Missing required parameters: task_id and user',
        status: 400,
      });
    }

    const response = await fetch(
      `${apiUrl}/workflows/tasks/${task_id}/stop`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        code: errorData.code || 'stop_workflow_error',
        message: errorData.message || 'Failed to stop workflow',
        status: response.status,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Stop workflow error:', error);
    return res.status(500).json({
      code: 'internal_server_error',
      message: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    });
  }
}
