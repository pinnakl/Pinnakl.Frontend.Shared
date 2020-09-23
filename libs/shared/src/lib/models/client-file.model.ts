export interface ClientFile {
  clientId: number;
  createDate: Date;
  createdBy: number;
  dateSubFolderIndicator?: number;
  fileName: string;
  filePath: string;
  fileType: string;
  id: number;
  isIncoming?: boolean;
  osType: string;
  osTypeId?: number;
  taskInstanceQueueId?: number;
  temporaryWriteURL: string;
  updateBy?: number;
  updateDate?: Date;
  size?: number;
}
