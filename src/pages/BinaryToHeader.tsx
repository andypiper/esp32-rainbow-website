import { Helmet } from 'react-helmet-async'
import { useState, useCallback } from 'react'

export default function BinaryToHeader() {
  const [customName, setCustomName] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [fileData, setFileData] = useState<Uint8Array | null>(null)
  const [headerContent, setHeaderContent] = useState<string>('')
  const [cppContent, setCppContent] = useState<string>('')

  // Helper to sanitize variable names for C/C++
  function sanitizeName(name: string) {
    let safeName = name.replace(/[^a-zA-Z0-9_]/g, '_')
    if (!/^[a-zA-Z_]/.test(safeName)) {
      safeName = '_' + safeName
    }
    return safeName
  }

  const generateFiles = useCallback((name: string, data: Uint8Array) => {
    const safeName = sanitizeName(name)
    // Generate header file
    const headerFile = `#ifndef __${safeName}_h__\n#define __${safeName}_h__\n#include <cstdint>\n#include <cstddef>\n\nextern const uint8_t ${safeName}[];\nextern const size_t ${safeName}_len;\n#endif // __${safeName}_h__`

    // Generate CPP file
    let cppFile = `#include "${safeName}.h"\n\nextern const size_t ${safeName}_len = ${data.length};\n\nextern const uint8_t ${safeName}[] = {`

    // Format the binary data in rows of 12 bytes
    for (let i = 0; i < data.length; i++) {
      if (i % 12 === 0) {
        cppFile += '\n    '
      }
      cppFile += `0x${data[i].toString(16).padStart(2, '0')}`
      if (i < data.length - 1) {
        cppFile += ', '
      }
    }

    cppFile += '\n};'

    setHeaderContent(headerFile)
    setCppContent(cppFile)
  }, [])

  const handleFile = useCallback(async (file: File) => {
    try {
      setError('')
      
      // Read the file as ArrayBuffer
      const buffer = await file.arrayBuffer()
      const data = new Uint8Array(buffer)
      setFileData(data)
      
      // Extract filename without extension for variable name
      const fullName = file.name
      const baseName = fullName.includes('.') 
        ? fullName.substring(0, fullName.lastIndexOf('.')) 
        : fullName
      
      setCustomName(baseName)
      
      // Generate C/C++ files
      generateFiles(baseName, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    }
  }, [generateFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setCustomName(newName)
    if (fileData) {
      generateFiles(newName, fileData)
    }
  }

  const handleDownload = async () => {
    if (!headerContent || !cppContent) return

    try {
      // Dynamically import JSZip
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      // Add files to the zip
      zip.file(`${customName}.h`, headerContent)
      zip.file(`${customName}.cpp`, cppContent)
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: 'blob' })
      
      // Create download URL
      const url = URL.createObjectURL(content)
      
      // Create and click download link
      const link = document.createElement('a')
      link.href = url
      link.download = `${customName}_header.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      setError('Failed to create ZIP file')
      console.error(err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Binary to C/C++ Header Converter</title>
        <meta name="description" content="Convert binary files to C/C++ header files for embedding data in your applications" />
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">Binary to C/C++ Header Converter</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <p className="mb-4">Convert any binary file to C/C++ header files for embedding in your applications.</p>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'}
            ${error ? 'border-red-500' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="mb-4">
            <label className="cursor-pointer">
              <span className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Select Binary File
              </span>
              <input
                type="file"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-gray-400">or drag and drop your binary file here</p>
        </div>

        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}

        {fileData && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-3">Settings:</h2>
            
            <div className="mb-4 space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Variable name:</label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={customName}
                    onChange={handleCustomNameChange}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full max-w-md"
                    placeholder="Enter variable name"
                  />
                  <span className="text-gray-400 text-sm whitespace-nowrap">
                    Sanitized: <code className="bg-gray-800 px-2 py-1 rounded">{sanitizeName(customName)}</code>
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Only letters, numbers, and underscores allowed. Must start with a letter or underscore for C/C++.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-blue-400">Header File (.h)</h3>
                <pre className="bg-gray-950 p-3 rounded overflow-auto text-gray-300 text-sm h-56">
                  {headerContent}
                </pre>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-blue-400">Implementation File (.cpp)</h3>
                <pre className="bg-gray-950 p-3 rounded overflow-auto text-gray-300 text-sm h-56">
                  {cppContent.length > 500 
                    ? cppContent.substring(0, 500) + '...\n[truncated for preview]' 
                    : cppContent}
                </pre>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-4">
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Download as ZIP
              </button>
              <div className="text-gray-400">
                <span>File size: {fileData.length.toLocaleString()} bytes</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">About Binary to C/C++ Header Conversion</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            Embedding binary data directly into C/C++ code is a common technique for including resources like 
            images, fonts, firmware, or other assets in your application without requiring separate files.
          </p>
          
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Why Use Binary Headers?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Advantages</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Self-contained executables</li>
                  <li>No file I/O required at runtime</li>
                  <li>Resources always available</li>
                  <li>Simplified deployment</li>
                  <li>Works well for embedded systems</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Common Uses</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Firmware images for flashing</li>
                  <li>Font data for displays</li>
                  <li>UI icons and graphics</li>
                  <li>Configuration data</li>
                  <li>Default resources</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Command Line Alternative</h3>
            <p className="mb-2">
              If you prefer a command-line approach, the standard Unix utility <code className="bg-gray-800 px-1 rounded">xxd</code> can 
              be used to generate header files:
            </p>
            <pre className="bg-gray-950 p-3 rounded overflow-auto text-gray-300 text-sm">
{`# Generate a C header with xxd
xxd -i input_file.bin > output_file.h

# With custom variable name
xxd -i -n my_data input_file.bin > output_file.h

# With additional formatting options
xxd -i -C input_file.bin | sed 's/unsigned/const unsigned/g' > output_file.h`}
            </pre>
            <p className="mt-2">
              The <code className="bg-gray-800 px-1 rounded">xxd</code> utility comes pre-installed on most Unix-like systems 
              (Linux, macOS) and is available for Windows through various packages.
            </p>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Using the Generated Headers</h3>
            <p className="mb-2">To use the generated headers in your C/C++ project:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Add both files to your project
                <pre className="bg-gray-950 p-2 rounded ml-5 mt-1 text-sm">
{`myproject/
├── src/
│   ├── main.cpp
│   ├── ${customName || 'data'}.h     // Header file
│   └── ${customName || 'data'}.cpp   // Implementation file`}
                </pre>
              </li>
              <li>
                Include the header in your code
                <pre className="bg-gray-950 p-2 rounded ml-5 mt-1 text-sm">
{`#include "${customName || 'data'}.h"

void someFunction() {
  // Access the data array and its size
  for (size_t i = 0; i < ${customName || 'data'}_len; i++) {
    processByte(${customName || 'data'}[i]);
  }
}`}
                </pre>
              </li>
            </ol>
          </div>

          <p className="italic">
            This online tool provides a convenient alternative to command-line utilities, with the added 
            benefit of proper header guards and modern C++ type definitions.
          </p>
        </div>
      </div>
    </div>
  )
} 