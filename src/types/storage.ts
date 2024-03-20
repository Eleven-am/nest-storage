export interface IFile {
  name: string;
  path: string;
  size: number;
  mimeType: string | null;
  isFolder: boolean;
  modifiedAt: Date;
}

export interface Header206 {
  contentType: string;
  contentLength: string;
  contentRange: string;
  contentDisposition: string;
}

export interface PartialStream {
  stream: NodeJS.ReadableStream;
  headers: Header206;
}
