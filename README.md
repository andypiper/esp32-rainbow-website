# ESP32 Flash File Browser

A web-based file browser for managing files on ESP32 flash storage. This project is part of the ESP32 Rainbow Website project.

## Features

- Browse directories on ESP32 flash storage
- Create, edit, and delete files
- Create and delete directories
- Rename files and directories
- View file information (size, last modified date)
- Edit text files directly in the browser

### Communication Protocol

The communication between the frontend and ESP32 uses a custom message protocol with these message types:

- ListFolder - Browse directories
- ReadFile - Read file contents
- WriteFile - Create or update files
- DeleteFile - Delete files or directories
- MakeDirectory - Create new directories
- RenameFile - Rename files or directories
- GetFileInfo - Get metadata about files

## Getting Started

### Prerequisites

- A modern web browser that supports WebSerial API (Chrome, Edge)
- ESP32 with the appropriate firmware flashed

### Installation

1. Clone the repository
2. Install the dependencies:

```bash
cd frontend
npm install
npm start
```

## Usage

1. Connect to your ESP32 using the "Connect" button
2. Browse the file system
3. Perform file operations as needed

## License

This project is licensed under the MIT License.

## Acknowledgments

- Based on the ESP32 Rainbow Website project
