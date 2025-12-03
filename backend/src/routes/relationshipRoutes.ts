import { Router, type Request, type Response } from 'express';
import prisma from '../lib/prisma.js';
import type { RelationshipType, Industry, FundingStage, RelationshipStatus } from '@prisma/client';

const router = Router();

// ============ 관계 객체 CRUD API ============
// Onno의 핵심 차별점 - 스타트업/고객/파트너별 카드 관리

// 관계 객체 목록 조회
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, type, status, industry, search, limit = '20', offset = '0' } = req.query;

    if (!userId) {
      res.status(400).json({ success: false, error: 'userId는 필수입니다.' });
      return;
    }

    const where: {
      userId: string;
      type?: RelationshipType;
      status?: RelationshipStatus;
      industry?: Industry;
      name?: { contains: string; mode: 'insensitive' };
    } = {
      userId: userId as string,
    };

    if (type) where.type = type as RelationshipType;
    if (status) where.status = status as RelationshipStatus;
    if (industry) where.industry = industry as Industry;
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const [relationships, total] = await Promise.all([
      prisma.relationshipObject.findMany({
        where,
        include: {
          _count: {
            select: { meetings: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: parseInt(limit as string, 10),
        skip: parseInt(offset as string, 10),
      }),
      prisma.relationshipObject.count({ where }),
    ]);

    res.json({
      success: true,
      data: relationships,
      meta: {
        total,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      },
    });
  } catch (error) {
    console.error('Failed to get relationships:', error);
    res.status(500).json({ success: false, error: '관계 목록을 가져오는데 실패했습니다.' });
  }
});

// 관계 객체 생성
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, name, type, industry, stage, notes, tags } = req.body as {
      userId: string;
      name: string;
      type?: RelationshipType;
      industry?: Industry;
      stage?: FundingStage;
      notes?: string;
      tags?: string[];
    };

    if (!userId || !name) {
      res.status(400).json({ success: false, error: 'userId와 name은 필수입니다.' });
      return;
    }

    const relationship = await prisma.relationshipObject.create({
      data: {
        userId,
        name,
        type: type || 'STARTUP',
        industry,
        stage,
        notes,
        tags: tags || [],
      },
    });

    res.json({ success: true, data: relationship });
  } catch (error) {
    console.error('Failed to create relationship:', error);
    res.status(500).json({ success: false, error: '관계 생성에 실패했습니다.' });
  }
});

// 관계 객체 상세 조회
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const relationship = await prisma.relationshipObject.findUnique({
      where: { id },
      include: {
        meetings: {
          orderBy: { startedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            meetingNumber: true,
            meetingType: true,
            startedAt: true,
            endedAt: true,
            status: true,
            duration: true,
            summary: true,
            _count: {
              select: { transcripts: true, questions: true },
            },
          },
        },
        _count: {
          select: { meetings: true },
        },
      },
    });

    if (!relationship) {
      res.status(404).json({ success: false, error: '관계 객체를 찾을 수 없습니다.' });
      return;
    }

    res.json({ success: true, data: relationship });
  } catch (error) {
    console.error('Failed to get relationship:', error);
    res.status(500).json({ success: false, error: '관계 상세를 가져오는데 실패했습니다.' });
  }
});

// 관계 객체 수정
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, industry, stage, status, notes, tags } = req.body as {
      name?: string;
      type?: RelationshipType;
      industry?: Industry;
      stage?: FundingStage;
      status?: RelationshipStatus;
      notes?: string;
      tags?: string[];
    };

    const relationship = await prisma.relationshipObject.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(industry !== undefined && { industry }),
        ...(stage !== undefined && { stage }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(tags && { tags }),
      },
    });

    res.json({ success: true, data: relationship });
  } catch (error) {
    console.error('Failed to update relationship:', error);
    res.status(500).json({ success: false, error: '관계 수정에 실패했습니다.' });
  }
});

// 관계 객체의 구조화 데이터 업데이트 (MRR, CAC 등)
router.patch('/:id/data', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { structuredData, meetingId } = req.body as {
      structuredData: Record<string, unknown>;
      meetingId?: string;
    };

    // 기존 데이터와 병합
    const existing = await prisma.relationshipObject.findUnique({
      where: { id },
      select: { structuredData: true },
    });

    const existingData = (existing?.structuredData as Record<string, unknown>) || {};
    const mergedData = { ...existingData, ...structuredData };

    // 변경 이력 기록 (옵션)
    if (meetingId) {
      mergedData._lastUpdatedFrom = meetingId;
      mergedData._lastUpdatedAt = new Date().toISOString();
    }

    const relationship = await prisma.relationshipObject.update({
      where: { id },
      data: { structuredData: mergedData as object },
    });

    res.json({ success: true, data: relationship });
  } catch (error) {
    console.error('Failed to update relationship data:', error);
    res.status(500).json({ success: false, error: '데이터 업데이트에 실패했습니다.' });
  }
});

// 관계 객체 삭제 (소프트 삭제 - ARCHIVED 상태로 변경)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (permanent === 'true') {
      // 영구 삭제
      await prisma.relationshipObject.delete({ where: { id } });
    } else {
      // 소프트 삭제
      await prisma.relationshipObject.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      });
    }

    res.json({ success: true, message: '삭제되었습니다.' });
  } catch (error) {
    console.error('Failed to delete relationship:', error);
    res.status(500).json({ success: false, error: '관계 삭제에 실패했습니다.' });
  }
});

// 관계 객체의 회의 목록 조회
router.get('/:id/meetings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const meetings = await prisma.meeting.findMany({
      where: { relationshipObjectId: id },
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit as string, 10),
      skip: parseInt(offset as string, 10),
      include: {
        _count: {
          select: { transcripts: true, questions: true },
        },
      },
    });

    res.json({ success: true, data: meetings });
  } catch (error) {
    console.error('Failed to get relationship meetings:', error);
    res.status(500).json({ success: false, error: '회의 목록을 가져오는데 실패했습니다.' });
  }
});

export default router;
