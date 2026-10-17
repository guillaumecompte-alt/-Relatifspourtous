import { useState, useCallback } from 'react';

interface Question {
  expression: string;
  answer: number;
  type: 1 | 2 | 3;
}

interface GameState {
  currentQuestion: Question | null;
  questionNumber: number;
  totalCorrect: number;
  totalWrong: number;
  showResult: boolean;
  isCorrect: boolean;
  userAnswer: string | null;
  isComplete: boolean;
  currentType: 1 | 2 | 3;
  consecutiveCorrect: number;
}

// Questions prédéfinies basées sur les tables de multiplication
const type1Questions = [
  { a: 56, b: -7, answer: -8 },
  { a: -56, b: 8, answer: -7 },
  { a: 54, b: -9, answer: -6 },
  { a: -54, b: 6, answer: -9 },
  { a: -64, b: -8, answer: 8 },
  { a: 32, b: -8, answer: -4 },
  { a: -24, b: 8, answer: -3 },
  { a: 48, b: -8, answer: -6 },
  { a: 72, b: -9, answer: -8 },
  { a: -72, b: 8, answer: -9 },
  { a: 21, b: -3, answer: -7 },
  { a: -21, b: -7, answer: 3 },
  { a: 27, b: -9, answer: -3 },
  { a: -27, b: -3, answer: 9 },
  { a: 42, b: -6, answer: -7 },
  { a: -42, b: 7, answer: -6 },
  { a: 35, b: -5, answer: -7 },
  { a: -35, b: -7, answer: 5 },
  { a: 36, b: -4, answer: -9 },
  { a: -36, b: 9, answer: -4 },
  { a: 28, b: -4, answer: -7 },
  { a: -28, b: -7, answer: 4 },
  { a: 45, b: -5, answer: -9 },
  { a: -45, b: 9, answer: -5 },
  { a: 63, b: -7, answer: -9 },
  { a: -63, b: 9, answer: -7 },
  { a: 40, b: -5, answer: -8 },
  { a: -40, b: 8, answer: -5 },
  { a: 81, b: -9, answer: -9 },
  { a: -81, b: -9, answer: 9 }
];

const type2Questions = [
  { a: 63, answer: -9, b: -7 },
  { a: -56, answer: -7, b: 8 },
  { a: 16, answer: -4, b: -4 },
  { a: -28, answer: 4, b: -7 },
  { a: 48, answer: -6, b: -8 },
  { a: -54, answer: -9, b: 6 },
  { a: 35, answer: -5, b: -7 },
  { a: -42, answer: 6, b: -7 },
  { a: 24, answer: -3, b: -8 },
  { a: -32, answer: -8, b: 4 },
  { a: 45, answer: -5, b: -9 },
  { a: -36, answer: 4, b: -9 },
  { a: 21, answer: -3, b: -7 },
  { a: -49, answer: -7, b: 7 },
  { a: 72, answer: -8, b: -9 },
  { a: -64, answer: 8, b: -8 },
  { a: 18, answer: -2, b: -9 },
  { a: -25, answer: 5, b: -5 },
  { a: 30, answer: -5, b: -6 },
  { a: -56, answer: -8, b: 7 }
];

const type3Questions = [
  { answer: -36, a: -6, b: 6 },
  { answer: -25, a: 5, b: -5 },
  { answer: -40, a: -8, b: 5 },
  { answer: 28, a: -4, b: -7 },
  { answer: -63, a: 7, b: -9 },
  { answer: 54, a: -6, b: -9 },
  { answer: -48, a: 8, b: -6 },
  { answer: 35, a: -5, b: -7 },
  { answer: -42, a: 6, b: -7 },
  { answer: 32, a: -8, b: -4 },
  { answer: -27, a: 3, b: -9 },
  { answer: 45, a: -9, b: -5 },
  { answer: -56, a: 7, b: -8 },
  { answer: 72, a: -8, b: -9 },
  { answer: -21, a: 3, b: -7 },
  { answer: 24, a: -4, b: -6 },
  { answer: -30, a: 5, b: -6 },
  { answer: 49, a: -7, b: -7 },
  { answer: -18, a: 2, b: -9 },
  { answer: 16, a: -2, b: -8 }
];

const generateType1Question = (): Question => {
  const questionData = type1Questions[Math.floor(Math.random() * type1Questions.length)];
  const divisor = questionData.b < 0 ? `(${questionData.b})` : questionData.b;
  return {
    expression: `${questionData.a} ÷ ${divisor}`,
    answer: questionData.answer,
    type: 1
  };
};

const generateType2Question = (): Question => {
  const questionData = type2Questions[Math.floor(Math.random() * type2Questions.length)];
  return {
    expression: `${questionData.a} ÷ ... = ${questionData.b}`,
    answer: questionData.answer,
    type: 2
  };
};

const generateType3Question = (): Question => {
  const questionData = type3Questions[Math.floor(Math.random() * type3Questions.length)];
  const divisor = questionData.a < 0 ? `(${questionData.a})` : questionData.a;
  return {
    expression: `... ÷ ${divisor} = ${questionData.b}`,
    answer: questionData.answer,
    type: 3
  };
};

const generateQuestion = (type: 1 | 2 | 3): Question => {
  switch (type) {
    case 1:
      return generateType1Question();
    case 2:
      return generateType2Question();
    case 3:
      return generateType3Question();
    default:
      return generateType1Question();
  }
};

const playSound = (isCorrect: boolean) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (isCorrect) {
      // Son de succès : mélodie ascendante
      const frequencies = [523.25, 659.25, 783.99]; // Do, Mi, Sol
      const duration = 0.15;
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (index * duration);
        gainNode.gain.setValueAtTime(0.1, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } else {
      // Son d'erreur : bruit grave
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  } catch (error) {
    // Fallback silencieux si l'audio ne peut pas être joué
    console.log('Audio not supported');
  }
};

export const useDivisionGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: null,
    questionNumber: 0,
    totalCorrect: 0,
    totalWrong: 0,
    showResult: false,
    isCorrect: false,
    userAnswer: null,
    isComplete: false,
    currentType: 1,
    consecutiveCorrect: 0
  });

  const startGame = useCallback(() => {
    const firstQuestion = generateQuestion(1);
    setGameState({
      currentQuestion: firstQuestion,
      questionNumber: 1,
      totalCorrect: 0,
      totalWrong: 0,
      showResult: false,
      isCorrect: false,
      userAnswer: null,
      isComplete: false,
      currentType: 1,
      consecutiveCorrect: 0
    });
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    if (!gameState.currentQuestion) return;

    const numericAnswer = parseFloat(answer.replace(',', '.'));
    const isCorrect = Math.abs(numericAnswer - gameState.currentQuestion.answer) < 0.001;

    setGameState(prev => ({
      ...prev,
      showResult: true,
      isCorrect,
      userAnswer: answer,
      totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
      totalWrong: prev.totalWrong + (isCorrect ? 0 : 1),
      consecutiveCorrect: isCorrect ? prev.consecutiveCorrect + 1 : 0
    }));

    // Jouer le son
    playSound(isCorrect);
  }, [gameState.currentQuestion]);

  const nextQuestion = useCallback(() => {
    if (gameState.questionNumber >= 10) {
      setGameState(prev => ({
        ...prev,
        isComplete: true,
        currentQuestion: null
      }));
      return;
    }

    // Déterminer le type de la prochaine question
    let nextType = gameState.currentType;
    
    if (gameState.isCorrect) {
      if (gameState.currentType === 1 && gameState.consecutiveCorrect >= 4) {
        nextType = 2;
      } else if (gameState.currentType === 2 && gameState.consecutiveCorrect >= 3) {
        nextType = 3;
      }
    }

    const nextQuestion = generateQuestion(nextType);
    
    setGameState(prev => ({
      ...prev,
      currentQuestion: nextQuestion,
      questionNumber: prev.questionNumber + 1,
      showResult: false,
      isCorrect: false,
      userAnswer: null,
      currentType: nextType,
      consecutiveCorrect: nextType !== prev.currentType ? 0 : prev.consecutiveCorrect
    }));
  }, [gameState.questionNumber, gameState.currentType, gameState.consecutiveCorrect, gameState.isCorrect]);

  const resetGame = useCallback(() => {
    setGameState({
      currentQuestion: null,
      questionNumber: 0,
      totalCorrect: 0,
      totalWrong: 0,
      showResult: false,
      isCorrect: false,
      userAnswer: null,
      isComplete: false,
      currentType: 1,
      consecutiveCorrect: 0
    });
  }, []);

  return {
    gameState,
    startGame,
    submitAnswer,
    nextQuestion,
    resetGame
  };
};