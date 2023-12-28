import { BaseStorage } from './baseStorage';
import * as Buffer from 'buffer';
import { IFile } from '../types/storage';
import { z } from 'zod';
import { getMimeType } from '../lib/getMimetype';
import { makeRequest } from '../lib/makeRequest';
import { DropboxStorageOption } from '../types/options';

const dropboxFileSchema = z.object({
  '.tag': z.union([z.literal('file'), z.literal('folder')]),
  name: z.string(),
  id: z.string(),
  path_lower: z.string(),
  path_display: z.string(),
  client_modified: z.string(),
  size: z.number().optional(),
});

const dropboxGetFilesResponseSchema = z.object({
  entries: z.array(dropboxFileSchema),
  has_more: z.boolean(),
  cursor: z.string(),
});

const dropboxTokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
});

type DropBoxFile = z.infer<typeof dropboxFileSchema>;
type DropBoxToken = z.infer<typeof dropboxTokenSchema>;

interface DropBoxCredentials {
  clientId: string;
  clientSecret: string;
}

export class DropboxStorage extends BaseStorage {
  private readonly credentials: DropBoxCredentials;
  private readonly refreshToken: string;
  private token: DropBoxToken | null;

  constructor(options: DropboxStorageOption) {
    super(options.provider);

    this.credentials = {
      clientId: options.options.clientId,
      clientSecret: options.options.clientSecret,
    };

    this.refreshToken = options.options.refreshToken;
  }

  async createFolder(path: string) {
    const params = {
      path: 'https://api.dropboxapi.com/2/files/create_folder_v2',
      query: {
        path: `${path}`,
      },
    };

    const data = await this.makeRequest(params, dropboxFileSchema);
    return this.parseFile(data);
  }

  async deleteFileOrFolder(fileId: string) {
    const params = {
      path: 'https://api.dropboxapi.com/2/files/delete_v2',
      query: {
        path: `${fileId}`,
      },
    };

    await this.makeRequest(params, dropboxFileSchema);
    return true;
  }

  async getFileOrFolder(fileId: string) {
    const params = {
      path: 'https://api.dropboxapi.com/2/files/get_metadata',
      query: {
        path: `${fileId}`,
      },
    };

    const data = await this.makeRequest(params, dropboxFileSchema);
    return this.parseFile(data);
  }

  async moveFileOrFolder(fileId: string, newPath: string) {
    const params = {
      path: 'https://api.dropboxapi.com/2/files/move_v2',
      query: {
        from_path: fileId,
        to_path: newPath,
      },
    };

    const data = await this.makeRequest(params, dropboxFileSchema);
    return this.parseFile(data);
  }

  async putFile(path: string, data: Buffer) {
    const token = await this.authenticate();
    const response = await fetch(
      'https://content.dropboxapi.com/2/files/upload',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path,
            mode: 'overwrite',
          }),
        },
        body: data,
      },
    );

    try {
      const json = await response.json();
      const dropboxFile = dropboxFileSchema.parse(json);
      return this.parseFile(dropboxFile);
    } catch (error) {
      throw new Error('Failed to upload file to Dropbox');
    }
  }

  async readFile(fileId: string) {
    const token = await this.authenticate();
    const options = {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token.access_token}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: fileId,
        }),
        'Content-Type': 'application/octet-stream',
      },
    };

    return new Promise<NodeJS.ReadableStream>((resolve, reject) => {
      fetch('https://content.dropboxapi.com/2/files/download', options)
        .then((response) => {
          if (!response.ok) {
            reject(response);
          }

          resolve(response.body as unknown as NodeJS.ReadableStream);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async readFolder(folderId: string) {
    const query = {
      path: folderId,
      include_media_info: true,
      include_deleted: false,
      include_has_explicit_shared_members: false,
      include_mounted_folders: true,
      include_non_downloadable_files: true,
    };

    const params = {
      path: 'https://api.dropboxapi.com/2/files/list_folder',
      query,
    };

    const data = await this.makeRequest(params, dropboxGetFilesResponseSchema);
    return data.entries.map((file) => this.parseFile(file));
  }

  renameFileOrFolder(fileId: string, newName: string) {
    return this.moveFileOrFolder(fileId, newName);
  }

  private parseFile(file: DropBoxFile): IFile {
    return {
      name: file.name,
      path: file.path_lower,
      size: file.size || 0,
      mimeType: getMimeType(file.name),
      isFolder: file['.tag'] === 'folder',
      modifiedAt: new Date(file.client_modified),
    };
  }

  private makeRequest<DataType>(
    { path, query }: { path: string; query: Record<string, unknown> },
    schema: z.ZodType<DataType>,
  ) {
    return new Promise<DataType>((resolve, reject) => {
      this.authenticate()
        .then((token) => {
          const params = {
            address: `https://api.dropboxapi.com/2${path}`,
            method: 'POST' as const,
            headers: {
              Authorization: `Bearer ${token.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(query),
          };

          return makeRequest(params, schema);
        })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private async authenticate() {
    if (this.token && this.token.expires_in > Date.now()) {
      return this.token;
    }

    const query = {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret,
    };

    const response = await makeRequest(
      {
        address: 'https://api.dropboxapi.com/oauth2/token',
        method: 'GET',
        query,
      },
      dropboxTokenSchema,
    );
    const token = {
      ...response,
      expires_in: Date.now() + response.expires_in * 1000,
    };
    this.token = token;
    return token;
  }
}
