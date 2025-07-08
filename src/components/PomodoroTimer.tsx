'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

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
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pomodoro Timer
          </h1>
          <p className={`text-lg font-medium ${
            sessionType === 'work' 
              ? 'text-emerald-600' 
              : 'text-blue-600'
          }`}>
            {sessionType === 'work' ? 'Work Time' : 'Break Time'}
          </p>
        </div>

        {/* Progress Ring */}
        <div className="relative flex items-center justify-center mb-8">
          <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={sessionType === 'work' ? '#10b981' : '#3b82f6'}
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
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
          <button
            onClick={handleStartPause}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              isActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : sessionType === 'work'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isActive ? (
              <>
                <Pause size={20} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={20} />
                <span>Start</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-6 py-3 rounded-full font-medium bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200"
          >
            <RotateCcw size={20} />
            <span>Reset</span>
          </button>
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
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            isActive
              ? sessionType === 'work'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isActive
                ? sessionType === 'work'
                  ? 'bg-emerald-500'
                  : 'bg-blue-500'
                : 'bg-gray-500'
            }`} />
            {isActive ? 'Active' : 'Paused'}
          </div>
        </div>
      </div>
    </div>
  );
}
