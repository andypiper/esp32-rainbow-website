import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SerialProvider } from './contexts/SerialContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import FAQ from './pages/FAQ'
import Firmware from './pages/Firmware'
import Docs from './pages/Docs'
import GitHub from './pages/GitHub'
import Emulator from './pages/Emulator'
import { Helmet } from 'react-helmet'

function App() {
  return (
    <SerialProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Helmet>
            <title>ESP32 Rainbow - LED Controller</title>
            <meta name="description" content="Control your ESP32-powered LED strips with ease. Open-source hardware and software solution for creating beautiful LED lighting effects." />
            
            {/* JSON-LD structured data */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "ESP32 Rainbow LED Controller",
                "description": "Control your ESP32-powered LED strips with ease. Open-source hardware and software solution for creating beautiful LED lighting effects.",
                "brand": {
                  "@type": "Brand",
                  "name": "ESP32 Rainbow"
                },
                "offers": {
                  "@type": "Offer",
                  "url": "https://www.crowdsupply.com/atomic14/esp32-rainbow",
                  "availability": "https://schema.org/InStock"
                },
                "url": "https://www.esp32rainbow.com",
                "category": "Electronics",
                "isAccessoryOrSparePartFor": {
                  "@type": "Product",
                  "name": "ESP32 Microcontroller"
                }
              })}
            </script>
          </Helmet>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/firmware" element={<Firmware />} />
              <Route path="/emulator" element={<Emulator />} />
              <Route path="/github" element={<GitHub />} />
              <Route path="*" element={
                <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                  <h1 className="text-4xl font-bold text-gray-100">404 - Page Not Found</h1>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </SerialProvider>
  )
}

export default App
