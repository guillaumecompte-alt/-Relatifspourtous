import { useState, useCallback } from 'react';

export interface Question {
  id: number;
  type: number;
  numbers: number[];
  expression: string;
  answer: number;
  isGap?: boolean; // Pour les questions à trou (types 3 et 4)
}

export interface GameState {
  currentQuestion: Question | null;
  questionNumber: number;
  currentType: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  totalCorrect: number;
  totalWrong: number;
  isComplete: boolean;
  userAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
}

const TOTAL_QUESTIONS = 10;

const generateRandomNumber = (min: number, max: number, decimal: boolean = false): number => {
  if (decimal) {
    const num = Math.random() * (max - min) + min;
    return Math.round(num * 10) / 10;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const formatNumber = (num: number): string => {
  return num.toString().replace('.', ',');
};

const generateQuestion = (type: number, id: number): Question => {
  let numbers: number[] = [];
  let expression = '';
  let answer = 0;
  let isGap = false;

  switch (type) {
    case 1: // a-b=? avec entiers relatifs entre -10 et 10 (pas de 0, éviter a et b positifs ET a > b)
      do {
        numbers = [
          generateRandomNumber(-10, 10),
          generateRandomNumber(-10, 10)
        ];
      } while (
        numbers[0] === 0 || 
        numbers[1] === 0 || 
        (numbers[0] > 0 && numbers[1] > 0 && numbers[0] > numbers[1])
      );
      expression = `${formatNumber(numbers[0])} - ${numbers[1] >= 0 ? formatNumber(numbers[1]) : `(${formatNumber(numbers[1])})`}`;
      answer = numbers[0] - numbers[1];
      break;
      
    case 2: // a-b=? avec décimaux relatifs entre -10 et 10 (une décimale, pas de 0)
      do {
        numbers = [
          generateRandomNumber(-10, 10, true),
          generateRandomNumber(-10, 10, true)
        ];
      } while (numbers[0] === 0 || numbers[1] === 0);
      expression = `${formatNumber(numbers[0])} - ${numbers[1] >= 0 ? formatNumber(numbers[1]) : `(${formatNumber(numbers[1])})`}`;
      answer = Math.round((numbers[0] - numbers[1]) * 10) / 10;
      break;
      
    case 3: // a-(...)=c avec entiers relatifs entre -10 et 10
      do {
        numbers = [
          generateRandomNumber(-10, 10), // a
          generateRandomNumber(-10, 10)  // c
        ];
      } while (numbers[0] === 0 || numbers[1] === 0);
      // La réponse est b = a - c
      answer = numbers[0] - numbers[1];
      expression = `${formatNumber(numbers[0])} - (...) = ${formatNumber(numbers[1])}`;
      isGap = true;
      break;
      
    case 4: // a-(...)=c avec décimaux relatifs entre -10 et 10 (une décimale)
      do {
        numbers = [
          generateRandomNumber(-10, 10, true), // a
          generateRandomNumber(-10, 10, true)  // c
        ];
      } while (numbers[0] === 0 || numbers[1] === 0);
      // La réponse est b = a - c
      answer = Math.round((numbers[0] - numbers[1]) * 10) / 10;
      expression = `${formatNumber(numbers[0])} - (...) = ${formatNumber(numbers[1])}`;
      isGap = true;
      break;
      
    case 5: // a-b=? avec entiers relatifs entre -100 et -10
      do {
        numbers = [
          generateRandomNumber(-100, -10),
          generateRandomNumber(-100, -10)
        ];
      } while (numbers[0] === 0 || numbers[1] === 0); // Normalement impossible avec cette plage mais par sécurité
      expression = `${formatNumber(numbers[0])} - (${formatNumber(numbers[1])})`;
      answer = numbers[0] - numbers[1];
      break;
      
    default:
      numbers = [1, 1];
      expression = `${formatNumber(numbers[0])} - ${formatNumber(numbers[1])}`;
      answer = 0;
  }

  return { id, type, numbers, expression, answer, isGap };
};

const playSound = (isCorrect: boolean) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (isCorrect) {
      // Son de succès avec plusieurs notes ascendantes
      const frequencies = [523.25, 659.25, 783.99]; // Do, Mi, Sol
      const duration = 0.15;
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (index * duration);
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } else {
      // Son d'échec
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 220; // La grave
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  } catch (error) {
    // Fallback silencieux si l'audio ne peut pas être joué
  }
};

export const useSubtractionGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: null,
    questionNumber: 0,
    currentType: 1,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    totalCorrect: 0,
    totalWrong: 0,
    isComplete: false,
    userAnswer: '',
    showResult: false,
    isCorrect: false,
  });

  const startGame = useCallback(() => {
    const firstQuestion = generateQuestion(1, 1);
    setGameState({
      currentQuestion: firstQuestion,
      questionNumber: 1,
      currentType: 1,
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      totalCorrect: 0,
      totalWrong: 0,
      isComplete: false,
      userAnswer: '',
      showResult: false,
      isCorrect: false,
    });
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    setGameState(prev => {
      if (!prev.currentQuestion) return prev;

      // Convertir la virgule en point pour parseFloat
      const normalizedAnswer = answer.replace(',', '.');
      const userNum = parseFloat(normalizedAnswer);
      const isCorrect = Math.abs(userNum - prev.currentQuestion.answer) < 0.01;
      
      playSound(isCorrect);

      let newType = prev.currentType;
      let newConsecutiveCorrect = isCorrect ? prev.consecutiveCorrect + 1 : 0;
      let newConsecutiveWrong = !isCorrect ? prev.consecutiveWrong + 1 : 0;

      // Logique d'adaptation du type
      if (prev.currentType === 1 && newConsecutiveCorrect >= 4) {
        // Pour passer du type 1 au type 2, il faut 4 bonnes réponses d'affilée
        newType = 2;
        newConsecutiveCorrect = 0;
      } else if (prev.currentType > 1 && newConsecutiveCorrect >= 2 && prev.currentType < 5) {
        // Pour les autres types, 2 bonnes réponses suffisent
        newType = prev.currentType + 1;
        newConsecutiveCorrect = 0;
      } else if (newConsecutiveWrong >= 2 && prev.currentType > 1) {
        newType = prev.currentType - 1;
        newConsecutiveWrong = 0;
      }

      return {
        ...prev,
        userAnswer: answer,
        showResult: true,
        isCorrect,
        currentType: newType,
        consecutiveCorrect: newConsecutiveCorrect,
        consecutiveWrong: newConsecutiveWrong,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        totalWrong: prev.totalWrong + (!isCorrect ? 1 : 0),
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setGameState(prev => {
      if (prev.questionNumber >= TOTAL_QUESTIONS) {
        return { ...prev, isComplete: true };
      }

      const nextQuestionNum = prev.questionNumber + 1;
      const nextQuestion = generateQuestion(prev.currentType, nextQuestionNum);
      
      return {
        ...prev,
        currentQuestion: nextQuestion,
        questionNumber: nextQuestionNum,
        userAnswer: '',
        showResult: false,
        isCorrect: false,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      currentQuestion: null,
      questionNumber: 0,
      currentType: 1,
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      totalCorrect: 0,
      totalWrong: 0,
      isComplete: false,
      userAnswer: '',
      showResult: false,
      isCorrect: false,
    });
  }, []);

  return {
    gameState,
    startGame,
    submitAnswer,
    nextQuestion,
    resetGame,
  };
};