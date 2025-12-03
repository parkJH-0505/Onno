import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  relationshipApi,
  type RelationshipObject,
  type RelationshipType,
  type Industry,
  type FundingStage,
} from '../services/api';
import { Button } from './design-system';
import './RelationshipFormModal.css';

// 라벨 매핑
const TYPE_OPTIONS: Array<{ value: RelationshipType; label: string }> = [
  { value: 'STARTUP', label: '스타트업' },
  { value: 'CLIENT', label: '고객사' },
  { value: 'PARTNER', label: '파트너' },
  { value: 'OTHER', label: '기타' },
];

const INDUSTRY_OPTIONS: Array<{ value: Industry; label: string }> = [
  { value: 'B2B_SAAS', label: 'B2B SaaS' },
  { value: 'B2C_APP', label: 'B2C App' },
  { value: 'ECOMMERCE', label: 'E-Commerce' },
  { value: 'FINTECH', label: 'FinTech' },
  { value: 'HEALTHTECH', label: 'HealthTech' },
  { value: 'EDTECH', label: 'EdTech' },
  { value: 'PROPTECH', label: 'PropTech' },
  { value: 'LOGISTICS', label: 'Logistics' },
  { value: 'AI_ML', label: 'AI/ML' },
  { value: 'BIOTECH', label: 'BioTech' },
  { value: 'OTHER', label: '기타' },
];

const STAGE_OPTIONS: Array<{ value: FundingStage; label: string }> = [
  { value: 'PRE_SEED', label: 'Pre-Seed' },
  { value: 'SEED', label: 'Seed' },
  { value: 'SERIES_A', label: 'Series A' },
  { value: 'SERIES_B', label: 'Series B' },
  { value: 'SERIES_C_PLUS', label: 'Series C+' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'IPO', label: 'IPO' },
  { value: 'OTHER', label: '기타' },
];

interface RelationshipFormModalProps {
  relationship?: RelationshipObject | null;
  onClose: () => void;
  onSave: () => void;
}

export function RelationshipFormModal({
  relationship,
  onClose,
  onSave,
}: RelationshipFormModalProps) {
  const { user } = useAuthStore();
  const isEditing = !!relationship;

  const [name, setName] = useState(relationship?.name || '');
  const [type, setType] = useState<RelationshipType>(relationship?.type || 'STARTUP');
  const [industry, setIndustry] = useState<Industry | ''>(relationship?.industry || '');
  const [stage, setStage] = useState<FundingStage | ''>(relationship?.stage || '');
  const [notes, setNotes] = useState(relationship?.notes || '');
  const [tagsInput, setTagsInput] = useState(relationship?.tags?.join(', ') || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!user?.id) {
      setError('로그인이 필요합니다.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    try {
      setLoading(true);
      setError(null);

      if (isEditing && relationship) {
        await relationshipApi.update(relationship.id, {
          name: name.trim(),
          type,
          industry: industry || undefined,
          stage: stage || undefined,
          notes: notes.trim() || undefined,
          tags,
        });
      } else {
        await relationshipApi.create({
          userId: user.id,
          name: name.trim(),
          type,
          industry: industry || undefined,
          stage: stage || undefined,
          notes: notes.trim() || undefined,
          tags,
        });
      }

      onSave();
    } catch (err) {
      setError(isEditing ? '수정에 실패했습니다.' : '생성에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relationship-form-modal__overlay" onClick={onClose}>
      <div className="relationship-form-modal" onClick={(e) => e.stopPropagation()}>
        <header className="relationship-form-modal__header">
          <h2>{isEditing ? '관계 편집' : '새 관계 추가'}</h2>
          <button className="relationship-form-modal__close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form className="relationship-form-modal__form" onSubmit={handleSubmit}>
          {error && (
            <div className="relationship-form-modal__error">{error}</div>
          )}

          <div className="relationship-form-modal__field">
            <label>이름 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: A팀, B사"
              autoFocus
            />
          </div>

          <div className="relationship-form-modal__field">
            <label>유형</label>
            <div className="relationship-form-modal__radio-group">
              {TYPE_OPTIONS.map((opt) => (
                <label key={opt.value} className="relationship-form-modal__radio">
                  <input
                    type="radio"
                    name="type"
                    value={opt.value}
                    checked={type === opt.value}
                    onChange={(e) => setType(e.target.value as RelationshipType)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="relationship-form-modal__row">
            <div className="relationship-form-modal__field">
              <label>산업</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as Industry | '')}
              >
                <option value="">선택 안함</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relationship-form-modal__field">
              <label>단계</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as FundingStage | '')}
              >
                <option value="">선택 안함</option>
                {STAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relationship-form-modal__field">
            <label>태그</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="쉼표로 구분 (예: AI, SaaS, 유망)"
            />
          </div>

          <div className="relationship-form-modal__field">
            <label>메모</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="자유롭게 메모를 남겨주세요"
              rows={3}
            />
          </div>

          <div className="relationship-form-modal__actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? '저장 중...' : isEditing ? '저장' : '추가'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RelationshipFormModal;
