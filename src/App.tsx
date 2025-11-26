import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to Alpha Marketplace
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A modern marketplace platform built with React, TypeScript, and Tailwind CSS
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2 text-blue-900">Fast</h3>
            <p className="text-gray-700">Built with Vite for lightning-fast development</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2 text-indigo-900">Type-Safe</h3>
            <p className="text-gray-700">TypeScript ensures code reliability</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2 text-purple-900">Beautiful</h3>
            <p className="text-gray-700">Styled with Tailwind CSS</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App
