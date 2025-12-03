import { Router, type Request, type Response } from 'express';
import * as meetingService from '../services/meetingService.js';
import type { MeetingStatus } from '@prisma/client';

const router = Router();

// ============ Meeting Routes ============

// 회의 목록 조회
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, limit, offset } = req.query;

    const meetings = await meetingService.getMeetings({
      status: status as MeetingStatus | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error('Failed to get meetings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get meetings',
    });
  }
});

// 회의 상세 조회
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ success: false, error: 'Meeting ID is required' });
      return;
    }
    const meeting = await meetingService.getMeeting(id);

    if (!meeting) {
      res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
      return;
    }

    res.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Failed to get meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get meeting',
    });
  }
});

// 회의 생성
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title } = req.body as { title?: string };
    const meeting = await meetingService.createMeeting(title);

    res.status(201).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Failed to create meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create meeting',
    });
  }
});

// 회의 수정
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ success: false, error: 'Meeting ID is required' });
      return;
    }
    const { title, status, summary } = req.body as { title?: string; status?: MeetingStatus; summary?: string };

    const meeting = await meetingService.updateMeeting(id, {
      title,
      status,
      summary,
    });

    res.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Failed to update meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update meeting',
    });
  }
});

// 회의 종료
router.post('/:id/end', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ success: false, error: 'Meeting ID is required' });
      return;
    }

    const { summary, keyQuestions } = req.body as {
      summary?: string;
      keyQuestions?: string[];
    };

    const meeting = await meetingService.endMeeting(id, {
      summary,
      keyQuestions,
    });

    if (!meeting) {
      res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
      return;
    }

    res.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Failed to end meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end meeting',
    });
  }
});

// 회의 삭제
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ success: false, error: 'Meeting ID is required' });
      return;
    }
    await meetingService.deleteMeeting(id);

    res.json({
      success: true,
      message: 'Meeting deleted',
    });
  } catch (error) {
    console.error('Failed to delete meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete meeting',
    });
  }
});

// ============ Transcript Routes ============

// 회의 전사 기록 조회
router.get('/:id/transcripts', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ success: false, error: 'Meeting ID is required' });
      return;
    }
    const transcripts = await meetingService.getTranscripts(id);

    res.json({
      success: true,
      data: transcripts,
    });
  } catch (error) {
    console.error('Failed to get transcripts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transcripts',
    });
  }
});

// ============ Question Routes ============

// 회의 질문 목록 조회
router.get('/:id/questions', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ success: false, error: 'Meeting ID is required' });
      return;
    }
    const { isUsed, isFavorite } = req.query;

    const questions = await meetingService.getQuestions(id, {
      isUsed: isUsed ? isUsed === 'true' : undefined,
      isFavorite: isFavorite ? isFavorite === 'true' : undefined,
    });

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error('Failed to get questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get questions',
    });
  }
});

// 질문 피드백 업데이트
router.patch('/questions/:questionId', async (req: Request, res: Response) => {
  try {
    const questionId = req.params.questionId;
    if (!questionId) {
      res.status(400).json({ success: false, error: 'Question ID is required' });
      return;
    }
    const { isUsed, isFavorite, feedback } = req.body as {
      isUsed?: boolean;
      isFavorite?: boolean;
      feedback?: 'helpful' | 'not_helpful' | 'skip';
    };

    const question = await meetingService.updateQuestionFeedback(questionId, {
      isUsed,
      isFavorite,
      feedback,
    });

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('Failed to update question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update question',
    });
  }
});

// ============ Stats Route ============

router.get('/stats/overview', async (_req: Request, res: Response) => {
  try {
    const stats = await meetingService.getMeetingStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats',
    });
  }
});

export default router;
