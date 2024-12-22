export default function ZXDBCredit() {
  return (
    <div className="bg-gray-700/50 rounded-bl-lg rounded-br-lg p-3 mb-6 text-center">
      <p className="text-sm text-gray-300">
        Data provided by{' '}
        <a 
          href="https://github.com/zxdb/ZXDB" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300"
        >
          ZXDB
        </a>
        , an open database of ZX Spectrum software.
      </p>
    </div>
  );
} 