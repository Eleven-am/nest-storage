import { Injectable } from '@nestjs/common';

import { BaseStorage } from '../providers/baseStorage';
import { Provider, StorageOption } from '../types/options';
import { LocalStorage } from '../providers/localStorage';
import { S3BaseStorage } from '../providers/s3BaseStorage';
import { GDriveStorage } from '../providers/gDriveStorage';
import { DropboxStorage } from '../providers/dropboxStorage';
import { IFile } from '../types/storage';

@Injectable()
export class StorageService {
  constructor(private readonly storageProvider: BaseStorage) {}

  putFile(path: string, data: Buffer) {
    return this.storageProvider.putFile(path, data);
  }

  getFileOrFolder(fileId: string) {
    return this.storageProvider.getFileOrFolder(fileId);
  }

  readFile(fileId: string) {
    return this.storageProvider.readFile(fileId);
  }

  deleteFileOrFolder(fileId: string) {
    return this.storageProvider.deleteFileOrFolder(fileId);
  }

  moveFileOrFolder(fileId: string, newPath: string) {
    return this.storageProvider.moveFileOrFolder(fileId, newPath);
  }

  renameFileOrFolder(fileId: string, newName: string) {
    return this.storageProvider.renameFileOrFolder(fileId, newName);
  }

  createFolder(path: string) {
    return this.storageProvider.createFolder(path);
  }

  readFolder(folderId?: string) {
    return folderId
      ? this.storageProvider.readFolder(folderId)
      : this.storageProvider.readRootFolder();
  }

  async readFolderRecursive(folderId: string) {
    const folder = await this.storageProvider.readFolder(folderId);
    const files = folder.filter((file) => !file.isFolder);
    const folders = folder.filter((file) => file.isFolder);

    const internalFiles = await Promise.all(
      folders.map((folder) => this.readFolderRecursive(folder.path)),
    );

    return [...files, ...internalFiles.flat()] as IFile[];
  }

  getSignedUrl(fileId: string, expires?: number) {
    return this.storageProvider.getSignedUrl(fileId, expires);
  }

  streamFile(fileId: string, range: string) {
    return this.storageProvider.streamFile(fileId, range);
  }

  createProvider(options: StorageOption) {
    let provider: BaseStorage | null = null;
    switch (options.provider) {
      case Provider.LOCAL:
        provider = new LocalStorage(options);
        break;
      case Provider.S3:
      case Provider.R2:
        provider = new S3BaseStorage(options);
        break;
      case Provider.GDRIVE:
        provider = new GDriveStorage(options);
        break;
      case Provider.DROPBOX:
        provider = new DropboxStorage(options);
        break;
      default:
        throw new Error('Invalid storage provider');
    }

    return new StorageService(provider);
  }

  getProvider() {
    return this.storageProvider.storageProvider;
  }
}
