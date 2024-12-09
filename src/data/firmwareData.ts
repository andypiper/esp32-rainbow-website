export interface FirmwareFile {
  address: string
  path: string
}

export interface FirmwareOption {
  version: string
  description: string
  board: 'ESP32 Rainbow' | 'Cheap Yellow Display' | 'LilyGo T-Deck'
  files: FirmwareFile[]
}

export interface FirmwareRelease {
  version: string
  description: string
}

export const FIRMWARE_RELEASES: FirmwareRelease[] = [
  {
    version: '1.0.0',
    description: 'Initial release with ZX Spectrum emulation'
  }
  // Add more versions here
]

export const AVAILABLE_FIRMWARE: FirmwareOption[] = FIRMWARE_RELEASES.flatMap(release => [
  {
    ...release,
    board: 'ESP32 Rainbow',
    files: [
      { address: '0x0000', path: `/firmware/esp32-rainbow/bootloader-${release.version}.bin` },
      { address: '0x8000', path: `/firmware/esp32-rainbow/partition-${release.version}.bin` },
      { address: '0x10000', path: `/firmware/esp32-rainbow/firmware-${release.version}.bin` }
    ]
  },
  {
    ...release,
    board: 'Cheap Yellow Display',
    files: [
      { address: '0x0000', path: `/firmware/cyd/bootloader-${release.version}.bin` },
      { address: '0x8000', path: `/firmware/cyd/partition-${release.version}.bin` },
      { address: '0x10000', path: `/firmware/cyd/firmware-${release.version}.bin` }
    ]
  },
  {
    ...release,
    board: 'LilyGo T-Deck',
    files: [
      { address: '0x0000', path: `/firmware/tdeck/bootloader-${release.version}.bin` },
      { address: '0x8000', path: `/firmware/tdeck/partition-${release.version}.bin` },
      { address: '0x10000', path: `/firmware/tdeck/firmware-${release.version}.bin` }
    ]
  }
])

export const BOARD_TYPES = ['ESP32 Rainbow', 'Cheap Yellow Display', 'LilyGo T-Deck'] as const
export type BoardType = typeof BOARD_TYPES[number] 