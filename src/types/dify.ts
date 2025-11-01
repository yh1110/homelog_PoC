// Dify API Types based on official documentation

export type ResponseMode = 'streaming' | 'blocking';

export type FileTransferMethod = 'local_file' | 'remote_url';

export type FileType = 'document' | 'image';

export interface DifyFileInput {
  transfer_method: FileTransferMethod;
  upload_file_id?: string;
  url?: string;
  type: FileType;
}

export interface WorkflowRunRequest {
  inputs: Record<string, any>;
  response_mode: ResponseMode;
  user: string;
  trace_id?: string;
}

export interface WorkflowRunResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: 'running' | 'succeeded' | 'failed' | 'stopped';
    outputs: Record<string, any>;
    error: string | null;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
}

// Streaming Events
export type StreamingEventType =
  | 'workflow_started'
  | 'node_started'
  | 'text_chunk'
  | 'node_finished'
  | 'workflow_finished'
  | 'tts_message'
  | 'tts_message_end'
  | 'ping';

export interface StreamingEvent {
  event: StreamingEventType;
  task_id?: string;
  workflow_run_id?: string;
  data?: any;
}

export interface FileUploadRequest {
  file: File;
  user: string;
}

export interface FileUploadResponse {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_by: string;
  created_at: number;
}

export interface WorkflowStopRequest {
  user: string;
}

export interface DifyErrorResponse {
  code: string;
  message: string;
  status: number;
}
