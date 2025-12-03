import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import type { AuthProvider, UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'onno-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// ============ Types ============

export interface AuthResult {
  user: {
    id: string;
    email: string | null;  // Optional for backward compatibility
    name: string | null;
    role: UserRole;
    avatarUrl: string | null;
  };
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
  company?: string;
  jobTitle?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// ============ JWT Helpers ============

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// ============ Auth Functions ============

/**
 * 이메일로 회원가입
 */
export async function register(data: RegisterData): Promise<AuthResult> {
  const { email, password, name, role, company, jobTitle } = data;

  // 이메일 중복 체크
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('이미 가입된 이메일입니다.');
  }

  // 비밀번호 해시
  const passwordHash = await bcrypt.hash(password, 10);

  // 사용자 생성
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: role || 'INVESTOR',
      company,
      jobTitle,
      provider: 'EMAIL',
      preferences: {
        create: {}, // 기본 선호도로 생성
      },
    },
    include: {
      preferences: true,
    },
  });

  // JWT 토큰 생성
  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    token,
  };
}

/**
 * 이메일로 로그인
 */
export async function login(data: LoginData): Promise<AuthResult> {
  const { email, password } = data;

  // 사용자 찾기
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  // 비밀번호 확인
  if (!user.passwordHash) {
    throw new Error('소셜 로그인으로 가입된 계정입니다.');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  // JWT 토큰 생성
  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    token,
  };
}

/**
 * OAuth 로그인 (Google, Kakao)
 */
export async function oauthLogin(data: {
  provider: AuthProvider;
  providerId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}): Promise<AuthResult> {
  const { provider, providerId, email, name, avatarUrl } = data;

  // 기존 사용자 찾기 (provider + providerId로)
  let user = await prisma.user.findFirst({
    where: {
      provider,
      providerId,
    },
  });

  // 없으면 이메일로 찾기
  if (!user) {
    user = await prisma.user.findUnique({
      where: { email },
    });

    // 이메일로 찾았는데 다른 provider면 연결
    if (user && user.provider !== provider) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider,
          providerId,
          avatarUrl: avatarUrl || user.avatarUrl,
        },
      });
    }
  }

  // 없으면 새로 생성
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        provider,
        providerId,
        avatarUrl,
        preferences: {
          create: {},
        },
      },
    });
  }

  // JWT 토큰 생성
  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    token,
  };
}

/**
 * 토큰으로 사용자 정보 조회
 */
export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      preferences: true,
    },
  });

  return user;
}

/**
 * 프로필 업데이트
 */
export async function updateProfile(userId: string, data: {
  name?: string;
  role?: UserRole;
  company?: string;
  jobTitle?: string;
  avatarUrl?: string;
}) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

/**
 * 비밀번호 변경
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.passwordHash) {
    throw new Error('비밀번호를 변경할 수 없습니다.');
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error('현재 비밀번호가 올바르지 않습니다.');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });
}

/**
 * 이메일로 사용자 찾기
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * 게스트 계정 비밀번호 리셋 (서버 초기화용)
 */
export async function resetGuestPassword(email: string, newPassword: string) {
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  return prisma.user.update({
    where: { email },
    data: { passwordHash: newPasswordHash },
  });
}
