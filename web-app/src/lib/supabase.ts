import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export type Profile = {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
    organization?: string
    role?: string
    created_at: string
    updated_at: string
}

export type Deal = {
    id: string
    user_id: string
    name: string
    company: string
    stage: 'Sourcing' | 'Screening' | 'IR' | 'DD' | 'Investment' | 'Passed'
    score?: number
    founder?: string
    sector?: string
    revenue?: number
    funding_ask?: number
    valuation?: number
    notes?: string
    tags?: string[]
    status?: string
    created_at: string
    updated_at: string
}

export type Meeting = {
    id: string
    user_id: string
    deal_id?: string
    title: string
    transcript?: string
    summary?: string
    duration?: number
    participants?: string[]
    recording_url?: string
    started_at: string
    ended_at?: string
    created_at: string
    updated_at: string
}

export type Insight = {
    id: string
    meeting_id: string
    type: 'Question' | 'Risk' | 'Fact'
    content: string
    context?: string
    status: 'Pending' | 'Used' | 'Dismissed'
    used_at?: string
    created_at: string
}

export type ActionItem = {
    id: string
    meeting_id: string
    deal_id?: string
    title: string
    description?: string
    assignee?: string
    due_date?: string
    completed: boolean
    completed_at?: string
    created_at: string
    updated_at: string
}

// Helper functions
export async function createDeal(deal: Partial<Deal>) {
    const { data, error } = await supabase
        .from('deals')
        .insert(deal)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getDeals(userId: string) {
    const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function updateDeal(id: string, updates: Partial<Deal>) {
    const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function createMeeting(meeting: Partial<Meeting>) {
    const { data, error } = await supabase
        .from('meetings')
        .insert(meeting)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getMeetings(userId: string, dealId?: string) {
    let query = supabase
        .from('meetings')
        .select('*')
        .eq('user_id', userId)

    if (dealId) {
        query = query.eq('deal_id', dealId)
    }

    const { data, error } = await query.order('started_at', { ascending: false })

    if (error) throw error
    return data
}

export async function saveMeetingInsights(meetingId: string, insights: Partial<Insight>[]) {
    const insightsWithMeetingId = insights.map(insight => ({
        ...insight,
        meeting_id: meetingId
    }))

    const { data, error } = await supabase
        .from('insights')
        .insert(insightsWithMeetingId)
        .select()

    if (error) throw error
    return data
}

export async function updateInsightStatus(
    insightId: string,
    status: 'Pending' | 'Used' | 'Dismissed'
) {
    const updates: any = { status }
    if (status === 'Used') {
        updates.used_at = new Date().toISOString()
    }

    const { data, error } = await supabase
        .from('insights')
        .update(updates)
        .eq('id', insightId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function createActionItem(actionItem: Partial<ActionItem>) {
    const { data, error } = await supabase
        .from('action_items')
        .insert(actionItem)
        .select()
        .single()

    if (error) throw error
    return data
}
