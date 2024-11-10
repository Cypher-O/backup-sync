export interface BackupData {
    type: 'file' | 'string';
    content: Buffer;
    metadata: {
      filename?: string;
      size?: number;
      mimetype?: string;
      uploadedAt: string;
      [key: string]: any;
    };
  }