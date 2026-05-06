import { Helmet } from 'react-helmet-async'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import InfoSection from './components/InfoSection'
import NewsTicker from './components/NewsTicker'
import NewsSlider from './components/NewsSlider'
import ChatPanel from './components/ChatPanel'
import './index.css'

function App() {

  return (
    <main className="min-h-screen flex flex-col">
      <Helmet>
        <title>SansadSaathi — AI Guide to Indian Parliament</title>
        <meta name="description" content="Get real-time insights from the Lok Sabha and interact with our expert AI. Empowering citizens with transparent parliamentary data." />
        <meta property="og:title" content="SansadSaathi — Lok Sabha Expert AI" />
        <meta property="og:description" content="Live news ticker and AI chatbot for the Indian Parliament." />
        <meta name="theme-color" content="#000080" />
      </Helmet>

      <Navbar />
      <div className="mt-24">
        <NewsTicker />
      </div>
      <div className="flex-1">
        <Hero />
        <NewsSlider />
        <InfoSection />
      </div>
      <ChatPanel />
    </main>
  )
}

export default App
