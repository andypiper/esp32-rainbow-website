import { useState, useEffect } from 'react'
import { getFirmwareReleases, Board, FirmwareRelease } from '../data/firmwareData'
// Use Board, FirmwareRelease, FirmwareFile as inferred types
import { ESPLoader, FlashOptions, LoaderOptions, Transport, IEspLoaderTerminal } from 'esptool-js'
import { getProxyUrl } from '../utils/urls'
import CryptoJS from 'crypto-js'
import ReactMarkdown from 'react-markdown'

export default function Firmware() {
  const isSupported = typeof navigator !== 'undefined' && 'serial' in navigator

  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoardSlug, setSelectedBoardSlug] = useState<string>('')
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [chip, setChip] = useState<string | null>(null)
  const [loadingBoards, setLoadingBoards] = useState(true)

  useEffect(() => {
    setLoadingBoards(true)
    getFirmwareReleases()
      .then((data) => setBoards(data))
      .catch((_err) => setErrorMessage('Failed to fetch firmware releases'))
      .finally(() => setLoadingBoards(false))
  }, [])

  const selectedBoard = boards.find(b => b.slug === selectedBoardSlug) || null
  const availableVersions: FirmwareRelease[] = selectedBoard ? selectedBoard.releases : []
  const selectedFirmware = availableVersions.find(fw => fw.version === selectedVersion) || null

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFirmware || !selectedBoard) return

    class Terminal implements IEspLoaderTerminal {
      write(data: string): void {
        console.log(data)
      }
      clean(): void {
        console.log("Cleaning terminal")
      }
      writeLine(data: string): void {
        console.log(data)
      }
    }

    const terminal = new Terminal();

    let transport: Transport | null = null;
    let port: SerialPort | null = null;
    try {
      setStatus('uploading')
      setUploadProgress(0)
      // Create transport from serial port
      port = await navigator.serial.requestPort()
      transport = new Transport(port, false);

      const loaderOptions = {
        transport,
        baudrate: 115200,
        debugLogging: false,
        terminal,
      } as LoaderOptions;
      const esploader = new ESPLoader(loaderOptions);

      // Connect and identify chip
      const chip = await esploader.main()
      setChip(chip);

      // Prepare file array for flashing
      const fileArray: { data: string; address: number }[] = []

      // Map file type to address
      const addressMap: Record<string, string> = selectedBoard.addresses

      // Fetch all firmware files
      for (const file of selectedFirmware.files) {
        const response = await fetch(getProxyUrl(file.url))
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${file.url}`)
        }
        const arrayBuffer = new Uint8Array(await response.arrayBuffer());
        let data = '';
        const CHUNK_SIZE = 65536;
        for (let i = 0; i < arrayBuffer.length; i += CHUNK_SIZE) {
          const chunk = arrayBuffer.subarray(i, i + CHUNK_SIZE);
          data += String.fromCharCode(...chunk);
        }
        fileArray.push({
          data,
          address: parseInt(addressMap[file.type], 16)
        })
      }
      // Flash the firmware
      const flashOptions: FlashOptions = {
        fileArray,
        flashSize: "keep",
        eraseAll: false,
        compress: true,
        flashMode: 'qio',
        flashFreq: '40m',
        reportProgress: (fileIndex, written, total) => {
          const fileProgress = (written / total);
          const overallProgress = 100 * (fileIndex / fileArray.length + fileProgress / fileArray.length);
          setUploadProgress(Math.round(overallProgress))
        },
        calculateMD5Hash: (image) => CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image)).toString()
      }

      await esploader.writeFlash(flashOptions)
      await esploader.hardReset()
      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload firmware')
    } finally {
      // disconnect the transport
      console.log("Disconnecting transport")
      if (transport) {
        await transport.disconnect();
      }
      console.log("Closing port")
      if (port) {
        if (port.readable) {
          await port.close();
        }
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-100 mb-8">Firmware Update</h1>
      {!isSupported && (
        <div className="mb-8 bg-red-900/30 border border-red-700 rounded-lg p-4 text-gray-100">
          <h2 className="text-sm font-semibold mb-2">Browser Not Supported</h2>
          <p className="text-sm mb-2">
            Your browser doesn't support Web Serial, which is required for firmware updates.
            Please use Chrome, Edge, or Opera to update your firmware.
          </p>
          <p className="text-xs text-gray-400">
            Firefox and Safari currently do not support Web Serial.
          </p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Board Type
            </label>
            <select
              value={selectedBoardSlug}
              onChange={(e) => {
                setSelectedBoardSlug(e.target.value)
                setSelectedVersion('')
                setStatus('idle')
                setErrorMessage('')
              }}
              style={{width: '100%'}}
              disabled={loadingBoards || !isSupported}
              className={`w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-gray-100 ${
                loadingBoards || !isSupported ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Select a board...</option>
              {boards.map(board => (
                <option key={board.slug} value={board.slug}>{board.name}</option>
              ))}
            </select>
          </div>

          {selectedBoard && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Firmware Version
              </label>
              <select
                value={selectedVersion}
                onChange={(e) => {
                  setSelectedVersion(e.target.value)
                  setStatus('idle')
                  setErrorMessage('')
                }}
                style={{width: '100%'}}
                className={`w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-gray-100 ${
                  loadingBoards || !isSupported ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!selectedBoard || loadingBoards}
              >
                <option value="">Select a version...</option>
                {availableVersions.map((fw) => (
                  <option key={`${selectedBoard.slug}-${fw.version}`} value={fw.version}>
                    {fw.version}{fw.name && ` - ${fw.name}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedFirmware && selectedBoard && (
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Version Details</h3>
              <div className="text-sm text-gray-400">
                <ReactMarkdown>{selectedFirmware.description}</ReactMarkdown>
                <div className="mt-3 space-y-1">
                  <p className="text-gray-300">Files to be flashed:</p>
                  {selectedFirmware.files.map((file, index) => (
                    <p key={index} className="pl-4">
                      • {file.type} at {selectedBoard.addresses[file.type]}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {status === 'uploading' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-red-400 bg-red-900/30 border border-red-700 rounded-md p-3">
              {errorMessage}
            </div>
          )}

          { chip && selectedBoard && (
            <div className="text-gray-300 bg-gray-900/30 border border-gray-700 rounded-md p-3">
              Connected to board: {selectedBoard.name} ({chip})
            </div>
          )}

          {status === 'success' && (
            <div className="text-green-400 bg-green-900/30 border border-green-700 rounded-md p-3">
              Firmware updated successfully! The device will restart automatically.
            </div>
          )}

          <button
            type="submit"
            disabled={
              !isSupported || 
              !selectedFirmware || 
              status === 'uploading' ||
              loadingBoards
            }
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md\n              hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500\n              disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed\n              transition-colors duration-150"
          >
            {!isSupported ? 'Browser Not Supported' : 
             loadingBoards ? 'Loading...' :
             !selectedFirmware ? 'Select Firmware Version' :
             status === 'uploading' ? `Uploading... ${uploadProgress}%` : 
             'Connect and Upload'}
          </button>
        </form>
      </div>

      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-300">
          <li>Connect your ESP32 Rainbow device via USB</li>
          <li>
            Put the device in firmware upload mode:
            <ol className="list-[a-z] pl-8 pt-2 space-y-1">
              <li>Press and hold the BOOT button</li>
              <li>Press and release the RESET button</li>
              <li>Release the BOOT button</li>
            </ol>
          </li>
          <li>Select the firmware version to install</li>
          <li>Click Upload Firmware</li>
          <li>Wait for the upload to complete</li>
          <li>Press the RESET button to start the device with the new firmware</li>
        </ol>

        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-400 mb-2">Important Note</h3>
          <p className="text-sm text-gray-300">
            Do not disconnect the device or close this page during the firmware upload process. 
            Interrupting the upload could leave your device in an unusable state.
          </p>
        </div>
      </div>
    </div>
  )
} 