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
    return new Promise<IFile>((resolve, reject) => {
      fs.mkdir(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.getFileOrFolder(filePath).then(resolve).catch(reject);
        }
      });
    });
  }

  deleteFileOrFolder(fileId: string) {
    return new Promise<boolean>((resolve, reject) => {
      fs.unlink(fileId, (err) => {
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
      fs.stat(filePath, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            size: stats.size,
            modifiedAt: stats.mtime,
            isFolder: stats.isDirectory(),
            name: path.basename(filePath),
            path: filePath,
            mimeType: stats.isFile() ? getMimeType(filePath) : null,
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
      fs.writeFile(path, data, (err) => {
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
            const stream = fs.createReadStream(fileId);
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
            fs.readdir(folderId, (err, files) => {
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
      fs.rename(fileId, newName, (err) => {
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
            const { start, end, headers } = this.buildRange(range, file);
            const stream = fs.createReadStream(fileId, {
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
}
