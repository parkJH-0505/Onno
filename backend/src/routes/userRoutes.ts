import { Router, type Request, type Response } from 'express';
import * as userService from '../services/userService.js';
import type { QuestionActionType, QuestionCategory, ToneStyle } from '@prisma/client';

const router = Router();

// ============ User Routes ============

// 사용자 생성 또는 조회
router.post('/', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body as { identifier: string };
    if (!identifier) {
      res.status(400).json({ success: false, error: 'Identifier is required' });
      return;
    }

    const user = await userService.getOrCreateUser(identifier);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Failed to get/create user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get/create user',
    });
  }
});

// 사용자 정보 조회
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const user = await userService.getUser(id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Failed to get user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
    });
  }
});

// ============ Preferences Routes ============

// 사용자 선호도 조회
router.get('/:id/preferences', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const prefs = await userService.getUserPreferences(id);

    res.json({
      success: true,
      data: prefs,
    });
  } catch (error) {
    console.error('Failed to get preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get preferences',
    });
  }
});

// 사용자 선호도 업데이트
router.patch('/:id/preferences', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const data = req.body as {
      businessModelPref?: number;
      tractionPref?: number;
      teamPref?: number;
      marketPref?: number;
      technologyPref?: number;
      financialsPref?: number;
      risksPref?: number;
      tone?: ToneStyle;
      includeExplanation?: boolean;
    };

    const prefs = await userService.updateUserPreferences(id, data);

    res.json({
      success: true,
      data: prefs,
    });
  } catch (error) {
    console.error('Failed to update preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
    });
  }
});

// ============ Question Action Routes ============

// 질문 액션 로깅
router.post('/:id/question-actions', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const { questionId, originalText, category, action, modifiedText, meetingId } = req.body as {
      questionId?: string;
      originalText: string;
      category?: QuestionCategory;
      action: QuestionActionType;
      modifiedText?: string;
      meetingId?: string;
    };

    if (!originalText || !action) {
      res.status(400).json({ success: false, error: 'originalText and action are required' });
      return;
    }

    const actionLog = await userService.logQuestionAction({
      userId,
      questionId,
      originalText,
      category,
      action,
      modifiedText,
      meetingId,
    });

    res.json({
      success: true,
      data: actionLog,
    });
  } catch (error) {
    console.error('Failed to log question action:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log question action',
    });
  }
});

// ============ Personalization Routes ============

// 질문 개인화 적용
router.post('/:id/personalize-questions', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const { questions } = req.body as {
      questions: Array<{ text: string; category?: string; priority?: number }>;
    };

    if (!questions || !Array.isArray(questions)) {
      res.status(400).json({ success: false, error: 'Questions array is required' });
      return;
    }

    const personalizedQuestions = await userService.personalizeQuestions(userId, questions);

    res.json({
      success: true,
      data: personalizedQuestions,
    });
  } catch (error) {
    console.error('Failed to personalize questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to personalize questions',
    });
  }
});

// ============ Stats Routes ============

// 사용자 통계 조회
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const stats = await userService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Failed to get user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user stats',
    });
  }
});

export default router;