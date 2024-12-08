import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SerialProvider } from './contexts/SerialContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import FAQ from './pages/FAQ'
import Connect from './pages/Connect'
import Machine from './pages/Debug'

function App() {
  return (
    <SerialProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/machine" element={<Machine />} />
              <Route path="/settings" element={
                <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                  <h1 className="text-4xl font-bold text-gray-100">Settings</h1>
                </div>
              } />
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
