'use client'

import { useState, useEffect } from 'react'

interface Insight {
    id: string
    type: 'Question' | 'Risk' | 'Fact'
    content: string
    context: string
    timestamp?: number
}

export default function HUDPage() {
    const [isExpanded, setIsExpanded] = useState(false)
    const [insights, setInsights] = useState<Insight[]>([])
    const [isRecording, setIsRecording] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    // Simulate live transcription (in real implementation, this would be Deepgram)
    const simulateTranscript = () => {
        const sampleTranscripts = [
            "We've grown from 10K to 200K MRR in 6 months, all organic growth.",
            "Our CAC is around $50 and LTV is approximately $500.",
            "We're using a RAG pipeline to reduce hallucinations in our AI model.",
            "The market size is about $10 billion and growing at 20% annually."
        ]

        let index = 0
        const interval = setInterval(() => {
            if (index < sampleTranscripts.length) {
                setTranscript(prev => prev + ' ' + sampleTranscripts[index])
                index++
            } else {
                clearInterval(interval)
                analyzeTranscript(sampleTranscripts.join(' '))
            }
        }, 3000)

        return () => clearInterval(interval)
    }

    const analyzeTranscript = async (text: string) => {
        setIsAnalyzing(true)
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript: text,
                    context: 'VC investment meeting, Series A stage'
                })
            })

            if (response.ok) {
                const data = await response.json()
                setInsights(data.insights || [])
            }
        } catch (error) {
            console.error('Analysis failed:', error)
            // Fallback to demo insights
            setInsights([
                {
                    id: '1',
                    type: 'Question',
                    content: 'Ask about customer acquisition cost (CAC) breakdown by channel',
                    context: 'Founder mentioned "organic growth" but didn\'t specify metrics'
                },
                {
                    id: '2',
                    type: 'Risk',
                    content: 'Revenue growth claim needs verification (10K to 200K in 6 months = 20x)',
                    context: 'Unusually high growth rate - verify with bank statements'
                },
                {
                    id: '3',
                    type: 'Fact',
                    content: 'RAG Pipeline: Retrieval-Augmented Generation. Combines search with LLM to reduce hallucinations.',
                    context: 'Technical term mentioned'
                }
            ])
        } finally {
            setIsAnalyzing(false)
        }
    }

    const startRecording = () => {
        setIsRecording(true)
        setTranscript('')
        setInsights([])
        simulateTranscript()
    }

    const stopRecording = () => {
        setIsRecording(false)
    }

    const dismissInsight = (id: string) => {
        setInsights(prev => prev.filter(i => i.id !== id))
    }

    const copyInsight = (content: string) => {
        navigator.clipboard.writeText(content)
    }

    return (
        <div className="h-screen w-full flex items-start justify-center pt-4 px-4">
            {isExpanded ? (
                // Active Mode - Expanded Cards
                <div className="w-full max-w-md bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border bg-card/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}></div>
                            <span className="text-sm font-medium">
                                {isRecording ? 'Recording...' : 'Live Intelligence'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Live Transcript Preview */}
                    {isRecording && transcript && (
                        <div className="px-4 py-2 bg-secondary/50 border-b border-border">
                            <p className="text-xs text-muted-foreground mb-1">Live Transcript:</p>
                            <p className="text-sm line-clamp-2">{transcript}</p>
                        </div>
                    )}

                    {/* Insight Cards */}
                    <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                        {isAnalyzing ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : insights.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="text-sm">No insights yet</p>
                                <p className="text-xs mt-1">Start recording to generate insights</p>
                            </div>
                        ) : (
                            insights.map((insight) => (
                                <div
                                    key={insight.id}
                                    className={`p-3 rounded-lg border transition-all hover:shadow-md ${insight.type === 'Question'
                                            ? 'bg-primary/5 border-primary/30'
                                            : insight.type === 'Risk'
                                                ? 'bg-destructive/5 border-destructive/30'
                                                : 'bg-accent/5 border-accent/30'
                                        }`}
                                >
                                    <div className="flex items-start gap-2 mb-2">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${insight.type === 'Question'
                                                ? 'bg-primary/20 text-primary'
                                                : insight.type === 'Risk'
                                                    ? 'bg-destructive/20 text-destructive'
                                                    : 'bg-accent/20 text-accent'
                                            }`}>
                                            {insight.type === 'Question' ? '💡' : insight.type === 'Risk' ? '⚠️' : 'ℹ️'} {insight.type}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium mb-1">{insight.content}</p>
                                    <p className="text-xs text-muted-foreground">{insight.context}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => copyInsight(insight.content)}
                                            className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
                                        >
                                            Copy
                                        </button>
                                        <button
                                            onClick={() => dismissInsight(insight.id)}
                                            className="text-xs px-2 py-1 bg-secondary hover:bg-secondary/80 rounded transition-colors"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 py-3 border-t border-border bg-card/50 flex gap-2">
                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                className="flex-1 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors"
                            >
                                🎙️ Start Recording
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="flex-1 py-2 text-sm font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded transition-colors"
                            >
                                ⏹️ Stop
                            </button>
                        )}
                        <button className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded transition-colors">
                            📌
                        </button>
                    </div>
                </div>
            ) : (
                // Ghost Mode - Orb
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-2xl hover:shadow-primary/50 transition-all hover:scale-110 flex items-center justify-center group relative"
                >
                    <div className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
                        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-white'} animate-pulse`}></div>
                    </div>
                    {insights.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-xs font-bold">
                            {insights.length}
                        </div>
                    )}
                </button>
            )}
        </div>
    )
}
