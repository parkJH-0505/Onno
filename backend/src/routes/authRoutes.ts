import { Router, type Request, type Response } from 'express';
import * as authService from '../services/authService.js';
import type { UserRole } from '@prisma/client';

const router = Router();

// ============ 회원가입 ============

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, company, jobTitle } = req.body as {
      email: string;
      password: string;
      name?: string;
      role?: UserRole;
      company?: string;
      jobTitle?: string;
    };

    // 유효성 검사
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: '이메일과 비밀번호는 필수입니다.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: '비밀번호는 6자 이상이어야 합니다.',
      });
      return;
    }

    const result = await authService.register({
      email,
      password,
      name,
      role,
      company,
      jobTitle,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Register error:', error);
    const message = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
    res.status(400).json({
      success: false,
      error: message,
    });
  }
});

// ============ 로그인 ============

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: '이메일과 비밀번호는 필수입니다.',
      });
      return;
    }

    const result = await authService.login({ email, password });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : '로그인에 실패했습니다.';
    res.status(401).json({
      success: false,
      error: message,
    });
  }
});

// ============ 현재 사용자 정보 ============

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: '인증이 필요합니다.',
      });
      return;
    }

    const token = authHeader.split(' ')[1] || '';
    const user = await authService.getUserFromToken(token);

    if (!user) {
      res.status(401).json({
        success: false,
        error: '유효하지 않은 토큰입니다.',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        jobTitle: user.jobTitle,
        avatarUrl: user.avatarUrl,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: '사용자 정보를 가져오는데 실패했습니다.',
    });
  }
});

// ============ 프로필 업데이트 ============

router.patch('/profile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: '인증이 필요합니다.',
      });
      return;
    }

    const token = authHeader.split(' ')[1] || '';
    const payload = authService.verifyToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        error: '유효하지 않은 토큰입니다.',
      });
      return;
    }

    const { name, role, company, jobTitle } = req.body as {
      name?: string;
      role?: UserRole;
      company?: string;
      jobTitle?: string;
    };

    const user = await authService.updateProfile(payload.userId, {
      name,
      role,
      company,
      jobTitle,
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        jobTitle: user.jobTitle,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 업데이트에 실패했습니다.',
    });
  }
});

// ============ 비밀번호 변경 ============

router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: '인증이 필요합니다.',
      });
      return;
    }

    const token = authHeader.split(' ')[1] || '';
    const payload = authService.verifyToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        error: '유효하지 않은 토큰입니다.',
      });
      return;
    }

    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: '현재 비밀번호와 새 비밀번호는 필수입니다.',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: '새 비밀번호는 6자 이상이어야 합니다.',
      });
      return;
    }

    await authService.changePassword(payload.userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: '비밀번호가 변경되었습니다.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    const message = error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.';
    res.status(400).json({
      success: false,
      error: message,
    });
  }
});

// ============ 토큰 검증 ============

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body as { token: string };

    if (!token) {
      res.status(400).json({
        success: false,
        error: '토큰이 필요합니다.',
      });
      return;
    }

    const user = await authService.getUserFromToken(token);

    if (!user) {
      res.status(401).json({
        success: false,
        valid: false,
      });
      return;
    }

    res.json({
      success: true,
      valid: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
    });
  }
});

export default router;
