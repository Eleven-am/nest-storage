export interface IFile {
  name: string;
  path: string;
  size: number;
  mimeType: string | null;
  isFolder: boolean;
  modifiedAt: Date;
}

export interface Header206 {
  chunkSize: number;
  fileSize: number;
  start: number;
  end: number;
  mimeType: string;
}

export interface PartialStream {
  stream: NodeJS.ReadableStream;
  headers: Header206;
}
