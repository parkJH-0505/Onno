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
  const sendIntervalRef = useRef<number | null>(null);
  const onAudioChunkRef = useRef(onAudioChunk);
  const chunkCountRef = useRef(0);

  const { setRecording } = useMeetingStore();

  // onAudioChunk ref 업데이트
  useEffect(() => {
    onAudioChunkRef.current = onAudioChunk;
  }, [onAudioChunk]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunkCountRef.current = 0;

      // 새로운 MediaRecorder를 5초마다 생성하는 방식
      const createAndStartRecorder = () => {
        if (!streamRef.current || !streamRef.current.active) {
          console.log('Stream not active, stopping...');
          return;
        }

        const chunks: Blob[] = [];
        const recorder = new MediaRecorder(streamRef.current, {
          mimeType: 'audio/webm'
        });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          if (chunks.length > 0) {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            if (audioBlob.size > 1000) {
              chunkCountRef.current++;
              console.log(`[${chunkCountRef.current}] Sending audio: ${audioBlob.size} bytes`);
              onAudioChunkRef.current(audioBlob);
            }
          }
        };

        recorder.onerror = (e) => {
          console.error('MediaRecorder error:', e);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;

        // 5초 후 정지 (정지하면 onstop에서 전송)
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, 5000);
      };

      // 첫 번째 녹음 시작
      createAndStartRecorder();

      // 5초마다 새 녹음 시작
      sendIntervalRef.current = window.setInterval(() => {
        createAndStartRecorder();
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
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
      sendIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setRecording(false);
  };

  useEffect(() => {
    return () => {
      if (sendIntervalRef.current) {
        clearInterval(sendIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
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
