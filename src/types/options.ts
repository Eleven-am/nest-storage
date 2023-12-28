export type StorageOption =
  | LocalStorageOption
  | S3StorageOption
  | R2StorageOption
  | GDriveStorageOption
  | DropboxStorageOption;

export enum Provider {
  LOCAL = 'LOCAL',
  S3 = 'S3',
  R2 = 'R2',
  GDRIVE = 'GDRIVE',
  DROPBOX = 'DROPBOX',
}

export type LocalStorageOption = {
  provider: Provider.LOCAL;
  options: {
    root: string;
  };
};

export type S3Options = {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  bucket: string;
  region?: string;
};

export type S3StorageOption = {
  provider: Provider.S3;
  options: S3Options;
};

export type R2StorageOption = {
  provider: Provider.R2;
  options: S3Options;
};

export type GDriveStorageOption = {
  provider: Provider.GDRIVE;
  options: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
};

export type DropboxStorageOption = {
  provider: Provider.DROPBOX;
  options: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
};

export interface AsyncStorageOptions {
  isGlobal?: boolean;
  inject?: any[];
  imports?: any[];
  useFactory: (...args: any[]) => Promise<StorageOption> | StorageOption;
}
