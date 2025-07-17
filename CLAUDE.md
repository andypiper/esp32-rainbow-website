# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the ESP32 Rainbow Website - a comprehensive web-based interface for the ESP32 Rainbow hardware, which is a ZX Spectrum clone built using the ESP32 microcontroller. The website provides file management, real-time communication, and development tools specifically designed for ESP32 Rainbow devices.

Live site: https://esp32rainbow.com

## Common Development Commands

### Development Server
```bash
npm run dev          # Runs both Vite dev server and Cloudflare Worker
npm run dev:vite     # Vite dev server only (with --host)
npm run dev:worker   # Cloudflare Worker dev server only
```

### Build & Test
```bash
npm run build        # TypeScript compilation + Vite build
npm run lint         # ESLint with TypeScript rules
npm run test         # Jest testing
npm run preview      # Preview production build
```

### Package Management
```bash
npm install          # Install dependencies
npm run prepare      # Husky git hooks setup
```

## Architecture Overview

### Core Technology Stack
- **React 18** with TypeScript for the frontend
- **Vite** for build tooling and development
- **Tailwind CSS** for styling
- **Cloudflare Workers** for proxy functionality
- **WebSerial API** for ESP32 device communication

### Key Application Layers

#### Device Communication System
- **Device.ts** - Main device class handling serial communication
- **MessageHandler.ts** - Custom binary message protocol implementation
- **Messages/** - Type-safe message classes for device operations
- **DeviceProvider.tsx** - React context for device state management

The communication uses a custom binary protocol over WebSerial API with support for:
- File operations (read, write, delete, rename, list)
- Flash and SD card storage
- Real-time processing with 1ms intervals
- Automatic reconnection

#### Page Structure
- **Home** - Landing page with marketing content
- **Games** - Game browser with search/filtering (13,000+ games from ZXDB)
- **Emulator** - Full ZX Spectrum emulator with WASM integration
- **File Browser** - Device file management interface
- **Tools** - Conversion utilities (TAP to WAV, SCR to PNG)
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

### Important File Locations

#### Core Application
- `/src/main.tsx` - React application bootstrap
- `/src/App.tsx` - Main router configuration
- `/src/context/DeviceProvider.tsx` - Device state management
- `/src/device/` - Device communication layer

#### Configuration
- `/package.json` - Build scripts and dependencies
- `/tsconfig.json` - TypeScript configuration
- `/vite.config.ts` - Vite build configuration
- `/wrangler.toml` - Cloudflare Worker configuration
- `/tailwind.config.js` - Tailwind CSS configuration

#### Data & Assets
- `/public/data/` - Game database (paginated JSON)
- `/public/wasm/` - WebAssembly modules
- `/scripts/` - Python data generation scripts

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

### Data-Driven UI
- Game data is JSON-based with pagination
- Search uses pre-indexed FlexSearch
- Routing follows data structure (alphabetical organization)

## Key Dependencies

### Core Framework
- **react** (18.3.1) - UI framework
- **react-router-dom** (7.0.2) - Client-side routing
- **typescript** (5.6.2) - Type safety

### Device Communication
- **esptool-js** (0.4.7) - ESP32 tool integration
- **crypto-js** (4.2.0) - Cryptographic utilities

### Build & Development
- **vite** (6.0.1) - Build tool and dev server
- **wrangler** (4.12.0) - Cloudflare Workers development
- **concurrently** (9.1.0) - Run multiple commands

### Utilities
- **jszip** (3.10.1) - ZIP file handling
- **flexsearch** (0.7.43) - Full-text search
- **@ffmpeg/ffmpeg** (0.12.15) - Audio/video processing

## Testing & Quality

### Current Setup
- **Jest** configured for testing (minimal coverage currently)
- **ESLint** with TypeScript and React rules
- **Husky** configured for git hooks (currently empty)

### Running Tests
```bash
npm run test    # Run Jest tests
npm run lint    # Run ESLint
```

## Deployment Architecture

- **Static hosting** with Vite-generated assets
- **Cloudflare Workers** for proxy functionality
- **CDN optimization** for game data and WASM files
- **WebSerial API** requires HTTPS for device communication

## Notable Features

### Advanced Emulator Integration
- Full ZX Spectrum emulation via WASM
- Virtual keyboard with visual feedback
- Game loading from ZIP archives
- 48K/128K machine support

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