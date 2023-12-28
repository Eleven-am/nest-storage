# Nest Storage

Nest Storage is a module for [Nest.js](https://nestjs.com/) that simplifies interaction with various storage providers. It offers a flexible and extensible approach to handle storage operations in your Nest.js applications.

## Installation

To use Nest Storage in your Nest.js application, install the package via npm:

```bash
npm install @eleven-am/nestjs-storage
```

## Usage

### 1. Import `StorageModule`

```typescript
import { StorageModule } from '@eleven-am/nestjs-storage';

@Module({
  imports: [
    StorageModule.forRoot({
      provider: Provider.LOCAL, // Choose your storage provider
      // Add provider-specific options as needed
    }),
  ],
})
export class YourModule {}
```

### 2. Inject and Use `StorageService`

```typescript
import { Injectable } from '@nestjs/common';
import { StorageService } from 'nest-storage';

@Injectable()
export class YourService {
  constructor(private readonly storageService: StorageService) {}

  // Use storageService methods for file and folder operations
  // Example: this.storageService.putFile('path/to/file.txt', bufferData);
}
```

## Supported Providers

- **Local Storage:** `Provider.LOCAL`
- **Google Drive Storage:** `Provider.GDRIVE`
- **Dropbox Storage:** `Provider.DROPBOX`
- **Amazon S3 Storage:** `Provider.S3` and `Provider.R2`

Certainly! Here's the same API section with reduced font size for the function names:

## API Reference: `StorageService`

#### `putFile(path: string, data: Buffer): Promise<void>`

Uploads a file to the storage provider at the specified path.

- **Parameters:**
    - `path` (string): The destination path for the file.
    - `data` (Buffer): The data to be stored.

#### `getFileOrFolder(fileId: string): Promise<any>`

Retrieves information about a file or folder from the storage provider.

- **Parameters:**
    - `fileId` (string): The identifier of the file or folder.

#### `readFile(fileId: string): Promise<Buffer>`

Reads the content of a file from the storage provider.

- **Parameters:**
    - `fileId` (string): The identifier of the file.

#### `deleteFileOrFolder(fileId: string): Promise<void>`

Deletes a file or folder from the storage provider.

- **Parameters:**
    - `fileId` (string): The identifier of the file or folder.

#### `moveFileOrFolder(fileId: string, newPath: string): Promise<void>`

Moves a file or folder to a new location within the storage provider.

- **Parameters:**
    - `fileId` (string): The identifier of the file or folder.
    - `newPath` (string): The new path for the file or folder.

#### `renameFileOrFolder(fileId: string, newName: string): Promise<void>`

Renames a file or folder in the storage provider.

- **Parameters:**
    - `fileId` (string): The identifier of the file or folder.
    - `newName` (string): The new name for the file or folder.

#### `createFolder(path: string): Promise<void>`

Creates a new folder in the storage provider.

- **Parameters:**
    - `path` (string): The path for the new folder.

#### `readFolder(folderId: string): Promise<any[]>`

Reads the contents of a folder from the storage provider.

- **Parameters:**
    - `folderId` (string): The identifier of the folder.

#### `getProvider(): string`

Returns the current storage provider name.

- **Returns:**
    - (string): The name of the storage provider (`LOCAL`, `GDRIVE`, `DROPBOX`, `S3`, or `R2`).

## Contributing

Contributions are welcome! If you find any issues or have suggestions, feel free to open an [issue](https://github.com/Eleven-am/nest-storage/issues) or create a [pull request](https://github.com/Eleven-am/nest-storage/pulls).

## License

This project is licensed under the [GPL 3.0 License](LICENSE).
