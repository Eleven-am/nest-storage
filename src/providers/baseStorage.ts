import { Provider } from '../types/options';
import { IFile, PartialStream } from '../types/storage';

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
    const videoRes = {
      mimeType: '',
      fileSize: 0,
      start: 0,
      end: 0,
      chunkSize: 0,
    };

    videoRes.mimeType = file.mimeType || '';
    videoRes.fileSize = file.size;
    const parts = range.replace(/bytes=/, '').split('-');

    videoRes.start = parseInt(parts[0], 10);
    videoRes.end =
      parseInt(parts[1]) > 0 ? parseInt(parts[1], 10) : videoRes.fileSize - 1;
    videoRes.chunkSize = videoRes.end - videoRes.start + 1;
    return videoRes;
  }
}
