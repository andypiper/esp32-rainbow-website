enum MessageIds {
  NullResponse = 0x00, // indicates no response is expected
  GetVersionRequest = 0x01,
  GetVersionResponse = 0x03,
  ListFolderRequest = 0x02,
  ListFolderResponse = 0x04,
  WriteFileStartRequest = 0x05,
  WriteFileStartResponse = 0x06,
  WriteFileDataRequest = 0x07,
  WriteFileDataResponse = 0x08,
  WriteFileEndRequest = 0x09,
  WriteFileEndResponse = 0x0A,
  ReadFileRequest = 0x0B,
  ReadFileResponse = 0x0C,
  DeleteFileRequest = 0x0D,
  DeleteFileResponse = 0x0E,
  MakeDirectoryRequest = 0x0F,
  MakeDirectoryResponse = 0x10,
  RenameFileRequest = 0x11,
  RenameFileResponse = 0x12,
  GetFileInfoRequest = 0x13,
  GetFileInfoResponse = 0x14,
}

export { MessageIds };
