'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Chip, CircularProgress } from '@heroui/react';

interface PomodoroTimerProps {
  className?: string;
}

export default function PomodoroTimer({ className = '' }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    // Create a simple beep sound using data URL
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ8WbLvs159NEAxQp+PwtmMcBzuR1O7jnThFcNbsxqiOGQ==';
    audioRef.current.volume = 0.3;
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleSessionComplete = useCallback(() => {
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      });
    }

    if (sessionType === 'work') {
      setSessionCount(prev => prev + 1);
      setSessionType('break');
      setTimeLeft(5 * 60); // 5 minutes break
    } else {
      setSessionType('work');
      setTimeLeft(25 * 60); // 25 minutes work
    }
    setIsActive(false);
  }, [sessionType]);

  // Timer countdown logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      handleSessionComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, handleSessionComplete]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = sessionType === 'work' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 ${className}`}>
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Pomodoro Timer
            </h1>
            <Chip 
              color={sessionType === 'work' ? 'success' : 'primary'}
              variant="flat"
              size="lg"
              className="text-lg font-medium"
            >
              {sessionType === 'work' ? 'Work Time' : 'Break Time'}
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="pt-4">

        {/* Progress Ring */}
        <div className="relative flex items-center justify-center mb-8">
          <CircularProgress
            size="lg"
            value={progress}
            color={sessionType === 'work' ? 'success' : 'primary'}
            strokeWidth={6}
            className="w-64 h-64"
            classNames={{
              svg: "w-64 h-64",
              track: "stroke-gray-300/20",
              indicator: "stroke-current"
            }}
          />
          {/* Timer Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(progress)}% Complete
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <Button
            onClick={handleStartPause}
            color={isActive ? 'danger' : (sessionType === 'work' ? 'success' : 'primary')}
            variant="solid"
            size="lg"
            className="font-medium"
            startContent={isActive ? <Pause size={20} /> : <Play size={20} />}
          >
            {isActive ? 'Pause' : 'Start'}
          </Button>
          
          <Button
            onClick={handleReset}
            color="default"
            variant="solid"
            size="lg"
            className="font-medium"
            startContent={<RotateCcw size={20} />}
          >
            Reset
          </Button>
        </div>

        {/* Session Counter */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {sessionCount}
          </div>
          <p className="text-sm text-gray-600">
            {sessionCount === 1 ? 'Session' : 'Sessions'} Completed
          </p>
        </div>

        {/* Status Indicator */}
        <div className="mt-6 text-center">
          <Chip
            color={isActive ? (sessionType === 'work' ? 'success' : 'primary') : 'default'}
            variant="flat"
            startContent={
              <div className={`w-2 h-2 rounded-full ${
                isActive
                  ? sessionType === 'work'
                    ? 'bg-emerald-500'
                    : 'bg-blue-500'
                  : 'bg-gray-500'
              }`} />
            }
          >
            {isActive ? 'Active' : 'Paused'}
          </Chip>
        </div>
        </CardBody>
      </Card>
    </div>
  );
}
