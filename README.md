[![CI](https://github.com/atomic14/esp32-rainbow-website/actions/workflows/ci.yml/badge.svg)](https://github.com/atomic14/esp32-rainbow-website/actions/workflows/ci.yml)

# ESP32 Rainbow Website

A comprehensive web-based interface for the ESP32 Rainbow hardware - a ZX Spectrum clone built using the ESP32 microcontroller. This website provides file management, real-time communication, and development tools specifically designed for the ESP32 Rainbow.

🌐 **Live Site**: [https://esp32rainbow.com](https://esp32rainbow.com)  
🔧 **Firmware Source**: [https://github.com/atomic14/esp32-zxspectrum](https://github.com/atomic14/esp32-zxspectrum)  
🔩 **Hardware Design**: [https://github.com/atomic14/esp32-zxspectrum-hardware](https://github.com/atomic14/esp32-zxspectrum-hardware)  
🛒 **Where can I get one?**: [https://www.crowdsupply.com/atomic14/esp32-rainbow](https://www.crowdsupply.com/atomic14/esp32-rainbow)

## Overview

The ESP32 Rainbow Website provides a modern web interface for managing and developing with the ESP32 Rainbow hardware. The ESP32 Rainbow is a ZX Spectrum clone that recreates the classic computer experience using modern ESP32 technology.

### Key Features
- **Flash File System Browser** - Manage files on ESP32 Rainbow's flash storage
- **ZX Spectrum Emulator** - Full emulation with WASM integration
- **Game Database** - 13,000+ games from ZXDB with advanced search
- **Real-time Serial Communication** - Direct WebSerial API communication
- **Development Tools** - File conversion utilities (TAP to WAV, SCR to PNG)
- **File Management** - Create, edit, delete, and rename files and directories

## Getting Started

### Prerequisites

- A modern web browser that supports WebSerial API (Chrome, Edge)
- ESP32 Rainbow hardware with the appropriate firmware flashed

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd esp32-rainbow-website
npm install
```

### Development Commands

#### Development Server
```bash
npm run dev          # Runs both Vite dev server and Cloudflare Worker
npm run dev:vite     # Vite dev server only (with --host)
npm run dev:worker   # Cloudflare Worker dev server only
```

#### Build & Test
```bash
npm run build        # TypeScript compilation + Vite build
npm run lint         # ESLint with TypeScript rules
npm run test         # Jest testing
npm run preview      # Preview production build
```

## Usage

1. **Connect to Device** - Use the "Connect" button to establish WebSerial connection
2. **Browse Files** - Navigate the ESP32 Rainbow's file system
3. **Play Games** - Access 13,000+ ZX Spectrum games through the emulator
4. **Manage Files** - Create, edit, and organize files on the device
5. **Use Tools** - Convert files between different formats

## Architecture

### Technology Stack

- **React 18** with TypeScript for the frontend
- **Vite** for build tooling and development
- **Tailwind CSS** for styling
- **Cloudflare Workers** for proxy functionality
- **WebSerial API** for ESP32 device communication

### Core Components

#### Device Communication System
The application uses a sophisticated device communication layer:

- **Device.ts** - Main device class handling serial communication
- **MessageHandler.ts** - Custom binary message protocol implementation
- **Messages/** - Type-safe message classes for device operations
- **DeviceProvider.tsx** - React context for device state management

**Communication Protocol:**
- Custom binary protocol over WebSerial API
- File operations (read, write, delete, rename, list)
- Flash and SD card storage support
- Real-time processing with 1ms intervals
- Automatic reconnection capabilities

#### Application Structure

**Main Pages:**
- **Home** - Landing page with marketing content
- **Games** - Game browser with search/filtering
- **Emulator** - Full ZX Spectrum emulator with WASM integration
- **File Browser** - Device file management interface
- **Tools** - Conversion utilities
- **Documentation** - FAQ, Quick Start, Firmware updates

#### Game Database Architecture
- **Paginated JSON** data in `/public/data/` (50 games per page)
- **FlexSearch** integration for fast text search
- **Genre filtering** with 13 categories
- **Alphabetical navigation** with letter-based routing
- **Python scripts** in `/scripts/` for data generation from ZXDB

#### WASM Integration
- **zx_emulator4.wasm** - ZX Spectrum emulator core
- **tap_to_z80.wasm** - TAP file to Z80 snapshot conversion
- **tap_to_audio.wasm** - TAP file to audio conversion

### Key Dependencies

#### Core Framework
- **react** (18.3.1) - UI framework
- **react-router-dom** (7.0.2) - Client-side routing
- **typescript** (5.6.2) - Type safety

#### Device Communication
- **esptool-js** (0.4.7) - ESP32 tool integration
- **crypto-js** (4.2.0) - Cryptographic utilities

#### Build & Development
- **vite** (6.0.1) - Build tool and dev server
- **wrangler** (4.12.0) - Cloudflare Workers development
- **concurrently** (9.1.0) - Run multiple commands

#### Utilities
- **jszip** (3.10.1) - ZIP file handling
- **flexsearch** (0.7.43) - Full-text search
- **@ffmpeg/ffmpeg** (0.12.15) - Audio/video processing

## Development Patterns

### Message-Based Device Communication
All device operations use typed message classes:
```typescript
const message = new ReadFileMessage(filename);
await device.sendMessage(message);
```

### Context-Based State Management
Device state is managed through React context:
```typescript
const { device, isConnected, version } = useDevice();
```

### Modular Component Architecture
Components are organized by feature with clear separation:
- Device-aware components use DeviceProvider context
- Reusable UI components in `/src/components/`
- Page-specific components in `/src/pages/`

## File Structure

### Core Application
- `/src/main.tsx` - React application bootstrap
- `/src/App.tsx` - Main router configuration
- `/src/context/DeviceProvider.tsx` - Device state management
- `/src/device/` - Device communication layer

### Configuration
- `/package.json` - Build scripts and dependencies
- `/tsconfig.json` - TypeScript configuration
- `/vite.config.ts` - Vite build configuration
- `/wrangler.toml` - Cloudflare Worker configuration
- `/tailwind.config.js` - Tailwind CSS configuration

### Data & Assets
- `/public/data/` - Game database (paginated JSON)
- `/public/wasm/` - WebAssembly modules
- `/scripts/` - Python data generation scripts

## Flash File Browser

The flash file browser is a core feature that allows direct management of files on the ESP32 Rainbow's flash storage through your web browser.

### Features
- Browse directories on ESP32 flash storage
- Create, edit, and delete files
- Create and delete directories
- Rename files and directories
- View file information (size, last modified date)
- Edit text files directly in the browser

### Communication Protocol
The communication between the frontend and ESP32 Rainbow uses a custom message protocol:

- `ListFolder` - Browse directories
- `ReadFile` - Read file contents
- `WriteFile` - Create or update files
- `DeleteFile` - Delete files or directories
- `MakeDirectory` - Create new directories
- `RenameFile` - Rename files or directories
- `GetFileInfo` - Get metadata about files

## Advanced Features

### ZX Spectrum Emulator
- Full ZX Spectrum emulation via WASM
- Virtual keyboard with visual feedback
- Game loading from ZIP archives
- 48K/128K machine support
- Save state functionality

### Real-time Hardware Communication
- Direct WebSerial API communication with ESP32 devices
- File system browsing on device
- Real-time file operations with progress tracking
- Automatic device detection and reconnection

### Comprehensive Game Database
- 13,000+ games from ZXDB integration
- Advanced search with FlexSearch
- Genre categorization and filtering
- Optimized pagination for performance

## Testing & Quality

### Current Setup
- **Jest** configured for testing
- **ESLint** with TypeScript and React rules
- **Husky** configured for git hooks

### Running Tests
```bash
npm run test    # Run Jest tests
npm run lint    # Run ESLint
```

## Deployment

### Architecture
- **Static hosting** with Vite-generated assets
- **Cloudflare Workers** for proxy functionality
- **CDN optimization** for game data and WASM files
- **WebSerial API** requires HTTPS for device communication

### Build Process
```bash
npm run build    # Creates optimized production build
npm run preview  # Preview production build locally
```

## Contributing

This project uses modern web technologies and follows React best practices. Key development principles:

- TypeScript for type safety
- Message-based architecture for device communication
- Context-based state management
- Modular component structure
- Test-driven development (Jest)

## License

This project is licensed under the MIT License.

## Acknowledgments

- Based on the ESP32 Rainbow Website project
- ZX Spectrum games data from ZXDB
- WebAssembly emulation cores
- ESP32 development community