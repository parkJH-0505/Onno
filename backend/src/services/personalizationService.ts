import prisma from '../lib/prisma.js';
import type {
  DomainType,
  PersonaType,
  FeedbackRating,
  MeetingType
} from '@prisma/client';

// ============ XP 및 레벨 시스템 상수 ============

// 레벨별 필요 XP
const LEVEL_XP_REQUIREMENTS: Record<number, number> = {
  1: 0,       // 시작
  2: 100,    // 회의 10회
  3: 300,    // 회의 30회
  4: 700,    // 회의 70회
  5: 1500,   // 회의 150회
};

// 레벨별 해금 기능
const LEVEL_FEATURES: Record<number, string[]> = {
  1: ['basic_questions'],
  2: ['past_context', 'style_learning'],
  3: ['benchmark', 'risk_detection', 'advanced_questions'],
  4: ['predictive_questions', 'pattern_insights', 'self_coaching'],
  5: ['custom_templates', 'team_sharing', 'ai_tuning'],
};

// XP 획득 규칙
const XP_REWARDS = {
  MEETING_COMPLETE: 10,
  QUESTION_USED: 5,
  FEEDBACK_PROVIDED: 3,
  FOLLOW_UP_COMPLETE: 2,
};

// MeetingType -> DomainType 매핑
const MEETING_TO_DOMAIN: Record<string, DomainType> = {
  'INVESTMENT_1ST': 'INVESTMENT_SCREENING',
  'INVESTMENT_2ND': 'INVESTMENT_SCREENING',
  'IR': 'INVESTMENT_SCREENING',
  'DUE_DILIGENCE': 'INVESTMENT_SCREENING',
  'MENTORING': 'MENTORING',
  'GENERAL': 'GENERAL',
};

// ============ 도메인 레벨 관리 ============

export async function getUserDomainLevel(userId: string, domain: DomainType) {
  let level = await prisma.userDomainLevel.findUnique({
    where: {
      userId_domain: { userId, domain },
    },
  });

  // 없으면 생성
  if (!level) {
    level = await prisma.userDomainLevel.create({
      data: {
        userId,
        domain,
        level: 1,
        experiencePoints: 0,
        unlockedFeatures: LEVEL_FEATURES[1],
        persona: 'ANALYST',
      },
    });
  }

  return level;
}

export async function getAllUserDomainLevels(userId: string) {
  return prisma.userDomainLevel.findMany({
    where: { userId },
    orderBy: { experiencePoints: 'desc' },
  });
}

// XP 추가 및 레벨업 확인
export async function addExperiencePoints(
  userId: string,
  domain: DomainType,
  xp: number,
  reason: string
): Promise<{ newXp: number; leveledUp: boolean; newLevel?: number; newFeatures?: string[] }> {
  const currentLevel = await getUserDomainLevel(userId, domain);
  const newXp = currentLevel.experiencePoints + xp;

  // 다음 레벨 XP 확인
  const currentLevelNum = currentLevel.level;
  const nextLevelNum = currentLevelNum + 1;
  const nextLevelXp = LEVEL_XP_REQUIREMENTS[nextLevelNum];

  // 레벨업 체크
  if (nextLevelXp && newXp >= nextLevelXp && currentLevelNum < 5) {
    const newFeatures = LEVEL_FEATURES[nextLevelNum] || [];
    const existingFeatures = currentLevel.unlockedFeatures || [];
    const allFeatures = [...existingFeatures, ...newFeatures];

    // 레벨업!
    await prisma.userDomainLevel.update({
      where: { userId_domain: { userId, domain } },
      data: {
        experiencePoints: newXp,
        level: nextLevelNum,
        unlockedFeatures: allFeatures,
      },
    });

    // 레벨업 히스토리 기록
    await prisma.levelHistory.create({
      data: {
        userId,
        domain,
        oldLevel: currentLevelNum,
        newLevel: nextLevelNum,
        xpAtLevelUp: newXp,
        newFeatures,
      },
    });

    return {
      newXp,
      leveledUp: true,
      newLevel: nextLevelNum,
      newFeatures,
    };
  }

  // 레벨업 안함
  await prisma.userDomainLevel.update({
    where: { userId_domain: { userId, domain } },
    data: { experiencePoints: newXp },
  });

  return { newXp, leveledUp: false };
}

// 회의 완료 시 XP 지급
export async function rewardMeetingComplete(
  userId: string,
  meetingType: MeetingType,
  questionsUsed: number = 0
) {
  const domain = MEETING_TO_DOMAIN[meetingType] || 'GENERAL';

  // 기본 회의 완료 XP
  const meetingXp = await addExperiencePoints(
    userId,
    domain,
    XP_REWARDS.MEETING_COMPLETE,
    'meeting_complete'
  );

  // 질문 사용 XP (최대 5개까지)
  let questionXp: { newXp: number; leveledUp: boolean; newLevel?: number; newFeatures?: string[] } = {
    newXp: meetingXp.newXp,
    leveledUp: false
  };
  if (questionsUsed > 0) {
    const bonusXp = Math.min(questionsUsed, 5) * XP_REWARDS.QUESTION_USED;
    questionXp = await addExperiencePoints(userId, domain, bonusXp, 'questions_used');
  }

  return {
    domain,  // 도메인 정보 추가
    totalXpEarned: XP_REWARDS.MEETING_COMPLETE + (Math.min(questionsUsed, 5) * XP_REWARDS.QUESTION_USED),
    leveledUp: meetingXp.leveledUp || questionXp.leveledUp,
    newLevel: questionXp.newLevel || meetingXp.newLevel,
    newFeatures: questionXp.newFeatures || meetingXp.newFeatures,
  };
}

// ============ 페르소나 관리 ============

export async function setPersona(
  userId: string,
  domain: DomainType,
  persona: PersonaType
) {
  return prisma.userDomainLevel.update({
    where: { userId_domain: { userId, domain } },
    data: { persona },
  });
}

export async function getPersona(userId: string, domain: DomainType): Promise<PersonaType> {
  const level = await getUserDomainLevel(userId, domain);
  return level.persona;
}

// ============ 질문 피드백 상세 ============

export async function addQuestionFeedback(data: {
  userId: string;
  questionId: string;
  rating: FeedbackRating;
  tags?: string[];
  comment?: string;
}) {
  // 피드백 저장
  const feedback = await prisma.questionFeedbackDetail.create({
    data: {
      userId: data.userId,
      questionId: data.questionId,
      rating: data.rating,
      tags: data.tags || [],
      comment: data.comment,
    },
  });

  // XP 지급
  const question = await prisma.question.findUnique({
    where: { id: data.questionId },
    include: { meeting: true },
  });

  if (question?.meeting) {
    const meetingType = question.meeting.meetingType;
    const domain = MEETING_TO_DOMAIN[meetingType] || 'GENERAL';
    await addExperiencePoints(data.userId, domain, XP_REWARDS.FEEDBACK_PROVIDED, 'feedback');
  }

  // 피드백 기반 선호도 학습
  await learnFromFeedback(data.userId, data.questionId, data.rating, data.tags || []);

  return feedback;
}

// 피드백에서 학습
async function learnFromFeedback(
  userId: string,
  questionId: string,
  rating: FeedbackRating,
  tags: string[]
) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question?.category) return;

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

  const field = categoryFieldMap[question.category];
  if (!field) return;

  // 평가에 따른 조정
  let adjustment = rating === 'THUMBS_UP' ? 0.03 : -0.03;

  // 태그 기반 추가 조정
  if (tags.includes('timing_good')) adjustment += 0.01;
  if (tags.includes('too_aggressive')) adjustment -= 0.02;
  if (tags.includes('helpful')) adjustment += 0.02;
  if (tags.includes('irrelevant')) adjustment -= 0.03;

  // 현재 선호도 가져오기
  const prefs = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  if (!prefs) return;

  const currentValue = (prefs as Record<string, unknown>)[field] as number || 0.5;
  const newValue = Math.max(0, Math.min(1, currentValue + adjustment));

  // 업데이트
  await prisma.userPreferences.update({
    where: { userId },
    data: { [field]: newValue },
  });
}

// ============ 레벨별 기능 확인 ============

export async function hasFeature(
  userId: string,
  domain: DomainType,
  feature: string
): Promise<boolean> {
  const level = await getUserDomainLevel(userId, domain);
  return level.unlockedFeatures.includes(feature);
}

export async function getAvailableFeatures(
  userId: string,
  domain: DomainType
): Promise<string[]> {
  const level = await getUserDomainLevel(userId, domain);
  return level.unlockedFeatures;
}

// 다음 레벨까지 남은 XP
export async function getXpToNextLevel(
  userId: string,
  domain: DomainType
): Promise<{ currentXp: number; nextLevelXp: number | null; remaining: number | null }> {
  const level = await getUserDomainLevel(userId, domain);
  const nextLevelXp = LEVEL_XP_REQUIREMENTS[level.level + 1] || null;

  return {
    currentXp: level.experiencePoints,
    nextLevelXp,
    remaining: nextLevelXp ? nextLevelXp - level.experiencePoints : null,
  };
}

// ============ 레벨별 질문 생성 전략 ============

export interface PersonalizationContext {
  userId: string;
  domain: DomainType;
  level: number;
  persona: PersonaType;
  features: string[];
  preferences: {
    businessModelPref: number;
    tractionPref: number;
    teamPref: number;
    marketPref: number;
    technologyPref: number;
    financialsPref: number;
    risksPref: number;
    tone: string;
    includeExplanation: boolean;
  };
}

export async function getPersonalizationContext(
  userId: string,
  meetingType: MeetingType
): Promise<PersonalizationContext> {
  const domain = MEETING_TO_DOMAIN[meetingType] || 'GENERAL';
  const level = await getUserDomainLevel(userId, domain);

  let prefs = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  // 없으면 기본값 생성
  if (!prefs) {
    prefs = await prisma.userPreferences.create({
      data: { userId },
    });
  }

  return {
    userId,
    domain,
    level: level.level,
    persona: level.persona,
    features: level.unlockedFeatures,
    preferences: {
      businessModelPref: prefs.businessModelPref,
      tractionPref: prefs.tractionPref,
      teamPref: prefs.teamPref,
      marketPref: prefs.marketPref,
      technologyPref: prefs.technologyPref,
      financialsPref: prefs.financialsPref,
      risksPref: prefs.risksPref,
      tone: prefs.tone,
      includeExplanation: prefs.includeExplanation,
    },
  };
}

// ============ 통계 조회 ============

export async function getLevelHistory(userId: string, domain?: DomainType) {
  return prisma.levelHistory.findMany({
    where: {
      userId,
      ...(domain && { domain }),
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

export async function getUserProgress(userId: string) {
  const levels = await getAllUserDomainLevels(userId);
  const history = await getLevelHistory(userId);

  // 총 XP 계산
  const totalXp = levels.reduce((sum, l) => sum + l.experiencePoints, 0);

  // 주요 도메인
  const primaryDomain = levels[0];

  return {
    totalXp,
    primaryDomain: primaryDomain?.domain || 'GENERAL',
    primaryLevel: primaryDomain?.level || 1,
    allDomains: levels.map(l => ({
      domain: l.domain,
      level: l.level,
      xp: l.experiencePoints,
      persona: l.persona,
      features: l.unlockedFeatures,
    })),
    recentLevelUps: history.slice(0, 5),
  };
}
