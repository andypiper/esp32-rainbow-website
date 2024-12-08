import { useState } from 'react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
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
      answer: "Yes! ESP32 Rainbow is open hardware available under the GNU General Public License (GPL). All KiCad project files, including schematics, PCB layouts, and the Bill of Materials, as well as the emulator firmware, are available on GitHub."
    },
    {
      question: "How does it compare to the original ZX Spectrum?",
      answer: "While maintaining compatibility with classic ZX Spectrum software, ESP32 Rainbow modernizes the experience with a built-in color display (instead of TV output), USB and SD card storage (replacing tape storage), and additional features like expansion ports and USB keyboard functionality."
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-gray-100 text-center mb-12">
        Frequently Asked Questions
      </h1>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`
              bg-gray-800 shadow overflow-hidden rounded-lg
              transform transition-all duration-200 
              hover:scale-[1.01] hover:shadow-md
              ring-1 ring-gray-700 hover:ring-indigo-500
            `}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className={`
                w-full px-6 py-5 flex justify-between items-center 
                transition-all duration-150 focus:outline-none
                hover:bg-gray-700
                ${openIndex === index 
                  ? 'hover:rounded-t-lg rounded-t-lg' 
                  : 'hover:rounded-lg rounded-lg'}
              `}
            >
              <span className="text-lg font-semibold text-gray-100 text-left">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ease-in-out ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`
                grid
                transition-all
                duration-300
                ease-in-out
                ${openIndex === index 
                  ? 'grid-rows-[1fr] opacity-100' 
                  : 'grid-rows-[0fr] opacity-0'}
              `}
            >
              <div className="overflow-hidden">
                <div 
                  className={`
                    px-6 pb-5 text-gray-300 
                    transform transition-all duration-300 ease-in-out
                    ${openIndex === index 
                      ? 'translate-y-0 opacity-100' 
                      : '-translate-y-4 opacity-0'}
                  `}
                >
                  {faq.answer}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

