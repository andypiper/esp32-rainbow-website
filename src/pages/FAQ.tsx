import { faqs } from '../data/faqs'

export default function FAQ() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-100 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-gray-300">
          Everything you need to know about the ESP32 Rainbow ZX Spectrum
        </p>
      </div>

      <div className="grid gap-6">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group bg-gray-800 rounded-lg shadow-lg border border-gray-700 transition-all duration-200"
          >
            <summary 
              className="flex justify-between items-center cursor-pointer p-6 focus:outline-none list-none"
            >
              <h3 className="text-xl font-semibold text-gray-100 text-left pr-4">
                {faq.question}
              </h3>
              <span className="flex-shrink-0 ml-2">
                <svg
                  className="w-6 h-6 text-gray-400 transform transition-transform duration-200 group-open:rotate-180"
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
              </span>
            </summary>
            <div className="px-6 pb-6 text-gray-300">
              <div className="pt-1 border-t border-gray-700">
                <div className="mt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-300">
          Still have questions?{' '}
          <a 
            href="https://github.com/atomic14/esp32-zxspectrum/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Ask on GitHub
          </a>
        </p>
      </div>
    </div>
  )
}

