import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import deviceOverview from '../assets/docs/device-overview.png'

const pinoutMarkdown = `
## 1. General-purpose on-board I/O

| Function    | ESP32 GPIO  | Notes                             |
| ----------- | ----------- | --------------------------------- |
| **LED**     | **GPIO 01** | Status / user LED (active-HIGH)   |
| **Speaker/Headphone** | **GPIO 03** | PWM-driven mono speaker |

## 2. TFT display (SPI)

| Signal   | ESP32 GPIO  | Description              |
| -------- | ----------- | ------------------------ |
| **MOSI** | **GPIO 15** | SPI data out to display  |
| **CS**   | **GPIO 16** | Chip-select (active-LOW) |
| **DC**   | **GPIO 17** | Data / command select    |
| **CLK**  | **GPIO 18** | SPI clock                |
| **RST**  | **GPIO 08** | Display hardware reset   |

## 3. micro-SD card socket (SD-MMC 4-bit)

| Signal   | ESP32 GPIO  | Description               |
| -------- | ----------- | ------------------------- |
| **CLK**  | **GPIO 40** | SD-MMC clock              |
| **CMD**  | **GPIO 41** | Command / DI (SPI-MOSI)   |
| **DAT0** | **GPIO 39** | Data 0 / DO (SPI-MISO)    |
| **DAT1** | **GPIO 38** | Data 1                    |
| **DAT2** | **GPIO 02** | Data 2                    |
| **DAT3** | **GPIO 42** | Data 3 / CS (in SPI mode) |

## 4. QWIIC / I2C connectors

Both 4-pin JST-SH sockets share 3V3 & ground; only the I2C lines differ.

| Connector   | **SDA** | **SCL** | Location             |
| ----------- | ------- | ------- | -------------------- |
| **QWIIC-1** | GPIO 05 | GPIO 06 | Next to speaker jack |
| **QWIIC-2** | GPIO 44 | GPIO 43 | Beside SD-card slot  |

## 5. 2x9 Expansion Port (top view)

| Row | Left pin       | Right pin      |
| --- | -------------- | -------------- |
| 1   | **SPEAKER**    | **GND**        |
| 2   | **3V3**        | **5V**         |
| 3   | **TFT RST**    | **TFT SCLK**   |
| 4   | **TFT DC**     | **TFT CS**     |
| 5   | **TFT MOSI**   | **GPIO 07**    |
| 6   | **GPIO 06**    | **GPIO 05**    |
| 7   | **GPIO 04**    | **SDCard DO**  |
| 8   | **SDCard CS**  | **SDCard DI**  |
| 9   | **SDCard CLK** | **GND**        |

*(Header is 2x9 pins, 2.54mm pitch, looking down on the board.)*

## Notes

* All digital I/O is 3V3-tolerant unless stated.
* 5V rail is supplied from USB-C.
`

export default function Pinout() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-100 mb-8">ESP32 Rainbow Pinout Reference</h1>
      <div className="prose prose-invert prose-table:overflow-x-auto bg-gray-800 rounded-lg p-6 text-gray-100">
        <img src={deviceOverview} alt="ESP32 Rainbow Device Overview" className="max-w-full h-auto rounded-lg shadow-md my-4" />
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({...props}) => (
            <img {...props} className="max-w-full h-auto rounded-lg shadow-md my-4" />
          ),
          a: ({...props}) => (
            <a {...props} className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer" />
          ),
          h1: ({...props}) => (
            <h1 {...props} className="text-3xl font-bold mt-8 mb-4" />
          ),
          h2: ({...props}) => (
            <h2 {...props} className="text-2xl font-semibold mt-6 mb-3" />
          ),
          table: ({...props}) => (
            <table {...props} className="table-auto border-collapse border border-gray-700" />
          ),
          th: ({...props}) => (
            <th {...props} className="px-4 py-2 bg-gray-700 text-left" />
          ),
          td: ({...props}) => (
            <td {...props} className="px-4 py-2" />
          )
        }}
      >
        {pinoutMarkdown}
      </ReactMarkdown>
    </div>
    </div>
  )
} 