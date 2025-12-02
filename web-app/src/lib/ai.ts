import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
})

export type InsightType = 'Question' | 'Risk' | 'Fact'

export interface Insight {
    id: string
    type: InsightType
    content: string
    context: string
    timestamp: number
}

/**
 * Analyze conversation transcript and generate insights
 */
export async function analyzeConversation(
    transcript: string,
    context?: string
): Promise<Insight[]> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert VC investment analyst. Analyze the conversation and provide:
1. QUESTIONS: Critical questions the investor should ask to verify claims or uncover risks
2. RISKS: Red flags, contradictions, or concerning patterns
3. FACTS: Explanations of technical terms or industry concepts mentioned

Return a JSON array of insights with this structure:
[
  {
    "type": "Question" | "Risk" | "Fact",
    "content": "The insight content",
    "context": "Why this matters or what triggered it"
  }
]

Focus on:
- Unit economics (CAC, LTV, burn rate)
- Market sizing claims
- Technical feasibility
- Team capability signals
- Competitive moat`
                },
                {
                    role: 'user',
                    content: `Analyze this conversation:\n\n${transcript}\n\n${context ? `Additional context: ${context}` : ''}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        })

        const content = response.choices[0]?.message?.content
        if (!content) return []

        // Parse JSON response
        const insights = JSON.parse(content)

        // Add IDs and timestamps
        return insights.map((insight: any, index: number) => ({
            id: `insight-${Date.now()}-${index}`,
            type: insight.type,
            content: insight.content,
            context: insight.context,
            timestamp: Date.now(),
        }))
    } catch (error) {
        console.error('Error analyzing conversation:', error)
        return []
    }
}

/**
 * Generate a meeting summary
 */
export async function generateSummary(transcript: string): Promise<string> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a concise meeting summarizer for VC investors. Create a 3-paragraph summary covering: 1) Key points discussed, 2) Important metrics/data mentioned, 3) Next steps or action items.'
                },
                {
                    role: 'user',
                    content: `Summarize this meeting:\n\n${transcript}`
                }
            ],
            temperature: 0.5,
            max_tokens: 500,
        })

        return response.choices[0]?.message?.content || 'Summary unavailable'
    } catch (error) {
        console.error('Error generating summary:', error)
        return 'Error generating summary'
    }
}

/**
 * Extract structured data from conversation (for CRM sync)
 */
export async function extractDealData(transcript: string) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `Extract key deal information from the conversation. Return JSON:
{
  "company": "Company name",
  "founder": "Founder name",
  "stage": "Seed/Series A/B/C",
  "revenue": "Annual revenue (number only)",
  "funding_ask": "Amount seeking (number only)",
  "sector": "Industry sector",
  "key_metrics": ["metric1", "metric2"]
}`
                },
                {
                    role: 'user',
                    content: transcript
                }
            ],
            temperature: 0.3,
            max_tokens: 300,
        })

        const content = response.choices[0]?.message?.content
        return content ? JSON.parse(content) : null
    } catch (error) {
        console.error('Error extracting deal data:', error)
        return null
    }
}
