import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Question {
  id: number;
  type: number;
  numbers: number[];
  expression: string;
  answer: number;
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

const formatMultiplicationExpression = (numbers: number[]): string => {
  return numbers.map(num => {
    if (num < 0) {
      return `(${formatNumber(num)})`;
    }
    return formatNumber(num);
  }).join(' × ');
};

// Pairs de décimaux qui se regroupent astucieusement
const getSmartDecimalPairs = (): [number, number][] => {
  return [
    [1.25, 4], [1.25, -4], [-1.25, 4], [-1.25, -4],
    [2.5, 2], [2.5, -2], [-2.5, 2], [-2.5, -2],
    [2.5, 4], [2.5, -4], [-2.5, 4], [-2.5, -4],
    [1.5, 2], [1.5, -2], [-1.5, 2], [-1.5, -2],
    [0.5, 2], [0.5, -2], [-0.5, 2], [-0.5, -2],
    [0.25, 4], [0.25, -4], [-0.25, 4], [-0.25, -4],
    [3.4, 10], [3.4, -10], [-3.4, 10], [-3.4, -10],
    [1.2, 5], [1.2, -5], [-1.2, 5], [-1.2, -5],
    [0.8, 5], [0.8, -5], [-0.8, 5], [-0.8, -5]
  ];
};

const generateQuestion = (type: number, id: number): Question => {
  let numbers: number[] = [];
  let expression = '';
  let answer = 0;

  switch (type) {
    case 1: // a×b=? avec a et b entiers relatifs entre -10 et 10, non nuls
      do {
        numbers = [
          generateRandomNumber(-10, 10),
          generateRandomNumber(-10, 10)
        ];
      } while (numbers[0] === 0 || numbers[1] === 0);
      expression = formatMultiplicationExpression(numbers);
      answer = numbers[0] * numbers[1];
      break;
      
    case 2: // a×b=? avec a et b entiers relatifs entre -10 et 10, non nuls, pas tous deux positifs
      do {
        numbers = [
          generateRandomNumber(-10, 10),
          generateRandomNumber(-10, 10)
        ];
      } while (numbers[0] === 0 || numbers[1] === 0 || (numbers[0] > 0 && numbers[1] > 0));
      expression = formatMultiplicationExpression(numbers);
      answer = numbers[0] * numbers[1];
      break;
      
    case 3: // a×b×c=? ou a×b×c×d=? avec au moins 2 nombres négatifs
      const useThreeFactors = Math.random() < 0.5;
      const factorCount = useThreeFactors ? 3 : 4;
      
      do {
        numbers = [];
        for (let i = 0; i < factorCount; i++) {
          numbers.push(generateRandomNumber(-4, 4));
        }
        // Vérifier qu'aucun n'est zéro et qu'au moins 2 sont négatifs
      } while (numbers.some(n => n === 0) || numbers.filter(n => n < 0).length < 2);
      
      expression = formatMultiplicationExpression(numbers);
      answer = numbers.reduce((acc, num) => acc * num, 1);
      break;
      
    case 4: // a×b×c=? avec regroupement astucieux
      const smartPairs = getSmartDecimalPairs();
      const selectedPair = smartPairs[Math.floor(Math.random() * smartPairs.length)];
      const integerFactor = generateRandomNumber(-10, 10);
      
      // S'assurer que le facteur entier n'est pas zéro
      if (integerFactor === 0) {
        numbers = [selectedPair[0], selectedPair[1], integerFactor === 0 ? 1 : integerFactor];
      } else {
        numbers = [selectedPair[0], selectedPair[1], integerFactor];
      }
      
      // Mélanger l'ordre des facteurs
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }
      
      expression = formatMultiplicationExpression(numbers);
      answer = Math.round((numbers[0] * numbers[1] * numbers[2]) * 10) / 10;
      break;
      
    default:
      numbers = [1, 1];
      expression = formatMultiplicationExpression(numbers);
      answer = 1;
  }

  return { id, type, numbers, expression, answer };
};

const playSound = (isCorrect: boolean) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (isCorrect) {
      // Son de succès plus satisfaisant avec plusieurs notes ascendantes
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
      // Son d'échec plus doux
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

export const useMultiplicationGame = () => {
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

      // Logique d'adaptation du type pour multiplication
      if (prev.currentType === 1 && newConsecutiveCorrect >= 3) {
        newType = 2;
        newConsecutiveCorrect = 0;
      } else if (prev.currentType === 2 && newConsecutiveCorrect >= 2) {
        newType = 3;
        newConsecutiveCorrect = 0;
      } else if (prev.currentType === 3 && newConsecutiveCorrect >= 2) {
        newType = 4;
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