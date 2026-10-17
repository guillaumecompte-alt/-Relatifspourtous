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

const formatExpression = (numbers: number[]): string => {
  let expression = formatNumber(numbers[0]);
  
  for (let i = 1; i < numbers.length; i++) {
    const num = numbers[i];
    if (num >= 0) {
      expression += ` + ${formatNumber(num)}`;
    } else {
      expression += ` + (${formatNumber(num)})`;
    }
  }
  
  return expression;
};

const generateSmartNumbers = (): number[] => {
  // Génère 4 nombres décimaux qui se regroupent astucieusement avec résultats variés
  const smartSets = [
    // Regroupements qui donnent des résultats variés
    [1.3, 2.7, -1.5, -0.8], // 4-2.3 = 1.7
    [1.5, 2.5, -2.2, -0.6], // 4-2.8 = 1.2
    [1.8, 2.2, -1.1, -1.7], // 4-2.8 = 1.2
    [2.3, 1.7, -2.5, -0.9], // 4-3.4 = 0.6
    [3.2, 1.8, -2.4, -1.3], // 5-3.7 = 1.3
    [2.6, 2.4, -1.9, -1.6], // 5-3.5 = 1.5
    [1.9, 3.1, -2.3, -0.8], // 5-3.1 = 1.9
    [2.7, 1.3, -1.7, -0.4], // 4-2.1 = 1.9
    [3.4, 1.6, -2.1, -1.4], // 5-3.5 = 1.5
    [2.8, 2.2, -3.2, -0.7], // 5-3.9 = 1.1
    [1.6, 3.4, -1.8, -2.1], // 5-3.9 = 1.1
    [2.1, 2.9, -2.6, -0.9], // 5-3.5 = 1.5
    [3.3, 1.7, -1.4, -2.3], // 5-3.7 = 1.3
    [1.4, 3.6, -2.8, -0.5], // 5-3.3 = 1.7
    [2.5, 2.5, -1.6, -2.4]  // 5-4.0 = 1.0
  ];
  
  const numbers = [...smartSets[Math.floor(Math.random() * smartSets.length)]];
  
  // Mélanger l'ordre final
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  return numbers;
};

const generateSmartThreeNumbers = (): number[] => {
  // Génère 3 nombres décimaux qui se regroupent astucieusement avec résultats variés
  const smartCombinations = [
    // Regroupements astucieux avec résultats variés
    [1.3, 2.7, -2.5], // 4-2.5 = 1.5
    [1.5, 2.5, -1.8], // 4-1.8 = 2.2
    [1.8, 2.2, -2.1], // 4-2.1 = 1.9
    [1.4, 2.6, -1.3], // 4-1.3 = 2.7
    [1.9, 2.1, -2.7], // 4-2.7 = 1.3
    [3.2, 1.8, -2.4], // 5-2.4 = 2.6
    [3.6, 1.4, -1.6], // 5-1.6 = 3.4
    [3.7, 1.3, -2.8], // 5-2.8 = 2.2
    [3.9, 1.1, -1.9], // 5-1.9 = 3.1
    [2.3, 3.7, -3.5], // 6-3.5 = 2.5
    [2.8, 3.2, -2.6], // 6-2.6 = 3.4
    [2.9, 3.1, -4.1], // 6-4.1 = 1.9
    [1.2, 3.8, -2.3], // 5-2.3 = 2.7
    [1.7, 3.3, -1.7], // 5-1.7 = 3.3
    [2.4, 2.6, -3.2], // 5-3.2 = 1.8
    [2.2, 2.8, -1.4], // 5-1.4 = 3.6
    [3.5, 1.5, -2.9], // 5-2.9 = 2.1
    [2.1, 2.9, -3.3]  // 5-3.3 = 1.7
  ];
  
  const combination = smartCombinations[Math.floor(Math.random() * smartCombinations.length)];
  
  // Mélanger l'ordre
  const numbers = [...combination];
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  return numbers;
};

const generateQuestion = (type: number, id: number): Question => {
  let numbers: number[] = [];
  let expression = '';
  let answer = 0;

  switch (type) {
    case 1: // a+b=? avec entiers entre -10 et 10 (au moins un négatif, aucun zéro)
      do {
        numbers = [
          generateRandomNumber(-10, 10),
          generateRandomNumber(-10, 10)
        ];
      } while ((numbers[0] > 0 && numbers[1] > 0) || numbers[0] === 0 || numbers[1] === 0); // Éviter que les 2 nombres soient positifs ou qu'un soit zéro
      expression = formatExpression(numbers);
      answer = numbers[0] + numbers[1];
      break;
      
    case 2: // a+b+c=? avec entiers entre -10 et 10 (au moins un négatif, aucun zéro)
      do {
        numbers = [
          generateRandomNumber(-10, 10),
          generateRandomNumber(-10, 10),
          generateRandomNumber(-10, 10)
        ];
      } while ((numbers[0] > 0 && numbers[1] > 0 && numbers[2] > 0) || numbers[0] === 0 || numbers[1] === 0 || numbers[2] === 0); // Éviter que les 3 nombres soient positifs ou qu'un soit zéro
      expression = formatExpression(numbers);
      answer = numbers[0] + numbers[1] + numbers[2];
      break;
      
    case 3: // a+b=? avec a entier relatifs (-10 à 10, non zéro) et b décimal (-10 à 10, 1 chiffre après virgule)
      do {
        numbers = [
          generateRandomNumber(-10, 10), // a: entier relatif non zéro
          generateRandomNumber(-10, 10, true) // b: décimal avec 1 chiffre après virgule
        ];
      } while (numbers[0] === 0 || numbers[1] === 0 || (numbers[0] > 0 && numbers[1] > 0)); // Éviter les zéros et le cas où a et b sont tous deux positifs
      expression = formatExpression(numbers);
      answer = Math.round((numbers[0] + numbers[1]) * 10) / 10;
      break;
      
    case 4: // a+b+c=? avec décimaux "astucieux" (aucun zéro)
      do {
        numbers = generateSmartThreeNumbers();
      } while (numbers.some(n => n === 0)); // Éviter les zéros
      expression = formatExpression(numbers);
      answer = Math.round((numbers[0] + numbers[1] + numbers[2]) * 10) / 10;
      break;
      
    case 5: // a+b+c+d avec décimaux "astucieux" (aucun zéro)
      do {
        numbers = generateSmartNumbers();
      } while (numbers.some(n => n === 0)); // Éviter les zéros
      expression = formatExpression(numbers);
      answer = Math.round((numbers[0] + numbers[1] + numbers[2] + numbers[3]) * 10) / 10;
      break;
      
    default:
      numbers = [0, 0];
      expression = formatExpression(numbers);
      answer = 0;
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

export const useAdditionGame = () => {
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
      if (newConsecutiveCorrect >= 2 && prev.currentType < 5) {
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