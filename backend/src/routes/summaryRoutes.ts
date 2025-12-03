import { Router } from 'express';
import {
  processMeetingEnd,
  getMeetingSummary,
  saveMeetingSummary,
  generateMeetingSummary
} from '../services/summaryService.js';
import prisma from '../lib/prisma.js';

const router = Router();

// ============ 회의 요약 ============

// 회의 요약 조회
router.get('/meetings/:meetingId/summary', async (req, res) => {
  try {
    const { meetingId } = req.params;
    const summary = await getMeetingSummary(meetingId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: '요약을 찾을 수 없습니다'
      });
    }

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Get meeting summary error:', error);
    res.status(500).json({ success: false, error: '요약 조회 실패' });
  }
});

// 회의 요약 생성 (수동)
router.post('/meetings/:meetingId/summary/generate', async (req, res) => {
  try {
    const { meetingId } = req.params;

    // 회의 존재 확인
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: '회의를 찾을 수 없습니다'
      });
    }

    // 요약 생성
    const summary = await processMeetingEnd(meetingId);

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Generate meeting summary error:', error);
    res.status(500).json({ success: false, error: '요약 생성 실패' });
  }
});

// 커스텀 요약 저장 (사용자가 수정한 경우)
router.put('/meetings/:meetingId/summary', async (req, res) => {
  try {
    const { meetingId } = req.params;
    const {
      summary,
      keyPoints,
      decisions,
      actionItems,
      keyQuestions,
      missedQuestions,
      suggestedDataUpdates,
      nextMeetingAgenda
    } = req.body;

    if (!summary) {
      return res.status(400).json({
        success: false,
        error: '요약 내용이 필요합니다'
      });
    }

    const saved = await saveMeetingSummary(meetingId, {
      summary,
      keyPoints: keyPoints || [],
      decisions: decisions || [],
      actionItems: actionItems || [],
      keyQuestions: keyQuestions || [],
      missedQuestions: missedQuestions || [],
      suggestedDataUpdates,
      nextMeetingAgenda: nextMeetingAgenda || [],
    });

    res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Save meeting summary error:', error);
    res.status(500).json({ success: false, error: '요약 저장 실패' });
  }
});

// 요약에서 데이터 업데이트 적용
router.post('/meetings/:meetingId/summary/apply-updates', async (req, res) => {
  try {
    const { meetingId } = req.params;

    // 요약 조회
    const summary = await getMeetingSummary(meetingId);
    if (!summary || !summary.suggestedDataUpdates) {
      return res.status(404).json({
        success: false,
        error: '적용할 업데이트가 없습니다'
      });
    }

    // 회의의 관계 객체 조회
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { relationshipObject: true },
    });

    if (!meeting?.relationshipObjectId) {
      return res.status(400).json({
        success: false,
        error: '이 회의에 연결된 관계 객체가 없습니다'
      });
    }

    // 데이터 업데이트 적용
    const currentData = (meeting.relationshipObject?.structuredData as Record<string, unknown>) || {};
    const updates = summary.suggestedDataUpdates as Record<string, unknown>;

    const mergedData = {
      ...currentData,
      ...updates,
      _lastUpdated: new Date().toISOString(),
      _updateSource: 'summary_apply',
    };

    await prisma.relationshipObject.update({
      where: { id: meeting.relationshipObjectId },
      data: { structuredData: mergedData },
    });

    res.json({
      success: true,
      data: {
        relationshipId: meeting.relationshipObjectId,
        appliedUpdates: updates,
      }
    });
  } catch (error) {
    console.error('Apply summary updates error:', error);
    res.status(500).json({ success: false, error: '업데이트 적용 실패' });
  }
});

// 액션 아이템 완료 처리
router.post('/meetings/:meetingId/summary/action-items/:index/complete', async (req, res) => {
  try {
    const { meetingId, index } = req.params;

    const summary = await prisma.meetingSummary.findUnique({
      where: { meetingId },
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: '요약을 찾을 수 없습니다'
      });
    }

    const actionItems = [...summary.actionItems];
    const idx = parseInt(index);

    if (idx < 0 || idx >= actionItems.length) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 인덱스입니다'
      });
    }

    // 완료 표시 (✓ 추가)
    const currentItem = actionItems[idx];
    if (currentItem && !currentItem.startsWith('✓ ')) {
      actionItems[idx] = '✓ ' + currentItem;
    }

    await prisma.meetingSummary.update({
      where: { meetingId },
      data: { actionItems },
    });

    res.json({
      success: true,
      data: { actionItems }
    });
  } catch (error) {
    console.error('Complete action item error:', error);
    res.status(500).json({ success: false, error: '액션 아이템 완료 처리 실패' });
  }
});

export default router;
