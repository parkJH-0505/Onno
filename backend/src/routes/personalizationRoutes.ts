import { Router } from 'express';
import {
  getUserDomainLevel,
  getAllUserDomainLevels,
  addExperiencePoints,
  rewardMeetingComplete,
  setPersona,
  getPersona,
  addQuestionFeedback,
  hasFeature,
  getAvailableFeatures,
  getXpToNextLevel,
  getPersonalizationContext,
  getUserProgress,
  getLevelHistory
} from '../services/personalizationService.js';
import {
  getCategoryUsageAnalysis,
  getRecentUsageTrend,
  getRecommendedCategories,
  optimizePreferences
} from '../services/userService.js';
import {
  generateUserInsights,
  getRelationshipPatterns
} from '../services/insightService.js';
import type { DomainType, PersonaType, FeedbackRating, MeetingType } from '@prisma/client';

const router = Router();

// ============ 도메인 레벨 조회 ============

// 특정 도메인 레벨 조회
router.get('/users/:userId/domains/:domain/level', async (req, res) => {
  try {
    const { userId, domain } = req.params;
    const level = await getUserDomainLevel(userId, domain as DomainType);
    res.json({ success: true, data: level });
  } catch (error) {
    console.error('Get domain level error:', error);
    res.status(500).json({ success: false, error: '도메인 레벨 조회 실패' });
  }
});

// 모든 도메인 레벨 조회
router.get('/users/:userId/domains', async (req, res) => {
  try {
    const { userId } = req.params;
    const levels = await getAllUserDomainLevels(userId);
    res.json({ success: true, data: levels });
  } catch (error) {
    console.error('Get all domain levels error:', error);
    res.status(500).json({ success: false, error: '도메인 레벨 목록 조회 실패' });
  }
});

// 사용자 전체 진행 상황 조회
router.get('/users/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await getUserProgress(userId);
    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ success: false, error: '진행 상황 조회 실패' });
  }
});

// 다음 레벨까지 남은 XP 조회
router.get('/users/:userId/domains/:domain/next-level', async (req, res) => {
  try {
    const { userId, domain } = req.params;
    const xpInfo = await getXpToNextLevel(userId, domain as DomainType);
    res.json({ success: true, data: xpInfo });
  } catch (error) {
    console.error('Get XP to next level error:', error);
    res.status(500).json({ success: false, error: 'XP 정보 조회 실패' });
  }
});

// 레벨업 히스토리 조회
router.get('/users/:userId/level-history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { domain } = req.query;
    const history = await getLevelHistory(userId, domain as DomainType | undefined);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Get level history error:', error);
    res.status(500).json({ success: false, error: '레벨 히스토리 조회 실패' });
  }
});

// ============ XP 관리 ============

// XP 추가 (수동)
router.post('/users/:userId/domains/:domain/xp', async (req, res) => {
  try {
    const { userId, domain } = req.params;
    const { xp, reason } = req.body;

    if (!xp || typeof xp !== 'number') {
      return res.status(400).json({ success: false, error: 'XP 값이 필요합니다' });
    }

    const result = await addExperiencePoints(userId, domain as DomainType, xp, reason || 'manual');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Add XP error:', error);
    res.status(500).json({ success: false, error: 'XP 추가 실패' });
  }
});

// 회의 완료 보상
router.post('/users/:userId/rewards/meeting-complete', async (req, res) => {
  try {
    const { userId } = req.params;
    const { meetingType, questionsUsed } = req.body;

    const result = await rewardMeetingComplete(
      userId,
      meetingType as MeetingType || 'GENERAL',
      questionsUsed || 0
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Meeting complete reward error:', error);
    res.status(500).json({ success: false, error: '회의 완료 보상 실패' });
  }
});

// ============ 페르소나 관리 ============

// 페르소나 조회
router.get('/users/:userId/domains/:domain/persona', async (req, res) => {
  try {
    const { userId, domain } = req.params;
    const persona = await getPersona(userId, domain as DomainType);
    res.json({ success: true, data: { persona } });
  } catch (error) {
    console.error('Get persona error:', error);
    res.status(500).json({ success: false, error: '페르소나 조회 실패' });
  }
});

// 페르소나 설정
router.put('/users/:userId/domains/:domain/persona', async (req, res) => {
  try {
    const { userId, domain } = req.params;
    const { persona } = req.body;

    if (!persona || !['ANALYST', 'BUDDY', 'GUARDIAN', 'VISIONARY'].includes(persona)) {
      return res.status(400).json({
        success: false,
        error: '유효한 페르소나를 선택하세요 (ANALYST, BUDDY, GUARDIAN, VISIONARY)'
      });
    }

    const result = await setPersona(userId, domain as DomainType, persona as PersonaType);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Set persona error:', error);
    res.status(500).json({ success: false, error: '페르소나 설정 실패' });
  }
});

// ============ 질문 피드백 ============

// 질문 피드백 추가
router.post('/users/:userId/question-feedback', async (req, res) => {
  try {
    const { userId } = req.params;
    const { questionId, rating, tags, comment } = req.body;

    if (!questionId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'questionId와 rating이 필요합니다'
      });
    }

    if (!['THUMBS_UP', 'THUMBS_DOWN'].includes(rating)) {
      return res.status(400).json({
        success: false,
        error: '유효한 rating을 선택하세요 (THUMBS_UP, THUMBS_DOWN)'
      });
    }

    const feedback = await addQuestionFeedback({
      userId,
      questionId,
      rating: rating as FeedbackRating,
      tags: tags || [],
      comment,
    });

    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error('Add question feedback error:', error);
    res.status(500).json({ success: false, error: '피드백 추가 실패' });
  }
});

// ============ 기능 확인 ============

// 특정 기능 해금 여부 확인
router.get('/users/:userId/domains/:domain/features/:feature', async (req, res) => {
  try {
    const { userId, domain, feature } = req.params;
    const hasIt = await hasFeature(userId, domain as DomainType, feature);
    res.json({ success: true, data: { feature, unlocked: hasIt } });
  } catch (error) {
    console.error('Check feature error:', error);
    res.status(500).json({ success: false, error: '기능 확인 실패' });
  }
});

// 모든 해금 기능 조회
router.get('/users/:userId/domains/:domain/features', async (req, res) => {
  try {
    const { userId, domain } = req.params;
    const features = await getAvailableFeatures(userId, domain as DomainType);
    res.json({ success: true, data: features });
  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({ success: false, error: '기능 목록 조회 실패' });
  }
});

// ============ 개인화 컨텍스트 ============

// 회의 시작 시 개인화 컨텍스트 조회
router.get('/users/:userId/personalization-context', async (req, res) => {
  try {
    const { userId } = req.params;
    const { meetingType } = req.query;

    const context = await getPersonalizationContext(
      userId,
      (meetingType as MeetingType) || 'GENERAL'
    );

    res.json({ success: true, data: context });
  } catch (error) {
    console.error('Get personalization context error:', error);
    res.status(500).json({ success: false, error: '개인화 컨텍스트 조회 실패' });
  }
});

// ============ 고급 선호도 분석 (Phase 5-3) ============

// 카테고리별 사용률 분석
router.get('/users/:userId/analytics/category-usage', async (req, res) => {
  try {
    const { userId } = req.params;
    const analysis = await getCategoryUsageAnalysis(userId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Get category usage analysis error:', error);
    res.status(500).json({ success: false, error: '카테고리 분석 실패' });
  }
});

// 최근 사용 트렌드
router.get('/users/:userId/analytics/recent-trend', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days } = req.query;
    const trend = await getRecentUsageTrend(userId, Number(days) || 7);
    res.json({ success: true, data: trend });
  } catch (error) {
    console.error('Get recent trend error:', error);
    res.status(500).json({ success: false, error: '트렌드 분석 실패' });
  }
});

// 추천 카테고리
router.get('/users/:userId/analytics/recommended-categories', async (req, res) => {
  try {
    const { userId } = req.params;
    const recommendations = await getRecommendedCategories(userId);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Get recommended categories error:', error);
    res.status(500).json({ success: false, error: '추천 카테고리 조회 실패' });
  }
});

// 선호도 자동 최적화
router.post('/users/:userId/analytics/optimize-preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = await optimizePreferences(userId);
    res.json({ success: true, data: { optimized: Object.keys(updates).length > 0, updates } });
  } catch (error) {
    console.error('Optimize preferences error:', error);
    res.status(500).json({ success: false, error: '선호도 최적화 실패' });
  }
});

// ============ 패턴 인사이트 (Phase 6-2) ============

// 사용자 패턴 인사이트
router.get('/users/:userId/insights', async (req, res) => {
  try {
    const { userId } = req.params;
    const insights = await generateUserInsights(userId);
    res.json({ success: true, data: insights });
  } catch (error) {
    console.error('Get user insights error:', error);
    res.status(500).json({ success: false, error: '인사이트 조회 실패' });
  }
});

// 관계별 패턴 분석
router.get('/relationships/:relationshipId/patterns', async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const patterns = await getRelationshipPatterns(relationshipId);
    res.json({ success: true, data: patterns });
  } catch (error) {
    console.error('Get relationship patterns error:', error);
    res.status(500).json({ success: false, error: '관계 패턴 조회 실패' });
  }
});

export default router;
