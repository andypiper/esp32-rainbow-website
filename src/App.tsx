import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { SerialProvider } from './contexts/SerialContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import FAQ from './pages/FAQ'
import Firmware from './pages/Firmware'
import Docs from './pages/Docs'
import GitHub from './pages/GitHub'
import Emulator from './pages/Emulator'
import Games from './pages/Games'
import GameDetail from './pages/GameDetail'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { initFacebookPixel } from './utils/FacebookPixel'
import Banner from './components/Banner'

// Create a new component to handle route changes and layout
function Layout() {
  const location = useLocation();
  const isEmulatorRoute = location.pathname === '/emulator';

  useEffect(() => {
    const ReactPixel = initFacebookPixel();
    ReactPixel.pageView();
  }, [location]);

  if (isEmulatorRoute) {
    return (
      <main>
        <Routes>
          <Route path="/emulator" element={<Emulator />} />
        </Routes>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Banner />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/firmware" element={<Firmware />} />
          <Route path="/github" element={<GitHub />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="*" element={
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
              <h1 className="text-4xl font-bold text-gray-100">404 - Page Not Found</h1>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <SerialProvider>
        <Router>
          <Helmet>
            <title>ESP32 Rainbow - ZX Spectrum Emulator</title>
            <meta name="description" content="A ZX Spectrum emulator built using an ESP32 microcontroller. Features composite video output, PS/2 keyboard support, and SD card storage for loading games." />
            
            {/* JSON-LD structured data */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "ESP32 Rainbow ZX Spectrum Emulator",
                "description": "A ZX Spectrum emulator built using an ESP32 microcontroller. Features composite video output, PS/2 keyboard support, and SD card storage for loading games.",
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
          <Layout />
        </Router>
      </SerialProvider>
    </HelmetProvider>
  )
}

export default App
