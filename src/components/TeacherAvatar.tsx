import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TeacherAvatarProps {
  isVisible: boolean;
  isCorrect: boolean;
  onAnimationComplete: () => void;
}

export const TeacherAvatar = ({ isVisible, isCorrect, onAnimationComplete }: TeacherAvatarProps) => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Délai pour l'apparition du message après l'avatar
      const messageTimer = setTimeout(() => {
        setShowMessage(true);
      }, 300);

      // Délai pour faire disparaître l'avatar
      const hideTimer = setTimeout(() => {
        setShowMessage(false);
        onAnimationComplete();
      }, 2500);

      return () => {
        clearTimeout(messageTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setShowMessage(false);
    }
  }, [isVisible, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Avatar qui jaillit du coin */}
      <div
        className={cn(
          "absolute bottom-4 right-4 transform transition-all duration-500 ease-out",
          isVisible ? "translate-x-0 translate-y-0 scale-100 opacity-100" : "translate-x-full translate-y-full scale-50 opacity-0"
        )}
      >
        <div className="relative">
          {/* Avatar avec effet de rebond */}
          <div className={cn(
            "w-20 h-20 rounded-full border-4 transition-all duration-300",
            isCorrect ? "border-green-400 shadow-lg shadow-green-400/50" : "border-red-400 shadow-lg shadow-red-400/50",
            isVisible && "animate-bounce"
          )}>
            <img
              src="/lovable-uploads/d132febc-5880-4c93-89b9-fafda5ade82c.png"
              alt="Professeur"
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          {/* Bulle de dialogue */}
          {showMessage && (
            <div
              className={cn(
                "absolute -top-16 -left-8 px-4 py-2 rounded-full text-white font-bold text-lg shadow-lg transform transition-all duration-300",
                "before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent",
                isCorrect 
                  ? "bg-green-500 before:border-t-green-500 animate-pulse" 
                  : "bg-red-500 before:border-t-red-500 animate-pulse",
                showMessage ? "scale-100 opacity-100" : "scale-0 opacity-0"
              )}
            >
              {isCorrect ? "Juste !" : "Faux !"}
            </div>
          )}

          {/* Particules d'effet */}
          {isVisible && (
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-2 h-2 rounded-full animate-ping",
                    isCorrect ? "bg-green-400" : "bg-red-400"
                  )}
                  style={{
                    top: `${20 + Math.sin(i) * 40}%`,
                    left: `${20 + Math.cos(i) * 40}%`,
                    animationDelay: `${i * 100}ms`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};