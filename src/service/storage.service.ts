import { Injectable } from '@nestjs/common';

import { BaseStorage } from '../providers/baseStorage';

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

  readFolder(folderId: string) {
    return this.storageProvider.readFolder(folderId);
  }

  getProvider() {
    return this.storageProvider.storageProvider;
  }
}
