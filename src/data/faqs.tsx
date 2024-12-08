export type FAQ = {
  question: string;
  answer: string | JSX.Element;
}

export const faqs: FAQ[] = [
  {
    question: "Where can I get one?",
    answer: (
      <div>
        ESP32 Rainbow is available for purchase on Crowd Supply. 
        <div className="mt-3">
          <a
            href="https://www.crowdsupply.com/atomic14/esp32-rainbow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Order now on Crowd Supply
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    )
  },
  {
    question: "What is ESP32 Rainbow?",
    answer: "ESP32 Rainbow is a modern recreation of the Sinclair ZX Spectrum, a classic personal computer from 1982. It features a built-in color LCD display, touch keyboard, microSD card slot for storage, and USB Type-C connectivity, bringing retro computing into the modern era."
  },
  {
    question: "What can I do with ESP32 Rainbow?",
    answer: "You can use it to run both 48K and 128K ZX Spectrum software, write BASIC programs, play classic games, and even develop your own projects. With its QWIIC connectors and expansion port, you can connect external peripherals and sensors for custom applications."
  },
  {
    question: "What are the main specifications?",
    answer: "It features an ESP32-S3 dual-core processor running at 240 MHz, a 320x240 color TFT display, 40-key touch keyboard, built-in 2W speaker, headphone jack, USB Type-C port, microSD slot, and expansion capabilities through QWIIC connectors and GPIO ports."
  },
  {
    question: "Is it open source?",
    answer: (
      <div>
        Yes! ESP32 Rainbow is open hardware available under the GNU General Public License (GPL). 
        All project files are available on GitHub in two repositories:
        <ul className="mt-3 space-y-2">
          <li>
            <a 
              href="https://github.com/atomic14/esp32-zxspectrum"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              ESP32 ZX Spectrum - Emulator firmware and software
            </a>
          </li>
          <li>
            <a 
              href="https://github.com/atomic14/esp32-zxspectrum-hardware"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              ESP32 ZX Spectrum Hardware - PCB designs and schematics
            </a>
          </li>
        </ul>
      </div>
    )
  },
  {
    question: "How much does it cost?",
    answer: "ESP32 Rainbow is priced at $99, making it significantly more affordable than the original ZX Spectrum (which cost £175 in 1982, equivalent to about $1000 today)."
  },
  {
    question: "Where can I get support?",
    answer: "Support is available through detailed documentation and getting started guides on GitHub. We're also setting up a dedicated Discord server for the ESP32 Rainbow community."
  },
  {
    question: "How is it manufactured?",
    answer: "The PCBs are manufactured and assembled by PCBWay in China, with final assembly and comprehensive testing performed in the UK. Distribution is handled by Mouser Electronics through Crowd Supply's fulfillment service."
  }
] 