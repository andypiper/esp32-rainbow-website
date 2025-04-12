enum MessageIds {
  NullResponse = 0x00, // indicates no response is expected
  GetVersionRequest = 0x01,
  GetVersionResponse = 0x03,
  ListFolderRequest = 0x02,
  ListFolderResponse = 0x04,
  WriteFileRequest = 0x05,
  WriteFileResponse = 0x06,
  ReadFileRequest = 0x07,
  ReadFileResponse = 0x08,
  DeleteFileRequest = 0x09,
  DeleteFileResponse = 0x0A,
  MakeDirectoryRequest = 0x0B,
  MakeDirectoryResponse = 0x0C,
  RenameFileRequest = 0x0D,
  RenameFileResponse = 0x0E,
  GetFileInfoRequest = 0x0F,
  GetFileInfoResponse = 0x10,
}

export { MessageIds };
