import { useState, useRef, useEffect, useCallback } from 'react';
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
  const lastSentIndexRef = useRef<number>(0);

  const { setRecording } = useMeetingStore();

  // 누적된 오디오를 전송하는 함수
  const sendAccumulatedAudio = useCallback(() => {
    if (chunksRef.current.length > lastSentIndexRef.current) {
      const allChunks = chunksRef.current.slice(0, chunksRef.current.length);
      const audioBlob = new Blob(allChunks, { type: 'audio/webm' });

      if (audioBlob.size > 1000) {
        console.log(`Sending accumulated audio: ${audioBlob.size} bytes (${allChunks.length} chunks)`);
        onAudioChunk(audioBlob);
        lastSentIndexRef.current = chunksRef.current.length;
      }
    }
  }, [onAudioChunk]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      lastSentIndexRef.current = 0;

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

      intervalRef.current = window.setInterval(() => {
        sendAccumulatedAudio();
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

    sendAccumulatedAudio();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    chunksRef.current = [];
    lastSentIndexRef.current = 0;
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
