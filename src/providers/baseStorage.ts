import { Provider } from '../types/options';
import { IFile } from '../types/storage';

export abstract class BaseStorage {
  protected constructor(protected readonly provider: Provider) {}

  abstract putFile(path: string, data: Buffer): Promise<IFile>;

  abstract getFileOrFolder(fileId: string): Promise<IFile>;

  abstract readFile(fileId: string): Promise<NodeJS.ReadableStream>;

  abstract deleteFileOrFolder(fileId: string): Promise<boolean>;

  abstract moveFileOrFolder(fileId: string, newPath: string): Promise<IFile>;

  abstract renameFileOrFolder(fileId: string, newName: string): Promise<IFile>;

  abstract createFolder(path: string): Promise<IFile>;

  abstract readFolder(folderId: string): Promise<IFile[]>;

  abstract getSignedUrl(fileId: string, expires?: number): Promise<string>;

  get storageProvider(): Provider {
    return this.provider;
  }
}
