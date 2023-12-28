import { BaseStorage } from './baseStorage';
import S3 from 'aws-sdk/clients/s3.js';
import { Provider, S3Options } from '../types/options';
import { IFile } from '../types/storage';

export class S3BaseStorage extends BaseStorage {
  private readonly storage: S3;
  private readonly bucket: string;

  constructor({
    provider,
    options,
  }: {
    provider: Provider;
    options: S3Options;
  }) {
    super(provider);
    this.storage = new S3({
      ...options,
      region: 'auto',
      signatureVersion: 'v4',
    });
    this.bucket = options.bucket;
  }

  async createFolder(path: string) {
    await this.storage
      .putObject({
        Bucket: this.bucket,
        Key: path,
        Body: Buffer.alloc(0),
      })
      .promise();

    return this.getFileOrFolder(path);
  }

  async deleteFileOrFolder(fileId: string) {
    const data = await this.storage
      .deleteObject({
        Bucket: this.bucket,
        Key: fileId,
      })
      .promise();
    return data.DeleteMarker || false;
  }

  async getFileOrFolder(fileId: string) {
    const data = await this.storage
      .getObject({
        Bucket: this.bucket,
        Key: fileId,
      })
      .promise();
    return this.parseFile(fileId, data);
  }

  moveFileOrFolder(fileId: string, newPath: string) {
    return new Promise<IFile>((resolve, reject) => {
      this.storage
        .copyObject({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${fileId}`,
          Key: newPath,
        })
        .promise()
        .then(() => {
          return this.deleteFileOrFolder(fileId);
        })
        .then(() => {
          resolve(this.getFileOrFolder(newPath));
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async putFile(path: string, data: Buffer) {
    const params = {
      Bucket: this.bucket,
      Key: path,
      Body: data,
    };
    const s3Data = await this.storage.upload(params).promise();
    return this.getFileOrFolder(s3Data.Key);
  }

  readFile(fileId: string) {
    return new Promise<NodeJS.ReadableStream>((resolve, reject) => {
      this.storage
        .getObject({
          Bucket: this.bucket,
          Key: fileId,
        })
        .promise()
        .then((data) => {
          resolve(data.Body as NodeJS.ReadableStream);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  readFolder(folderId: string) {
    return new Promise<IFile[]>((resolve, reject) => {
      this.storage
        .listObjectsV2({
          Bucket: this.bucket,
          Prefix: folderId,
        })
        .promise()
        .then((data) => {
          const files = data.Contents?.map((file) => {
            return this.parseFile(file.Key || '', file);
          });
          resolve(files || []);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  renameFileOrFolder(fileId: string, newName: string) {
    return this.moveFileOrFolder(fileId, newName);
  }

  getSignedUrl(fileId: string, expires: number) {
    return new Promise<string>((resolve, reject) => {
      this.storage.getSignedUrl(
        'getObject',
        {
          Bucket: this.bucket,
          Key: fileId,
          Expires: expires,
        },
        (err, url) => {
          if (err) {
            reject(err);
          } else {
            resolve(url);
          }
        },
      );
    });
  }

  private parseFile(
    fileId: string,
    data: S3.Object | S3.GetObjectOutput,
  ): IFile {
    return {
      name: fileId,
      path: fileId,
      size:
        'Size' in data
          ? data.Size!
          : 'ContentLength' in data
            ? data.ContentLength!
            : 0,
      mimeType: 'ContentType' in data ? data.ContentType! : null,
      isFolder: false,
      modifiedAt: data.LastModified || new Date(),
    };
  }
}
