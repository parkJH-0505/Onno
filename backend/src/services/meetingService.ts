import prisma from '../lib/prisma.js';
import { MeetingStatus, SpeakerRole, QuestionCategory, QuestionFeedback } from '@prisma/client';

// ============ Meeting CRUD ============

export interface CreateMeetingOptions {
  title?: string;
  userId?: string;
  relationshipObjectId?: string;
  meetingType?: 'INVESTMENT_1ST' | 'INVESTMENT_2ND' | 'IR' | 'DUE_DILIGENCE' | 'MENTORING' | 'GENERAL';
}

export async function createMeeting(options?: CreateMeetingOptions | string) {
  // 하위 호환성: string으로 호출 시 title로 처리
  const opts: CreateMeetingOptions = typeof options === 'string'
    ? { title: options }
    : options || {};

  const { title, userId, relationshipObjectId, meetingType } = opts;

  // 관계 객체와 연결된 경우, 해당 관계의 몇 번째 회의인지 계산
  let meetingNumber = 1;
  if (relationshipObjectId) {
    const count = await prisma.meeting.count({
      where: { relationshipObjectId }
    });
    meetingNumber = count + 1;
  }

  return prisma.meeting.create({
    data: {
      title,
      userId,
      relationshipObjectId,
      meetingType: meetingType || 'GENERAL',
      meetingNumber,
      status: MeetingStatus.ACTIVE,
    },
    include: {
      transcripts: true,
      questions: true,
      relationshipObject: true,
    },
  });
}

export async function getMeeting(id: string) {
  return prisma.meeting.findUnique({
    where: { id },
    include: {
      transcripts: {
        orderBy: { createdAt: 'asc' },
      },
      questions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function getMeetings(options?: {
  status?: MeetingStatus;
  limit?: number;
  offset?: number;
}) {
  const { status, limit = 20, offset = 0 } = options || {};

  return prisma.meeting.findMany({
    where: status ? { status } : undefined,
    orderBy: { startedAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      _count: {
        select: {
          transcripts: true,
          questions: true,
        },
      },
    },
  });
}

export async function updateMeeting(id: string, data: {
  title?: string;
  status?: MeetingStatus;
  summary?: string;
  endedAt?: Date;
  duration?: number;
}) {
  return prisma.meeting.update({
    where: { id },
    data,
    include: {
      transcripts: true,
      questions: true,
    },
  });
}

export interface EndMeetingOptions {
  summary?: string;
  keyQuestions?: string[];
}

export async function endMeeting(id: string, options?: EndMeetingOptions) {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { relationshipObject: true }
  });
  if (!meeting) return null;

  const duration = Math.floor((Date.now() - meeting.startedAt.getTime()) / 1000);

  // 핵심 질문들을 isUsed로 마킹
  if (options?.keyQuestions && options.keyQuestions.length > 0) {
    await prisma.question.updateMany({
      where: {
        meetingId: id,
        text: { in: options.keyQuestions }
      },
      data: { isUsed: true }
    });
  }

  return prisma.meeting.update({
    where: { id },
    data: {
      status: MeetingStatus.ENDED,
      endedAt: new Date(),
      duration,
      summary: options?.summary,
    },
  });
}

export async function deleteMeeting(id: string) {
  return prisma.meeting.delete({
    where: { id },
  });
}

// ============ Transcript CRUD ============

export async function addTranscript(meetingId: string, data: {
  text: string;
  formattedText?: string;
  speaker?: string;
  speakerRole?: 'investor' | 'founder' | 'unknown';
  startTime?: number;
  endTime?: number;
  provider?: string;
  latency?: number;
}) {
  // speakerRole 변환
  let role: SpeakerRole | undefined;
  if (data.speakerRole === 'investor') role = SpeakerRole.INVESTOR;
  else if (data.speakerRole === 'founder') role = SpeakerRole.FOUNDER;
  else if (data.speakerRole === 'unknown') role = SpeakerRole.UNKNOWN;

  return prisma.transcript.create({
    data: {
      meetingId,
      text: data.text,
      formattedText: data.formattedText,
      speaker: data.speaker,
      speakerRole: role,
      startTime: data.startTime,
      endTime: data.endTime,
      provider: data.provider,
      latency: data.latency,
    },
  });
}

export async function getTranscripts(meetingId: string) {
  return prisma.transcript.findMany({
    where: { meetingId },
    orderBy: { createdAt: 'asc' },
  });
}

// ============ Question CRUD ============

export async function addQuestion(meetingId: string, data: {
  text: string;
  category?: string;
  priority?: number;
  context?: string;
}) {
  // category 변환
  let cat: QuestionCategory | undefined;
  const categoryMap: Record<string, QuestionCategory> = {
    'business_model': QuestionCategory.BUSINESS_MODEL,
    'traction': QuestionCategory.TRACTION,
    'team': QuestionCategory.TEAM,
    'market': QuestionCategory.MARKET,
    'technology': QuestionCategory.TECHNOLOGY,
    'financials': QuestionCategory.FINANCIALS,
    'risks': QuestionCategory.RISKS,
    'general': QuestionCategory.GENERAL,
  };
  if (data.category) {
    cat = categoryMap[data.category.toLowerCase()] || QuestionCategory.GENERAL;
  }

  return prisma.question.create({
    data: {
      meetingId,
      text: data.text,
      category: cat,
      priority: data.priority || 0,
      context: data.context,
    },
  });
}

export async function getQuestions(meetingId: string, options?: {
  isUsed?: boolean;
  isFavorite?: boolean;
}) {
  return prisma.question.findMany({
    where: {
      meetingId,
      ...(options?.isUsed !== undefined && { isUsed: options.isUsed }),
      ...(options?.isFavorite !== undefined && { isFavorite: options.isFavorite }),
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

export async function updateQuestionFeedback(id: string, data: {
  isUsed?: boolean;
  isFavorite?: boolean;
  feedback?: 'helpful' | 'not_helpful' | 'skip';
}) {
  let fb: QuestionFeedback | undefined;
  if (data.feedback === 'helpful') fb = QuestionFeedback.HELPFUL;
  else if (data.feedback === 'not_helpful') fb = QuestionFeedback.NOT_HELPFUL;
  else if (data.feedback === 'skip') fb = QuestionFeedback.SKIP;

  return prisma.question.update({
    where: { id },
    data: {
      isUsed: data.isUsed,
      isFavorite: data.isFavorite,
      feedback: fb,
    },
  });
}

// ============ Relationship ============

export async function getMeetingCountForRelationship(relationshipId: string): Promise<number> {
  return prisma.meeting.count({
    where: { relationshipObjectId: relationshipId }
  });
}

// ============ Stats ============

export async function getMeetingStats() {
  const [totalMeetings, totalTranscripts, totalQuestions] = await Promise.all([
    prisma.meeting.count(),
    prisma.transcript.count(),
    prisma.question.count(),
  ]);

  const usedQuestions = await prisma.question.count({
    where: { isUsed: true },
  });

  const helpfulQuestions = await prisma.question.count({
    where: { feedback: QuestionFeedback.HELPFUL },
  });

  return {
    totalMeetings,
    totalTranscripts,
    totalQuestions,
    usedQuestions,
    helpfulQuestions,
    questionUsageRate: totalQuestions > 0 ? (usedQuestions / totalQuestions) * 100 : 0,
  };
}
