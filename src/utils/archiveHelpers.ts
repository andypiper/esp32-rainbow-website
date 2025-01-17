export interface ArchiveFile {
  name: string
  data: Uint8Array
}

export async function findTapeFile(file: File): Promise<ArchiveFile | null> {
  // If it's already a TAP/TZX file, return it directly
  const extension = file.name.toLowerCase().split('.').pop()
  if (extension === 'tap' || extension === 'tzx') {
    const arrayBuffer = await file.arrayBuffer()
    return {
      name: file.name,
      data: new Uint8Array(arrayBuffer)
    }
  }

  // If it's a ZIP file, load JSZip dynamically and process
  if (extension === 'zip') {
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      const contents = await zip.loadAsync(file)
      
      // Find first .tap or .tzx file in the ZIP
      for (const [filename, zipEntry] of Object.entries(contents.files)) {
        const ext = filename.toLowerCase().split('.').pop()
        if ((ext === 'tap' || ext === 'tzx') && !zipEntry.dir) {
          const data = await zipEntry.async('uint8array')
          return {
            name: filename,
            data
          }
        }
      }
    } catch (err) {
      console.error('Error processing ZIP file:', err)
    }
  }

  return null
} 