import { useState, useRef, useEffect, useCallback } from 'react';
import { useMeetingStore } from '../stores/meetingStore';

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
      // 모든 chunk를 합쳐서 하나의 blob으로 만듦
      const allChunks = chunksRef.current.slice(0, chunksRef.current.length);
      const audioBlob = new Blob(allChunks, { type: 'audio/webm' });

      if (audioBlob.size > 1000) { // 최소 1KB 이상만 전송
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

      // 1초마다 데이터 수집 (작은 chunk로)
      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;

      // 5초마다 누적된 오디오 전송
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

    // 마지막 남은 오디오 전송
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
      // Cleanup on unmount
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

  return (
    <div className="audio-recorder">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`record-button ${isRecording ? 'recording' : ''}`}
      >
        {isRecording ? '⏹️ 정지' : '🎤 녹음 시작'}
      </button>

      {isRecording && (
        <div className="recording-indicator">
          <span className="pulse"></span>
          녹음 중...
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
