import { StorageOption, Provider, AsyncStorageOptions } from '../types/options';
import { LocalStorage } from '../providers/localStorage';
import { GDriveStorage } from '../providers/gDriveStorage';
import { DropboxStorage } from '../providers/dropboxStorage';
import { S3BaseStorage } from '../providers/s3BaseStorage';
import {
  DynamicModule,
  Module,
  Provider as NestProvider,
} from '@nestjs/common';
import { StorageService } from '../service/storage.service';

@Module({})
export class StorageModule {
  private static providerFactory(options: StorageOption) {
    switch (options.provider) {
      case Provider.LOCAL:
        return new LocalStorage(options);
      case Provider.S3:
      case Provider.R2:
        return new S3BaseStorage(options);
      case Provider.GDRIVE:
        return new GDriveStorage(options);
      case Provider.DROPBOX:
        return new DropboxStorage(options);
      default:
        throw new Error('Invalid storage provider');
    }
  }

  private static createService(options: StorageOption) {
    const provider = this.providerFactory(options);
    const nestProvider: NestProvider = {
      provide: StorageService,
      useValue: new StorageService(provider),
    };

    return {
      providers: [nestProvider],
      exports: [nestProvider],
    };
  }

  static forRoot(options: StorageOption): DynamicModule {
    return {
      global: true,
      module: StorageModule,
      ...this.createService(options),
    };
  }

  static async forRootAsync(
    options: AsyncStorageOptions,
  ): Promise<DynamicModule> {
    return {
      global: options.isGlobal,
      module: StorageModule,
      ...this.createAsyncProviders(options),
    };
  }

  private static createAsyncProviders(options: AsyncStorageOptions) {
    const provider: NestProvider = {
      provide: StorageService,
      useFactory: async (...args: unknown[]) => {
        const storageOption = await options.useFactory(...args);
        return new StorageService(this.providerFactory(storageOption));
      },
      inject: options.inject || [],
    };

    return {
      providers: [provider],
      exports: [provider],
    };
  }
}
