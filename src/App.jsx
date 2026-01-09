import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Sparkles, Send } from 'lucide-react'
import { getLuminaGroqResponse } from './services/groq'
import './App.css'

function App() {
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Welcome to Lumina. I am your personal travel connoisseur. Where shall we explore today?" }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const chatEndRef = useRef(null)

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        // Using Groq for reliable service
        const response = await getLuminaGroqResponse([...messages, userMessage])

        setMessages(prev => [...prev, { role: 'ai', content: response }])
        setIsLoading(false)
    }

    return (
        <div className="app-container">
            <div className="glass-panel">
                <header className="app-header">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="header-content"
                    >
                        <div className="logo-wrapper">
                            <Compass className="logo-icon" />
                            <div className="title-stack">
                                <motion.h1
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Lumina
                                    <Sparkles className="spark-icon" />
                                </motion.h1>
                                <p>AI Travel Connoisseur</p>
                            </div>
                        </div>
                    </motion.div>
                </header>

                <div className="chat-window">
                    {messages.map((msg, i) => (
                        <div key={i} className={`message ${msg.role}`}>
                            <div className="message-bubble">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message ai">
                            <div className="message-bubble loading">
                                Lumina is curating your request...
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Tell me your vibe (e.g., 'Cyberpunk Tokyo')..."
                    />
                    <button onClick={handleSend} disabled={isLoading}>
                        {isLoading ? '...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default App
