import { Provider } from '../types/options';
import { Header206, IFile, PartialStream } from '../types/storage';

export abstract class BaseStorage {
  protected constructor(protected readonly provider: Provider) {}

  get storageProvider(): Provider {
    return this.provider;
  }

  abstract putFile(path: string, data: Buffer): Promise<IFile>;

  abstract getFileOrFolder(fileId: string): Promise<IFile>;

  abstract readFile(fileId: string): Promise<NodeJS.ReadableStream>;

  abstract deleteFileOrFolder(fileId: string): Promise<boolean>;

  abstract moveFileOrFolder(fileId: string, newPath: string): Promise<IFile>;

  abstract renameFileOrFolder(fileId: string, newName: string): Promise<IFile>;

  abstract createFolder(path: string): Promise<IFile>;

  abstract readFolder(folderId: string): Promise<IFile[]>;

  abstract getSignedUrl(fileId: string, expires?: number): Promise<string>;

  abstract streamFile(fileId: string, range: string): Promise<PartialStream>;

  protected buildRange(range: string, file: IFile) {
    const parts = range.replace(/bytes=/, '').split('-');

    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1]) > 0 ? parseInt(parts[1], 10) : file.size - 1;
    const chunkSize = end - start + 1;

    const headers: Header206 = {
      contentType: file.mimeType || '',
      contentDisposition: 'attachment',
      contentLength: chunkSize.toString(),
      contentRange: `bytes ${start}-${end}/${file.size}`,
    };

    return { start, end, headers };
  }
}
