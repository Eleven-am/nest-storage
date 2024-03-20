import { BaseStorage } from './baseStorage';
import { drive_v3, google } from 'googleapis';
import { GDriveStorageOption } from '../types/options';
import { IFile, PartialStream } from '../types/storage';

export class GDriveStorage extends BaseStorage {
  private readonly drive: drive_v3.Drive;

  constructor(options: GDriveStorageOption) {
    super(options.provider);
    const auth = new google.auth.OAuth2(
      options.options.clientId,
      options.options.clientSecret,
    );

    auth.setCredentials({
      refresh_token: options.options.refreshToken,
    });

    this.drive = google.drive({ version: 'v3', auth: auth });
  }

  createFolder(path: string) {
    return new Promise<IFile>((resolve, reject) => {
      this.drive.files
        .create(
          {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resource: {
              name: path,
              mimeType: 'application/vnd.google-apps.folder',
            },
            fields:
              'id, name, size, parents, modifiedTime, mimeType, contentHints/thumbnail, videoMediaMetadata, thumbnailLink, explicitlyTrashed',
          },
          (err: unknown, data: { data: drive_v3.Schema$File }) => {
            if (err) {
              reject(err);
            } else {
              resolve(this.parseFile(data.data));
            }
          },
        )
        .catch(reject);
    });
  }

  deleteFileOrFolder(fileId: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.drive.files.delete(
        {
          fileId: fileId,
          supportsAllDrives: true,
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        },
      );
    });
  }

  getFileOrFolder(fileId: string) {
    return new Promise<IFile>((resolve, reject) => {
      this.drive.files.get(
        {
          fileId: fileId,
          supportsAllDrives: true,
          fields:
            'id, name, size, parents, modifiedTime, mimeType, contentHints/thumbnail, videoMediaMetadata, thumbnailLink, explicitlyTrashed',
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else if (data?.data) {
            resolve(this.parseFile(data.data));
          } else {
            reject(new Error('File not found'));
          }
        },
      );
    });
  }

  moveFileOrFolder(fileId: string, newPath: string) {
    return new Promise<IFile>((resolve, reject) => {
      this.drive.files.update(
        {
          fileId: fileId,
          supportsAllDrives: true,
          addParents: newPath,
          removeParents: 'root',
          fields:
            'id, name, size, parents, modifiedTime, mimeType, contentHints/thumbnail, videoMediaMetadata, thumbnailLink, explicitlyTrashed',
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else if (data?.data) {
            resolve(this.parseFile(data.data));
          } else {
            reject(new Error('File not found'));
          }
        },
      );
    });
  }

  putFile(path: string, data: Buffer) {
    return new Promise<IFile>((resolve, reject) => {
      this.drive.files
        .create(
          {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resource: {
              name: path,
              parents: ['root'],
            },
            media: {
              mimeType: 'application/octet-stream',
              body: data,
            },
            fields:
              'id, name, size, parents, modifiedTime, mimeType, contentHints/thumbnail, videoMediaMetadata, thumbnailLink, explicitlyTrashed',
          },
          (err: unknown, data: { data: drive_v3.Schema$File }) => {
            if (err) {
              reject(err);
            } else {
              resolve(this.parseFile(data.data));
            }
          },
        )
        .catch(reject);
    });
  }

  readFile(fileId: string) {
    return new Promise<NodeJS.ReadableStream>((resolve, reject) => {
      this.drive.files
        .get(
          {
            fileId: fileId,
            alt: 'media',
            supportsAllDrives: true,
          },
          {
            responseType: 'stream',
          },
        )
        .then((res): NodeJS.ReadableStream => res.data)
        .catch(reject);
    });
  }

  readFolder(folderId: string) {
    return this.readFolderRecursive(folderId);
  }

  renameFileOrFolder(fileId: string, newName: string) {
    return new Promise<IFile>((resolve, reject) => {
      this.drive.files
        .update({
          fileId: fileId,
          requestBody: {
            name: newName,
          },
          fields:
            'id, name, size, parents, modifiedTime, mimeType, contentHints/thumbnail, videoMediaMetadata, thumbnailLink, explicitlyTrashed',
        })
        .then((res) => resolve(this.parseFile(res.data)))
        .catch(reject);
    });
  }

  getSignedUrl(fileId: string) {
    return new Promise<string>((resolve, reject) => {
      this.drive.files
        .get({
          fileId: fileId,
          supportsAllDrives: true,
          fields: 'id, name, size, parents, modifiedTime, mimeType',
        })
        .then((res) => resolve(res.data.webContentLink || ''))
        .catch(reject);
    });
  }

  streamFile(fileId: string, range: string) {
    return new Promise<PartialStream>((resolve, reject) => {
      this.drive.files
        .get(
          {
            fileId: fileId,
            alt: 'media',
            supportsAllDrives: true,
          },
          {
            responseType: 'stream',
            headers: {
              Range: range,
            },
          },
        )
        .then((res) => {
          resolve({
            stream: res.data,
            headers: {
              contentLength: res.headers['content-length'],
              contentType: res.headers['content-type'],
              contentRange: res.headers['content-range'],
              contentDisposition: res.headers['content-disposition'],
            },
          });
        })
        .catch(reject);
    });
  }

  private parseFile(file: drive_v3.Schema$File): IFile {
    if (file.id === undefined) {
      throw new Error('File id is undefined');
    }

    if (file.name === undefined) {
      throw new Error('File name is undefined');
    }

    if (
      file.size === undefined &&
      file.mimeType !== 'application/vnd.google-apps.folder'
    ) {
      throw new Error('File size is undefined');
    }

    return {
      name: file.name || '',
      path: file.id || '',
      size: Number(file.size) || 0,
      mimeType: file.mimeType || null,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder',
      modifiedAt: new Date(file.modifiedTime || 0),
    };
  }

  private readFolderRecursive(folderId: string, pageToken?: string) {
    return new Promise<IFile[]>((resolve, reject) => {
      this.drive.files.list(
        {
          q: `'${folderId}' in parents and trashed = false`,
          fields:
            'nextPageToken, files(id, name, size, parents, modifiedTime, mimeType, contentHints/thumbnail, videoMediaMetadata, thumbnailLink, explicitlyTrashed)',
          supportsAllDrives: true,
          pageToken: pageToken,
          spaces: 'drive',
          orderBy: 'name',
          pageSize: 1000,
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            const files =
              data?.data.files?.map((file) => this.parseFile(file)) || [];
            if (data?.data.nextPageToken) {
              this.readFolderRecursive(folderId, data.data.nextPageToken)
                .then((nextFiles) => resolve([...files, ...nextFiles]))
                .catch(reject);
            } else {
              resolve(files);
            }
          }
        },
      );
    });
  }
}
