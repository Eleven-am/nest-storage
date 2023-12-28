export interface IFile {
  name: string;
  path: string;
  size: number;
  mimeType: string | null;
  isFolder: boolean;
  modifiedAt: Date;
}
