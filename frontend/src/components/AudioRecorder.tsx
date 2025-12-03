import { useState, useRef, useEffect } from 'react';
import { useMeetingStore } from '../stores/meetingStore';
import { RecordButton } from './design-system';
import './AudioRecorder.css';

interface AudioRecorderProps {
  onAudioChunk: (blob: Blob) => void;
}

export function AudioRecorder({ onAudioChunk }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const onAudioChunkRef = useRef(onAudioChunk);
  const isSendingRef = useRef(false);

  const { setRecording } = useMeetingStore();

  // onAudioChunk ref 업데이트
  useEffect(() => {
    onAudioChunkRef.current = onAudioChunk;
  }, [onAudioChunk]);

  // 청크 전송 후 비우는 방식 (중복 방지)
  const sendAndClearChunks = () => {
    // 이미 전송 중이면 스킵
    if (isSendingRef.current) {
      console.log('Already sending, skipping...');
      return;
    }

    const chunks = chunksRef.current;
    if (chunks.length === 0) {
      return;
    }

    const audioBlob = new Blob(chunks, { type: 'audio/webm' });

    if (audioBlob.size > 1000) {
      isSendingRef.current = true;
      console.log(`Sending audio: ${audioBlob.size} bytes (${chunks.length} chunks)`);

      // 청크 비우기 (전송 전에 비워서 새 청크와 섞이지 않게)
      chunksRef.current = [];

      onAudioChunkRef.current(audioBlob);
      isSendingRef.current = false;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      isSendingRef.current = false;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setError('녹음 중 오류가 발생했습니다.');
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;

      // 5초마다 전송
      intervalRef.current = window.setInterval(() => {
        sendAndClearChunks();
      }, 5000);

      setIsRecording(true);
      setRecording(true);
      setError(null);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('마이크 접근 권한을 허용해주세요.');
    }
  };

  const stopRecording = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // 마지막 청크 전송
    sendAndClearChunks();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    chunksRef.current = [];
    isSendingRef.current = false;
    setIsRecording(false);
    setRecording(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="audio-recorder-v2">
      <RecordButton
        isRecording={isRecording}
        onClick={handleToggleRecording}
        size="lg"
        showLabel={true}
      />

      {error && (
        <div className="audio-recorder-v2__error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
