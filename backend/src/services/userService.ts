import prisma from '../lib/prisma.js';
import type { QuestionCategory, QuestionActionType, ToneStyle } from '@prisma/client';

// ============ User CRUD ============

export async function createUser(data: { email?: string; name?: string }) {
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      preferences: {
        create: {}, // 기본 선호도로 생성
      },
    },
    include: {
      preferences: true,
    },
  });
}

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      preferences: true,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      preferences: true,
    },
  });
}

export async function getOrCreateUser(identifier: string) {
  // 먼저 ID로 찾기
  let user = await prisma.user.findUnique({
    where: { id: identifier },
    include: { preferences: true },
  });

  // 없으면 email로 찾기
  if (!user && identifier.includes('@')) {
    user = await prisma.user.findUnique({
      where: { email: identifier },
      include: { preferences: true },
    });
  }

  // 없으면 새로 생성
  if (!user) {
    user = await createUser({
      email: identifier.includes('@') ? identifier : undefined,
      name: identifier.includes('@') ? undefined : identifier,
    });
  }

  return user;
}

// ============ Preferences ============

export async function getUserPreferences(userId: string) {
  let prefs = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  // 없으면 생성
  if (!prefs) {
    prefs = await prisma.userPreferences.create({
      data: { userId },
    });
  }

  return prefs;
}

export async function updateUserPreferences(userId: string, data: {
  businessModelPref?: number;
  tractionPref?: number;
  teamPref?: number;
  marketPref?: number;
  technologyPref?: number;
  financialsPref?: number;
  risksPref?: number;
  tone?: ToneStyle;
  includeExplanation?: boolean;
}) {
  return prisma.userPreferences.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

// ============ Question Actions ============

export async function logQuestionAction(data: {
  userId: string;
  questionId?: string;
  originalText: string;
  category?: QuestionCategory;
  action: QuestionActionType;
  modifiedText?: string;
  meetingId?: string;
}) {
  // 액션 로그 생성
  const actionLog = await prisma.questionAction.create({
    data: {
      userId: data.userId,
      questionId: data.questionId,
      originalText: data.originalText,
      category: data.category,
      action: data.action,
      modifiedText: data.modifiedText,
      meetingId: data.meetingId,
    },
  });

  // 선호도 업데이트
  await updatePreferencesFromAction(data.userId, data.category, data.action);

  // 통계 업데이트
  await updateUserStats(data.userId, data.action);

  return actionLog;
}

// 액션에 따른 선호도 조정
async function updatePreferencesFromAction(
  userId: string,
  category: QuestionCategory | undefined,
  action: QuestionActionType
) {
  if (!category) return;

  // 카테고리별 필드 매핑
  const categoryFieldMap: Record<string, string> = {
    'BUSINESS_MODEL': 'businessModelPref',
    'TRACTION': 'tractionPref',
    'TEAM': 'teamPref',
    'MARKET': 'marketPref',
    'TECHNOLOGY': 'technologyPref',
    'FINANCIALS': 'financialsPref',
    'RISKS': 'risksPref',
  };

  const field = categoryFieldMap[category];
  if (!field) return;

  // 액션에 따른 조정값
  let adjustment = 0;
  switch (action) {
    case 'USED':
      adjustment = 0.05;
      break;
    case 'USED_MODIFIED':
      adjustment = 0.03;
      break;
    case 'IGNORED':
      adjustment = -0.02;
      break;
    case 'DISMISSED':
      adjustment = -0.05;
      break;
  }

  // 현재 선호도 가져오기
  const prefs = await getUserPreferences(userId);
  const currentValue = (prefs as Record<string, unknown>)[field] as number || 0.5;

  // 새 값 계산 (0.0 ~ 1.0 범위 유지)
  const newValue = Math.max(0, Math.min(1, currentValue + adjustment));

  // 업데이트
  await prisma.userPreferences.update({
    where: { userId },
    data: { [field]: newValue },
  });
}

// 통계 업데이트
async function updateUserStats(userId: string, action: QuestionActionType) {
  const isUsed = action === 'USED' || action === 'USED_MODIFIED';

  await prisma.userPreferences.update({
    where: { userId },
    data: {
      totalQuestionsSeen: { increment: 1 },
      ...(isUsed && { totalQuestionsUsed: { increment: 1 } }),
    },
  });
}

// ============ 개인화 질문 우선순위 조정 ============

export interface QuestionWithScore {
  text: string;
  category?: string;
  priority: number;
  originalPriority: number;
  personalizedScore: number;
}

export async function personalizeQuestions(
  userId: string,
  questions: Array<{ text: string; category?: string; priority?: number }>
): Promise<QuestionWithScore[]> {
  const prefs = await getUserPreferences(userId);

  // 카테고리별 선호도 매핑
  const prefMap: Record<string, number> = {
    'business_model': prefs.businessModelPref,
    'traction': prefs.tractionPref,
    'team': prefs.teamPref,
    'market': prefs.marketPref,
    'technology': prefs.technologyPref,
    'financials': prefs.financialsPref,
    'risks': prefs.risksPref,
    'general': 0.5,
  };

  // 각 질문에 개인화 점수 적용
  const scoredQuestions = questions.map(q => {
    const categoryKey = q.category?.toLowerCase() || 'general';
    const prefScore = prefMap[categoryKey] ?? 0.5;
    const originalPriority = q.priority || 0;

    // 개인화 점수 = 원래 우선순위 + (선호도 - 0.5) * 가중치
    const personalizedScore = originalPriority + (prefScore - 0.5) * 10;

    return {
      text: q.text,
      category: q.category,
      priority: Math.round(personalizedScore),
      originalPriority,
      personalizedScore,
    };
  });

  // 개인화 점수로 정렬 (높은 순)
  return scoredQuestions.sort((a, b) => b.personalizedScore - a.personalizedScore);
}

// ============ 통계 조회 ============

export async function getUserStats(userId: string) {
  const prefs = await getUserPreferences(userId);

  const actionCounts = await prisma.questionAction.groupBy({
    by: ['action'],
    where: { userId },
    _count: { action: true },
  });

  const categoryCounts = await prisma.questionAction.groupBy({
    by: ['category'],
    where: { userId, action: { in: ['USED', 'USED_MODIFIED'] } },
    _count: { category: true },
  });

  return {
    preferences: prefs,
    totalSeen: prefs.totalQuestionsSeen,
    totalUsed: prefs.totalQuestionsUsed,
    usageRate: prefs.totalQuestionsSeen > 0
      ? (prefs.totalQuestionsUsed / prefs.totalQuestionsSeen) * 100
      : 0,
    actionBreakdown: actionCounts,
    favoriteCategories: categoryCounts
      .sort((a, b) => b._count.category - a._count.category)
      .slice(0, 3),
  };
}