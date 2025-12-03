// Onno Design System - Theme Configuration
// "조용한 파트너" - 투자자의 숨겨진 통찰력을 깨우는

export const theme = {
  name: 'Onno Design System',
  version: '1.0.0',

  // ============================================
  // COLORS - 다크 모드 기본
  // ============================================
  colors: {
    // Background Layers (깊이감 표현)
    background: {
      abyss: '#0A0A0F',      // 가장 깊은 배경
      base: '#0F0F14',       // 기본 배경
      surface: '#12121A',    // 카드, 패널 배경
      elevated: '#1A1A24',   // 호버, 선택된 상태
      overlay: '#24242E',    // 모달, 드롭다운
    },

    // Primary - Indigo (지적임, 신뢰, 테크)
    primary: {
      default: '#6366F1',
      hover: '#818CF8',
      active: '#4F46E5',
      muted: 'rgba(99, 102, 241, 0.15)',
      subtle: 'rgba(99, 102, 241, 0.08)',
    },

    // Semantic Colors (의미 전달)
    semantic: {
      live: '#EF4444',           // 녹음 중, 라이브
      liveGlow: 'rgba(239, 68, 68, 0.4)',
      insight: '#F59E0B',        // 새 질문, 주목
      insightGlow: 'rgba(245, 158, 11, 0.3)',
      success: '#10B981',        // 연결됨, 완료
      successGlow: 'rgba(16, 185, 129, 0.3)',
      warning: '#F59E0B',
      error: '#EF4444',
    },

    // Text Hierarchy
    text: {
      primary: '#F8FAFC',        // 제목, 중요 텍스트
      secondary: '#94A3B8',      // 본문, 설명
      muted: '#64748B',          // 메타정보, 타임스탬프
      disabled: '#475569',       // 비활성
      inverse: '#0F172A',        // 밝은 배경 위 텍스트
    },

    // Borders
    border: {
      default: 'rgba(255, 255, 255, 0.08)',
      hover: 'rgba(255, 255, 255, 0.12)',
      active: 'rgba(255, 255, 255, 0.16)',
      subtle: 'rgba(255, 255, 255, 0.04)',
    },

    // Glass Effect (글래스모피즘)
    glass: {
      background: 'rgba(255, 255, 255, 0.03)',
      backgroundHover: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(255, 255, 255, 0.12)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    },

    // Category Colors (질문 카테고리)
    category: {
      businessModel: '#8B5CF6',  // Purple
      traction: '#10B981',       // Emerald
      team: '#3B82F6',           // Blue
      market: '#F59E0B',         // Amber
      technology: '#06B6D4',     // Cyan
      financials: '#EC4899',     // Pink
      risks: '#EF4444',          // Red
      general: '#6B7280',        // Gray
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },

    fontSize: {
      xs: '11px',
      sm: '13px',
      base: '15px',
      lg: '17px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
    },

    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.05em',
    },
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  radius: {
    none: '0',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px',
  },

  // ============================================
  // SHADOWS
  // ============================================
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.6)',
    glow: {
      primary: '0 0 20px rgba(99, 102, 241, 0.3)',
      live: '0 0 20px rgba(239, 68, 68, 0.4)',
      success: '0 0 20px rgba(16, 185, 129, 0.3)',
      insight: '0 0 20px rgba(245, 158, 11, 0.3)',
    },
    glass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  },

  // ============================================
  // TRANSITIONS
  // ============================================
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // ============================================
  // Z-INDEX
  // ============================================
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    popover: 400,
    tooltip: 500,
    toast: 600,
  },

  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// ============================================
// COMPONENT STYLE PRESETS
// ============================================
export const componentStyles = {
  // Glass Card
  glassCard: `
    background: ${theme.colors.glass.background};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${theme.colors.glass.border};
    border-radius: ${theme.radius.xl};
    box-shadow: ${theme.shadows.glass};
  `,

  // Button variants
  button: {
    primary: `
      background: ${theme.colors.primary.default};
      color: white;
      border: none;
      transition: all ${theme.transitions.fast};
      &:hover {
        background: ${theme.colors.primary.hover};
        box-shadow: ${theme.shadows.glow.primary};
      }
      &:active {
        background: ${theme.colors.primary.active};
        transform: scale(0.98);
      }
    `,
    secondary: `
      background: transparent;
      color: ${theme.colors.text.primary};
      border: 1px solid ${theme.colors.border.default};
      transition: all ${theme.transitions.fast};
      &:hover {
        background: ${theme.colors.background.elevated};
        border-color: ${theme.colors.border.hover};
      }
    `,
    ghost: `
      background: transparent;
      color: ${theme.colors.text.secondary};
      border: none;
      transition: all ${theme.transitions.fast};
      &:hover {
        color: ${theme.colors.text.primary};
        background: ${theme.colors.background.elevated};
      }
    `,
  },
};

// ============================================
// ANIMATION KEYFRAMES (CSS string for injection)
// ============================================
export const keyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(20px);
    }
  }

  @keyframes slideOutLeft {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-20px);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes breathe {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
    }
  }

  @keyframes ripple {
    0% {
      transform: scale(1);
      opacity: 0.4;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
`;

export default theme;
