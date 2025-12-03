import prisma from '../lib/prisma.js';

// ============ 패턴 인사이트 서비스 (Phase 6-2) ============

export interface PatternInsight {
  type: 'strength' | 'improvement' | 'trend' | 'recommendation';
  title: string;
  description: string;
  data?: Record<string, unknown>;
  actionable?: string;
}

export interface UserInsights {
  summary: {
    totalMeetings: number;
    totalQuestions: number;
    avgQuestionsPerMeeting: number;
    questionUsageRate: number;
  };
  patterns: PatternInsight[];
  topCategories: Array<{ category: string; count: number; rate: number }>;
  recentTrend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

// 사용자 패턴 인사이트 생성
export async function generateUserInsights(userId: string): Promise<UserInsights> {
  // 기본 통계 조회
  const meetings = await prisma.meeting.findMany({
    where: { userId, status: 'ENDED' },
    include: {
      questions: true,
    },
    orderBy: { endedAt: 'desc' },
  });

  const totalMeetings = meetings.length;
  const totalQuestions = meetings.reduce((sum, m) => sum + m.questions.length, 0);
  const usedQuestions = meetings.reduce(
    (sum, m) => sum + m.questions.filter(q => q.isUsed).length,
    0
  );

  const avgQuestionsPerMeeting = totalMeetings > 0 ? totalQuestions / totalMeetings : 0;
  const questionUsageRate = totalQuestions > 0 ? (usedQuestions / totalQuestions) * 100 : 0;

  // 카테고리별 통계
  const categoryStats: Record<string, { total: number; used: number }> = {};
  for (const meeting of meetings) {
    for (const question of meeting.questions) {
      const cat = question.category || 'GENERAL';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, used: 0 };
      }
      categoryStats[cat].total++;
      if (question.isUsed) {
        categoryStats[cat].used++;
      }
    }
  }

  const topCategories = Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      count: stats.used,
      rate: stats.total > 0 ? (stats.used / stats.total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 최근 트렌드 분석 (최근 5개 미팅 vs 이전 5개)
  const recentTrend = analyzeRecentTrend(meetings);

  // 패턴 인사이트 생성
  const patterns = generatePatternInsights({
    totalMeetings,
    avgQuestionsPerMeeting,
    questionUsageRate,
    topCategories,
    categoryStats,
  });

  // 추천 사항 생성
  const recommendations = generateRecommendations({
    questionUsageRate,
    topCategories,
    patterns,
  });

  return {
    summary: {
      totalMeetings,
      totalQuestions,
      avgQuestionsPerMeeting: Math.round(avgQuestionsPerMeeting * 10) / 10,
      questionUsageRate: Math.round(questionUsageRate * 10) / 10,
    },
    patterns,
    topCategories,
    recentTrend,
    recommendations,
  };
}

// 최근 트렌드 분석
function analyzeRecentTrend(
  meetings: Array<{ questions: Array<{ isUsed: boolean }> }>
): 'improving' | 'stable' | 'declining' {
  if (meetings.length < 4) return 'stable';

  const recentMeetings = meetings.slice(0, 3);
  const olderMeetings = meetings.slice(3, 6);

  const recentUsageRate = calculateUsageRate(recentMeetings);
  const olderUsageRate = calculateUsageRate(olderMeetings);

  const diff = recentUsageRate - olderUsageRate;

  if (diff > 10) return 'improving';
  if (diff < -10) return 'declining';
  return 'stable';
}

function calculateUsageRate(
  meetings: Array<{ questions: Array<{ isUsed: boolean }> }>
): number {
  const total = meetings.reduce((sum, m) => sum + m.questions.length, 0);
  const used = meetings.reduce(
    (sum, m) => sum + m.questions.filter(q => q.isUsed).length,
    0
  );
  return total > 0 ? (used / total) * 100 : 0;
}

// 패턴 인사이트 생성
function generatePatternInsights(data: {
  totalMeetings: number;
  avgQuestionsPerMeeting: number;
  questionUsageRate: number;
  topCategories: Array<{ category: string; count: number; rate: number }>;
  categoryStats: Record<string, { total: number; used: number }>;
}): PatternInsight[] {
  const insights: PatternInsight[] = [];

  // 강점 분석
  if (data.questionUsageRate >= 70) {
    insights.push({
      type: 'strength',
      title: '높은 질문 활용도',
      description: `AI 질문의 ${data.questionUsageRate.toFixed(0)}%를 활용하고 있습니다. 효과적인 회의 진행을 하고 계십니다.`,
      data: { usageRate: data.questionUsageRate },
    });
  }

  // 주요 관심 카테고리
  const topCat = data.topCategories[0];
  if (topCat && topCat.count >= 3) {
    const categoryLabels: Record<string, string> = {
      BUSINESS_MODEL: '비즈니스 모델',
      TRACTION: '트랙션',
      TEAM: '팀',
      MARKET: '시장',
      TECHNOLOGY: '기술',
      FINANCIALS: '재무',
      RISKS: '리스크',
      GENERAL: '일반',
    };
    insights.push({
      type: 'trend',
      title: '주요 관심 영역',
      description: `'${categoryLabels[topCat.category] || topCat.category}' 카테고리 질문을 가장 많이 활용합니다.`,
      data: { category: topCat.category, count: topCat.count },
    });
  }

  // 개선 필요 영역
  if (data.questionUsageRate < 40 && data.totalMeetings >= 3) {
    insights.push({
      type: 'improvement',
      title: '질문 활용도 개선 기회',
      description: 'AI 질문 활용률이 낮습니다. 회의 중 더 적극적으로 질문을 활용해보세요.',
      actionable: '회의 중 AI 질문 패널을 더 자주 확인해보세요.',
    });
  }

  // 균형 분석
  const usedCategories = Object.entries(data.categoryStats)
    .filter(([_, stats]) => stats.used > 0)
    .length;

  if (usedCategories >= 4) {
    insights.push({
      type: 'strength',
      title: '균형 잡힌 질문 스타일',
      description: `${usedCategories}개의 다양한 카테고리에서 질문을 활용하고 있습니다.`,
    });
  } else if (usedCategories <= 2 && data.totalMeetings >= 5) {
    insights.push({
      type: 'recommendation',
      title: '질문 다양화 추천',
      description: '특정 카테고리에 집중하고 있습니다. 다른 영역의 질문도 활용해보세요.',
      actionable: '팀, 리스크 등 다른 카테고리의 질문도 시도해보세요.',
    });
  }

  return insights;
}

// 추천 사항 생성
function generateRecommendations(data: {
  questionUsageRate: number;
  topCategories: Array<{ category: string; count: number; rate: number }>;
  patterns: PatternInsight[];
}): string[] {
  const recommendations: string[] = [];

  // 활용률 기반 추천
  if (data.questionUsageRate < 30) {
    recommendations.push('회의 중 AI 질문을 더 적극적으로 활용해보세요');
  } else if (data.questionUsageRate > 80) {
    recommendations.push('훌륭합니다! 지금처럼 AI 질문을 효과적으로 활용하세요');
  }

  // 카테고리 기반 추천
  const lowUsageCategories = data.topCategories.filter(c => c.rate < 30);
  const firstLowUsage = lowUsageCategories[0];
  if (firstLowUsage) {
    recommendations.push(
      `${firstLowUsage.category} 카테고리의 질문 활용률이 낮습니다. 해당 영역에 더 관심을 가져보세요`
    );
  }

  // 패턴 기반 추천
  const improvementPatterns = data.patterns.filter(p => p.type === 'improvement');
  for (const pattern of improvementPatterns.slice(0, 2)) {
    if (pattern.actionable) {
      recommendations.push(pattern.actionable);
    }
  }

  return recommendations.slice(0, 5);
}

// 관계별 패턴 분석
export async function getRelationshipPatterns(relationshipId: string) {
  const meetings = await prisma.meeting.findMany({
    where: { relationshipObjectId: relationshipId, status: 'ENDED' },
    include: {
      questions: true,
      transcripts: true,
    },
    orderBy: { endedAt: 'desc' },
  });

  if (meetings.length === 0) {
    return {
      meetingCount: 0,
      patterns: [],
      keyTopics: [],
      progressSummary: null,
    };
  }

  // 키 토픽 추출 (질문 카테고리 기반)
  const topicCounts: Record<string, number> = {};
  for (const meeting of meetings) {
    for (const question of meeting.questions.filter((q: { isUsed: boolean }) => q.isUsed)) {
      const topic = (question as { category?: string }).category || 'GENERAL';
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
  }

  const keyTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  // 진행 상황 요약
  const progressSummary = {
    totalMeetings: meetings.length,
    firstMeeting: meetings[meetings.length - 1]?.startedAt,
    lastMeeting: meetings[0]?.endedAt,
    totalTranscripts: meetings.reduce((sum, m) => sum + m.transcripts.length, 0),
    avgMeetingDuration: calculateAvgDuration(meetings),
  };

  return {
    meetingCount: meetings.length,
    patterns: [],
    keyTopics,
    progressSummary,
  };
}

function calculateAvgDuration(
  meetings: Array<{ startedAt: Date; endedAt: Date | null }>
): number {
  const durations = meetings
    .filter(m => m.endedAt)
    .map(m => (m.endedAt!.getTime() - m.startedAt.getTime()) / 1000 / 60);

  if (durations.length === 0) return 0;
  return Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length);
}
