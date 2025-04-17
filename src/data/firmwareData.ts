export type FirmwareFile = {
  type: 'bootloader' | 'partition' | 'firmware'
  url: string
}

export type FirmwareRelease = {
  version: string
  name: string
  description: string
  files: FirmwareFile[]
}

export type Board = {
  name: string
  slug: string
  chip: 'ESP32' | 'ESP32-S3'
  addresses: {
    bootloader: string
    partition: string
    firmware: string
  }
  releases: FirmwareRelease[]
}

const BOARDS: Board[] = [
  {
    name: 'ESP32 Rainbow',
    slug: 'esp32-rainbow',
    chip: 'ESP32-S3',
    addresses: {
      bootloader: '0x0000',
      partition: '0x8000',
      firmware: '0x10000'
    },
    // to be populated from github releases
    releases: []
  },
  {
    name: 'Cheap Yellow Display',
    slug: 'cheap-yellow-display',
    chip: 'ESP32',
    addresses: {
      bootloader: '0x1000',
      partition: '0x8000',
      firmware: '0x10000'
    },
    // to be populated from github releases
    releases: []
  }
]

export async function getFirmwareReleases(): Promise<Board[]> {
  const response = await fetch('https://api.github.com/repos/atomic14/esp32-zxspectrum/releases');
  const githubReleases = await response.json();

  const boardSlugs = BOARDS.map(b => b.slug);

  // Dynamically map asset name to board slug and file type
  function parseAsset(assetName: string): { slug: string | null, type: 'bootloader' | 'partition' | 'firmware' | null } {
    const lower = assetName.toLowerCase();
    for (const slug of boardSlugs) {
      if (lower.includes(slug)) {
        if (lower.includes('bootloader')) return { slug, type: 'bootloader' };
        if (lower.includes('partition')) return { slug, type: 'partition' };
        if (lower.includes('firmware')) return { slug, type: 'firmware' };
      }
    }
    // fallback for older releases (e.g., just 'bootloader.bin')
    if (lower === 'bootloader.bin' || lower === 'firmware.bin' || lower === 'partitions.bin') {
      if (lower === 'bootloader.bin') return { slug: 'esp32-rainbow', type: 'bootloader' };
      if (lower === 'firmware.bin') return { slug: 'esp32-rainbow', type: 'firmware' };
      if (lower === 'partitions.bin') return { slug: 'esp32-rainbow', type: 'partition' };
    }
    return { slug: null, type: null };
  }

  // Build up releases for each board
  const boardsWithReleases = BOARDS.map(board => {
    let releases: FirmwareRelease[] = githubReleases.map((release: { tag_name: string; name?: string; body?: string; assets?: { name: string; browser_download_url: string; }[]; published_at?: string; }) => {
      const files: FirmwareFile[] = (release.assets || [])
        .map((asset: { name: string; browser_download_url: string; }) => {
          const { slug, type } = parseAsset(asset.name);
          if (slug === board.slug && type) {
            return { type, url: asset.browser_download_url };
          }
          return null;
        })
        .filter((f: FirmwareFile | null): f is FirmwareFile => f !== null);
      if (files.length === 0) return null;
      return {
        version: release.tag_name,
        name: release.name || release.tag_name,
        description: release.body || '',
        files,
        // Optionally, you could add published_at here if you want to expose it
      };
    }).filter((r: FirmwareRelease | null): r is FirmwareRelease => r !== null);

    // Sort releases by published_at (newest first)
    releases = releases.sort((a, b) => {
      const aRelease = githubReleases.find((r: { tag_name: string; published_at?: string }) => (r.tag_name === a.version));
      const bRelease = githubReleases.find((r: { tag_name: string; published_at?: string }) => (r.tag_name === b.version));
      const aDate = aRelease ? new Date(aRelease.published_at ?? 0).getTime() : 0;
      const bDate = bRelease ? new Date(bRelease.published_at ?? 0).getTime() : 0;
      return bDate - aDate;
    });

    return { ...board, releases };
  });

  return boardsWithReleases;
}
