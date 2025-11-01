# Dify API Integration Guide

## Overview

このプロジェクトでは、Vercel Functionsを使用してDify APIを安全に呼び出しています。
API Keyはサーバーサイドで管理され、クライアントから直接露出することはありません。

## Architecture

```
Client (Browser)
    ↓
Vercel Functions (API Proxy)
    ↓ (API Key is here)
Dify API
```

## API Endpoints

### 1. Workflow Execution
**Endpoint:** `POST /api/workflow-run`

**Request:**
```typescript
{
  inputs: Record<string, any>,
  user: string,              // Required
  response_mode?: 'streaming' | 'blocking',  // Default: 'streaming'
  workflow_id?: string,      // Optional: specific workflow version
  trace_id?: string         // Optional: for logging
}
```

**Response (Blocking):**
```typescript
{
  workflow_run_id: string,
  task_id: string,
  data: {
    id: string,
    workflow_id: string,
    status: 'running' | 'succeeded' | 'failed' | 'stopped',
    outputs: Record<string, any>,
    error: string | null,
    elapsed_time: number,
    total_tokens: number,
    total_steps: number,
    created_at: number,
    finished_at: number
  }
}
```

### 2. File Upload
**Endpoint:** `POST /api/file-upload`

**Request:** `multipart/form-data`
- `file`: File
- `user`: string (Required)

**Response:**
```typescript
{
  id: string,              // Use this as upload_file_id
  name: string,
  size: number,
  extension: string,
  mime_type: string,
  created_by: string,
  created_at: number
}
```

### 3. Stop Workflow
**Endpoint:** `POST /api/workflow-stop`

**Request:**
```typescript
{
  task_id: string,  // Required
  user: string      // Required
}
```

## Usage Examples

### Example 1: Simple Blocking Workflow

```typescript
import { difyClient } from '@/lib/difyClient';

async function runSimpleWorkflow() {
  try {
    const response = await difyClient.runWorkflow({
      inputs: {
        message: "こんにちは"
      },
      user: "user-123"
    });

    console.log('Workflow completed:', response.data.outputs);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example 2: Streaming Workflow

```typescript
import { difyClient } from '@/lib/difyClient';

async function runStreamingWorkflow() {
  let fullText = '';

  await difyClient.runWorkflowStreaming(
    {
      inputs: {
        query: "長い文章を生成してください"
      },
      user: "user-123"
    },
    {
      onWorkflowStarted: (event) => {
        console.log('Workflow started:', event.workflow_run_id);
      },
      onTextChunk: (event) => {
        // Append text chunk to display
        fullText += event.data?.text || '';
        console.log('Current text:', fullText);
      },
      onWorkflowFinished: (event) => {
        console.log('Workflow finished:', event.data);
      },
      onError: (error) => {
        console.error('Error:', error);
      },
      onComplete: () => {
        console.log('Streaming complete');
      }
    }
  );
}
```

### Example 3: File Upload + Workflow

```typescript
import { difyClient } from '@/lib/difyClient';

async function processDocument(file: File) {
  try {
    // 1. Upload file
    const uploadResponse = await difyClient.uploadFile(file, 'user-123');
    console.log('File uploaded:', uploadResponse.id);

    // 2. Run workflow with file
    const response = await difyClient.runWorkflow({
      inputs: {
        documents: [{
          transfer_method: 'local_file',
          upload_file_id: uploadResponse.id,
          type: 'document'
        }]
      },
      user: 'user-123'
    });

    console.log('Document processed:', response.data.outputs);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example 4: React Component with Streaming

```typescript
import { useState } from 'react';
import { difyClient } from '@/lib/difyClient';

export function ChatComponent() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleSend = async (message: string) => {
    setIsLoading(true);
    setText('');

    await difyClient.runWorkflowStreaming(
      {
        inputs: { message },
        user: 'user-123'
      },
      {
        onWorkflowStarted: (event) => {
          setTaskId(event.task_id || null);
        },
        onTextChunk: (event) => {
          setText(prev => prev + (event.data?.text || ''));
        },
        onWorkflowFinished: () => {
          setIsLoading(false);
          setTaskId(null);
        },
        onError: (error) => {
          console.error(error);
          setIsLoading(false);
          setTaskId(null);
        }
      }
    );
  };

  const handleStop = async () => {
    if (taskId) {
      await difyClient.stopWorkflow(taskId, 'user-123');
      setIsLoading(false);
      setTaskId(null);
    }
  };

  return (
    <div>
      <div>{text}</div>
      {isLoading && <button onClick={handleStop}>Stop</button>}
    </div>
  );
}
```

## Environment Variables

### Local Development (.env.local)
```env
# Supabase (Client-side)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Dify API (Server-side ONLY - NO VITE_ prefix)
DIFY_API_KEY=your_dify_api_key
DIFY_API_URL=https://api.dify.ai/v1
```

### Vercel Production

Vercelダッシュボードで以下の環境変数を設定：

1. `DIFY_API_KEY`: Your Dify API Key
2. `DIFY_API_URL`: `https://api.dify.ai/v1`

## Security Notes

✅ **Safe:**
- `DIFY_API_KEY` - サーバーサイドのみ（Vercel Functions内）
- `DIFY_API_URL` - サーバーサイドのみ

❌ **Never do this:**
- `VITE_DIFY_API_KEY` - クライアントに露出される！
- クライアントから直接Dify APIを呼び出す

## Error Handling

```typescript
try {
  const response = await difyClient.runWorkflow({
    inputs: { message: "test" },
    user: "user-123"
  });
} catch (error) {
  if (error instanceof Error) {
    // Parse error message
    if (error.message.includes('quota_exceeded')) {
      console.error('API quota exceeded');
    } else if (error.message.includes('workflow_not_found')) {
      console.error('Workflow not found');
    } else {
      console.error('Unknown error:', error.message);
    }
  }
}
```

## Testing

### Local Development

1. Install dependencies:
```bash
npm install --save-dev @vercel/node
```

2. Start dev server:
```bash
npm run dev
```

3. Vercel Functions will be available at:
- `http://localhost:5173/api/workflow-run`
- `http://localhost:5173/api/file-upload`
- `http://localhost:5173/api/workflow-stop`

### Production Deployment

```bash
vercel deploy
```

Environment variables will be loaded from Vercel dashboard.

## File Structure

```
project-root/
├── api/
│   ├── workflow-run.ts     # Workflow execution endpoint
│   ├── file-upload.ts      # File upload endpoint
│   └── workflow-stop.ts    # Stop workflow endpoint
├── src/
│   ├── lib/
│   │   └── difyClient.ts   # Client library
│   └── types/
│       └── dify.ts         # TypeScript types
├── vercel.json             # Vercel configuration
└── .env.local              # Local environment variables
```

## Troubleshooting

### CORS Errors
Vercel Functionsにはすでにコ CORS設定が含まれています。それでもCORSエラーが発生する場合は、`vercel.json`の設定を確認してください。

### Streaming Not Working
- `response_mode: 'streaming'`が正しく設定されているか確認
- ブラウザがServer-Sent Events (SSE)をサポートしているか確認

### File Upload Errors
- ファイルサイズ制限を確認（413エラー）
- MIMEタイプが対応しているか確認（415エラー）
- `multipart/form-data`のContent-Typeが正しく設定されているか確認

## Best Practices

1. **Always use streaming for long-running tasks**
   - Blockingモードは100秒の制限があります

2. **Implement user identification**
   - `user`パラメータは一貫して使用してください

3. **Handle errors gracefully**
   - すべてのAPI呼び出しにエラーハンドリングを実装

4. **Use trace_id for debugging**
   - ログ追跡のために`trace_id`を活用

5. **Monitor API usage**
   - `total_tokens`と`elapsed_time`を監視してコストを管理
