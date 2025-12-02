import { NextRequest, NextResponse } from 'next/server'
import { analyzeConversation } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const { transcript, context } = await request.json()

        if (!transcript) {
            return NextResponse.json(
                { error: 'Transcript is required' },
                { status: 400 }
            )
        }

        const insights = await analyzeConversation(transcript, context)

        return NextResponse.json({ insights })
    } catch (error) {
        console.error('Error in analyze API:', error)
        return NextResponse.json(
            { error: 'Failed to analyze conversation' },
            { status: 500 }
        )
    }
}
