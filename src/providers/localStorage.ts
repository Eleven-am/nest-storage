import { BaseStorage } from './baseStorage';
import { LocalStorageOption } from '../types/options';
import * as path from 'path';
import * as fs from 'fs';
import { IFile, PartialStream } from '../types/storage';
import { getMimeType } from '../lib/getMimetype';

export class LocalStorage extends BaseStorage {
  private readonly root: string;

  constructor(options: LocalStorageOption) {
    super(options.provider);

    this.root = options.options.root;
  }

  createFolder(filePath: string) {
    const newPath = this.getFullPath(filePath);
    return new Promise<IFile>((resolve, reject) => {
      fs.mkdir(newPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.getFileOrFolder(newPath).then(resolve).catch(reject);
        }
      });
    });
  }

  deleteFileOrFolder(fileId: string) {
    return new Promise<boolean>((resolve, reject) => {
      const fullPath = this.getFullPath(fileId);
      fs.unlink(fullPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  getFileOrFolder(filePath: string) {
    return new Promise<IFile>((resolve, reject) => {
      const fullPath = this.getFullPath(filePath);
      fs.stat(fullPath, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            name: path.basename(fullPath),
            path: filePath,
            size: stats.size,
            mimeType: stats.isFile() ? getMimeType(fullPath) : null,
            isFolder: stats.isDirectory(),
            modifiedAt: stats.mtime,
          });
        }
      });
    });
  }

  moveFileOrFolder(fileId: string, newPath: string) {
    return this.renameFileOrFolder(fileId, newPath);
  }

  putFile(path: string, data: Buffer) {
    return new Promise<IFile>((resolve, reject) => {
      const fullPath = this.getFullPath(path);
      fs.writeFile(fullPath, data, (err) => {
        if (err) {
          reject(err);
        } else {
          this.getFileOrFolder(path).then(resolve).catch(reject);
        }
      });
    });
  }

  readFile(fileId: string) {
    return new Promise<NodeJS.ReadableStream>((resolve, reject) => {
      this.getFileOrFolder(fileId)
        .then((file) => {
          if (file.isFolder) {
            reject(new Error('Cannot read a folder'));
          } else {
            const fullPath = this.getFullPath(fileId);
            const stream = fs.createReadStream(fullPath);
            resolve(stream);
          }
        })
        .catch(reject);
    });
  }

  readFolder(folderId: string) {
    return new Promise<IFile[]>((resolve, reject) => {
      this.getFileOrFolder(folderId)
        .then((file) => {
          if (!file.isFolder) {
            reject(new Error('Cannot read a file'));
          } else {
            const fullPath = this.getFullPath(folderId);
            fs.readdir(fullPath, (err, files) => {
              if (err) {
                reject(err);
              } else {
                Promise.all(
                  files.map((file) =>
                    this.getFileOrFolder(path.join(folderId, file)),
                  ),
                )
                  .then(resolve)
                  .catch(reject);
              }
            });
          }
        })
        .catch(reject);
    });
  }

  renameFileOrFolder(fileId: string, newName: string) {
    return new Promise<IFile>((resolve, reject) => {
      const fullPath = this.getFullPath(fileId);
      const newFullPath = this.getFullPath(newName);
      fs.rename(fullPath, newFullPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.getFileOrFolder(newName).then(resolve).catch(reject);
        }
      });
    });
  }

  streamFile(fileId: string, range: string) {
    return new Promise<PartialStream>((resolve, reject) => {
      this.getFileOrFolder(fileId)
        .then((file) => {
          if (file.isFolder) {
            reject(new Error('Cannot stream a folder'));
          } else {
            const fullPath = this.getFullPath(fileId);
            const { start, end, headers } = this.buildRange(range, file);
            const stream = fs.createReadStream(fullPath, {
              start: start,
              end: end,
            });
            resolve({ stream, headers: headers });
          }
        })
        .catch(reject);
    });
  }

  async getSignedUrl(fileId: string): Promise<string> {
    throw new Error(`Cannot get signed url for ${fileId} in local storage`);
  }

  private getFullPath(filePath: string) {
    return path.join(this.root, filePath);
  }
}
