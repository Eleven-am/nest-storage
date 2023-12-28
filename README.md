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

## Customization

The module supports multiple storage providers. You can extend it by implementing additional providers as needed. Refer to the [Nest.js documentation](https://docs.nestjs.com/) for more information on custom providers.

## Contributing

Contributions are welcome! If you find any issues or have suggestions, feel free to open an [issue](https://github.com/your-repository/issues) or create a [pull request](https://github.com/your-repository/pulls).

## License

This project is licensed under the [MIT License](LICENSE).
