import type {
  WorkflowRunRequest,
  WorkflowRunResponse,
  FileUploadResponse,
  StreamingEvent,
  DifyErrorResponse,
} from '@/types/dify';

const API_BASE = '/api';

interface WorkflowRequest extends Omit<WorkflowRunRequest, 'response_mode'> {
  workflow_id?: string;
}

interface StreamingCallbacks {
  onWorkflowStarted?: (event: StreamingEvent) => void;
  onNodeStarted?: (event: StreamingEvent) => void;
  onTextChunk?: (event: StreamingEvent) => void;
  onNodeFinished?: (event: StreamingEvent) => void;
  onWorkflowFinished?: (event: StreamingEvent) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * Execute workflow with blocking mode
 */
export async function runWorkflow(
  request: WorkflowRequest
): Promise<WorkflowRunResponse> {
  try {
    const response = await fetch(`${API_BASE}/workflow-run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        response_mode: 'blocking',
      }),
    });

    if (!response.ok) {
      const error: DifyErrorResponse = await response.json();
      throw new Error(error.message || 'Workflow execution failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Workflow execution error:', error);
    throw error;
  }
}

/**
 * Execute workflow with streaming mode (SSE)
 */
export async function runWorkflowStreaming(
  request: WorkflowRequest,
  callbacks: StreamingCallbacks
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/workflow-run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        response_mode: 'streaming',
      }),
    });

    if (!response.ok) {
      const error: DifyErrorResponse = await response.json();
      throw new Error(error.message || 'Workflow execution failed');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        callbacks.onComplete?.();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const eventData: StreamingEvent = JSON.parse(line.substring(6));

            switch (eventData.event) {
              case 'workflow_started':
                callbacks.onWorkflowStarted?.(eventData);
                break;
              case 'node_started':
                callbacks.onNodeStarted?.(eventData);
                break;
              case 'text_chunk':
                callbacks.onTextChunk?.(eventData);
                break;
              case 'node_finished':
                callbacks.onNodeFinished?.(eventData);
                break;
              case 'workflow_finished':
                callbacks.onWorkflowFinished?.(eventData);
                break;
              case 'ping':
                // Keep-alive event, ignore
                break;
              default:
                console.log('Unknown event type:', eventData.event);
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
    callbacks.onError?.(
      error instanceof Error ? error : new Error('Unknown error')
    );
  }
}

/**
 * Upload file for workflow input
 */
export async function uploadFile(
  file: File,
  user: string
): Promise<FileUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', user);

    const response = await fetch(`${API_BASE}/file-upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error: DifyErrorResponse = await response.json();
      throw new Error(error.message || 'File upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * Stop running workflow
 */
export async function stopWorkflow(
  taskId: string,
  user: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/workflow-stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: taskId,
        user,
      }),
    });

    if (!response.ok) {
      const error: DifyErrorResponse = await response.json();
      throw new Error(error.message || 'Failed to stop workflow');
    }
  } catch (error) {
    console.error('Stop workflow error:', error);
    throw error;
  }
}
