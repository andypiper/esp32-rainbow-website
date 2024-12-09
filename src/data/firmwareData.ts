export interface FirmwareFile {
  address: string
  path: string
}

export interface FirmwareRelease {
  version: string
  description: string
}

export interface FirmwareOption {
  version: string
  description: string
  board: 'ESP32 Rainbow' | 'Cheap Yellow Display' | 'LilyGo T-Deck'
  slug: string
  files: FirmwareFile[]
}

// Map board types to slugs
const BOARD_SLUGS = {
  'ESP32 Rainbow': 'esp32-rainbow',
  'Cheap Yellow Display': 'cheap-yellow-display',
  'LilyGo T-Deck': 'lilygo-tdeck'
} as const

// Map board types to chip types for correct addresses
const CHIP_ADDRESSES = {
  'ESP32': {
    bootloader: '0x1000',
    partition: '0x8000',
    firmware: '0x10000'
  },
  'ESP32-S3': {
    bootloader: '0x0000',
    partition: '0x8000',
    firmware: '0x10000'
  }
} as const

// Map boards to their chip types
const BOARD_CHIPS = {
  'ESP32 Rainbow': 'ESP32-S3',
  'Cheap Yellow Display': 'ESP32',
  'LilyGo T-Deck': 'ESP32-S3'
} as const

export const FIRMWARE_RELEASES: FirmwareRelease[] = [
  {
    version: '1.0.0',
    description: 'Initial release with ZX Spectrum emulation'
  }
]

export const AVAILABLE_FIRMWARE: FirmwareOption[] = FIRMWARE_RELEASES.flatMap(release => 
  Object.entries(BOARD_SLUGS).map(([board, slug]) => {
    const chipType = BOARD_CHIPS[board as keyof typeof BOARD_CHIPS];
    const addresses = CHIP_ADDRESSES[chipType];
    
    return {
      ...release,
      board: board as keyof typeof BOARD_SLUGS,
      slug,
      files: [
        { 
          address: addresses.bootloader,
          path: `/firmware/${slug}/v${release.version}/bootloader.bin` 
        },
        { 
          address: addresses.partition,
          path: `/firmware/${slug}/v${release.version}/partitions.bin` 
        },
        { 
          address: addresses.firmware,
          path: `/firmware/${slug}/v${release.version}/firmware.bin` 
        }
      ]
    };
  })
)

export const BOARD_TYPES = Object.keys(BOARD_SLUGS) as (keyof typeof BOARD_SLUGS)[]
export type BoardType = typeof BOARD_TYPES[number] 