import prisma from '../lib/prisma.js';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ============ 회의 요약 생성 ============

export interface MeetingSummaryInput {
  meetingId: string;
  transcripts: Array<{
    text: string;
    speaker?: string | null;
    speakerRole?: string | null;
    startTime?: number | null;
  }>;
  questions: Array<{
    text: string;
    category?: string | null;
    isUsed: boolean;
  }>;
  relationshipContext?: {
    name: string;
    type: string;
    industry?: string | null;
    stage?: string | null;
    structuredData?: Record<string, unknown> | null;
  };
}

export interface GeneratedSummary {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: string[];
  keyQuestions: string[];
  missedQuestions: string[];
  suggestedDataUpdates?: Record<string, unknown>;
  nextMeetingAgenda: string[];
}

// AI 서비스로 요약 생성 요청
export async function generateMeetingSummary(input: MeetingSummaryInput): Promise<GeneratedSummary> {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/summary/generate`, {
      transcripts: input.transcripts,
      questions: input.questions,
      relationship_context: input.relationshipContext,
    });

    if (response.data.success) {
      return response.data.data;
    }

    // AI 서비스 실패 시 폴백
    return generateFallbackSummary(input);
  } catch (error) {
    console.error('AI Summary generation failed:', error);
    return generateFallbackSummary(input);
  }
}

// 폴백 요약 생성 (AI 서비스 실패 시)
function generateFallbackSummary(input: MeetingSummaryInput): GeneratedSummary {
  const transcriptTexts = input.transcripts.map(t => t.text);
  const fullTranscript = transcriptTexts.join(' ');

  // 간단한 키워드 추출
  const keyPoints: string[] = [];
  const keywords = ['MRR', 'CAC', 'LTV', 'Churn', '매출', '투자', '성장률', '팀', '기술'];

  keywords.forEach(keyword => {
    if (fullTranscript.includes(keyword)) {
      const sentences = fullTranscript.split(/[.!?]/).filter(s => s.includes(keyword));
      const firstSentence = sentences[0];
      if (firstSentence) {
        keyPoints.push(firstSentence.trim().slice(0, 100) + '...');
      }
    }
  });

  // 사용된 질문
  const keyQuestions = input.questions
    .filter(q => q.isUsed)
    .map(q => q.text)
    .slice(0, 5);

  // 놓친 질문 (사용 안 된 것)
  const missedQuestions = input.questions
    .filter(q => !q.isUsed)
    .map(q => q.text)
    .slice(0, 5);

  return {
    summary: `회의가 ${input.transcripts.length}개의 발화로 진행되었습니다. ${keyPoints.length}개의 주요 키워드가 논의되었습니다.`,
    keyPoints: keyPoints.slice(0, 5),
    decisions: [],
    actionItems: [],
    keyQuestions,
    missedQuestions,
    nextMeetingAgenda: missedQuestions.slice(0, 3),
  };
}

// ============ 요약 저장 및 조회 ============

export async function saveMeetingSummary(
  meetingId: string,
  summary: GeneratedSummary
) {
  // JSON 타입 변환
  const suggestedUpdates = summary.suggestedDataUpdates
    ? JSON.parse(JSON.stringify(summary.suggestedDataUpdates))
    : undefined;

  return prisma.meetingSummary.upsert({
    where: { meetingId },
    create: {
      meetingId,
      summary: summary.summary,
      keyPoints: summary.keyPoints,
      decisions: summary.decisions,
      actionItems: summary.actionItems,
      keyQuestions: summary.keyQuestions,
      missedQuestions: summary.missedQuestions,
      suggestedDataUpdates: suggestedUpdates,
      nextMeetingAgenda: summary.nextMeetingAgenda,
    },
    update: {
      summary: summary.summary,
      keyPoints: summary.keyPoints,
      decisions: summary.decisions,
      actionItems: summary.actionItems,
      keyQuestions: summary.keyQuestions,
      missedQuestions: summary.missedQuestions,
      suggestedDataUpdates: suggestedUpdates,
      nextMeetingAgenda: summary.nextMeetingAgenda,
    },
  });
}

export async function getMeetingSummary(meetingId: string) {
  return prisma.meetingSummary.findUnique({
    where: { meetingId },
  });
}

// ============ 회의 종료 시 요약 생성 프로세스 ============

export async function processMeetingEnd(meetingId: string) {
  // 회의 데이터 조회
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      transcripts: {
        orderBy: { createdAt: 'asc' },
      },
      questions: true,
      relationshipObject: true,
    },
  });

  if (!meeting) {
    throw new Error('Meeting not found');
  }

  // 요약 생성
  const summary = await generateMeetingSummary({
    meetingId,
    transcripts: meeting.transcripts.map(t => ({
      text: t.text,
      speaker: t.speaker,
      speakerRole: t.speakerRole,
      startTime: t.startTime,
    })),
    questions: meeting.questions.map(q => ({
      text: q.text,
      category: q.category,
      isUsed: q.isUsed,
    })),
    relationshipContext: meeting.relationshipObject ? {
      name: meeting.relationshipObject.name,
      type: meeting.relationshipObject.type,
      industry: meeting.relationshipObject.industry,
      stage: meeting.relationshipObject.stage,
      structuredData: meeting.relationshipObject.structuredData as Record<string, unknown> | null,
    } : undefined,
  });

  // 요약 저장
  await saveMeetingSummary(meetingId, summary);

  // 회의 상태 업데이트
  await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      summary: summary.summary.slice(0, 500), // 짧은 요약만 저장
    },
  });

  // 관계 객체 데이터 업데이트 제안이 있으면 적용
  if (summary.suggestedDataUpdates && meeting.relationshipObjectId) {
    await updateRelationshipData(
      meeting.relationshipObjectId,
      summary.suggestedDataUpdates
    );
  }

  return summary;
}

// 관계 객체 데이터 업데이트
async function updateRelationshipData(
  relationshipId: string,
  updates: Record<string, unknown>
) {
  const relationship = await prisma.relationshipObject.findUnique({
    where: { id: relationshipId },
  });

  if (!relationship) return;

  const currentData = (relationship.structuredData as Record<string, unknown>) || {};
  const mergedData = {
    ...currentData,
    ...updates,
    _lastUpdated: new Date().toISOString(),
    _updateSource: 'meeting_summary',
  };

  await prisma.relationshipObject.update({
    where: { id: relationshipId },
    data: { structuredData: mergedData },
  });
}
