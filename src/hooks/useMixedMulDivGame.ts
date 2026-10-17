import { useState, useCallback } from 'react';

interface MixedQuestion {
  expression: string;
  answer: number;
  type: 'multiplication' | 'division';
  originalType?: number;
}

interface MixedGameState {
  currentQuestion: MixedQuestion | null;
  questionNumber: number;
  totalCorrect: number;
  totalWrong: number;
  showResult: boolean;
  isCorrect: boolean;
  userAnswer: string | null;
  isComplete: boolean;
  questionsPool: MixedQuestion[];
}

// Questions de multiplication prédéfinies
const multiplicationQuestions = [
  { a: 3, b: -5, answer: -15 },
  { a: -4, b: 6, answer: -24 },
  { a: -7, b: -8, answer: 56 },
  { a: 9, b: -4, answer: -36 },
  { a: -6, b: 7, answer: -42 },
  { a: 8, b: -9, answer: -72 },
  { a: -5, b: -6, answer: 30 },
  { a: 7, b: 8, answer: 56 },
  { a: -3, b: 9, answer: -27 },
  { a: 4, b: -7, answer: -28 },
  { a: -8, b: -5, answer: 40 },
  { a: 6, b: 9, answer: 54 },
  { a: -2, b: 8, answer: -16 },
  { a: 5, b: -3, answer: -15 },
  { a: -9, b: -4, answer: 36 }
];

// Questions de division prédéfinies
const divisionQuestions = [
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
  { a: 42, b: -6, answer: -7 }
];

const generateMultiplicationQuestion = (): MixedQuestion => {
  const questionData = multiplicationQuestions[Math.floor(Math.random() * multiplicationQuestions.length)];
  const factorA = questionData.a < 0 ? `(${questionData.a})` : questionData.a;
  const factorB = questionData.b < 0 ? `(${questionData.b})` : questionData.b;
  return {
    expression: `${factorA} × ${factorB}`,
    answer: questionData.answer,
    type: 'multiplication'
  };
};

const generateDivisionQuestion = (): MixedQuestion => {
  const questionData = divisionQuestions[Math.floor(Math.random() * divisionQuestions.length)];
  const divisor = questionData.b < 0 ? `(${questionData.b})` : questionData.b;
  return {
    expression: `${questionData.a} ÷ ${divisor}`,
    answer: questionData.answer,
    type: 'division'
  };
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

export const useMixedMulDivGame = () => {
  const [gameState, setGameState] = useState<MixedGameState>({
    currentQuestion: null,
    questionNumber: 0,
    totalCorrect: 0,
    totalWrong: 0,
    showResult: false,
    isCorrect: false,
    userAnswer: null,
    isComplete: false,
    questionsPool: []
  });

  const generateQuestionsPool = useCallback(() => {
    const questions: MixedQuestion[] = [];
    
    // Générer 5 questions de multiplication
    for (let i = 0; i < 5; i++) {
      questions.push(generateMultiplicationQuestion());
    }
    
    // Générer 5 questions de division
    for (let i = 0; i < 5; i++) {
      questions.push(generateDivisionQuestion());
    }
    
    // Mélanger les questions
    return questions.sort(() => Math.random() - 0.5);
  }, []);

  const startGame = useCallback(() => {
    const questionsPool = generateQuestionsPool();
    const firstQuestion = questionsPool[0];
    
    setGameState({
      currentQuestion: firstQuestion,
      questionNumber: 1,
      totalCorrect: 0,
      totalWrong: 0,
      showResult: false,
      isCorrect: false,
      userAnswer: null,
      isComplete: false,
      questionsPool
    });
  }, [generateQuestionsPool]);

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
      totalWrong: prev.totalWrong + (isCorrect ? 0 : 1)
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

    const nextQuestion = gameState.questionsPool[gameState.questionNumber];
    
    setGameState(prev => ({
      ...prev,
      currentQuestion: nextQuestion,
      questionNumber: prev.questionNumber + 1,
      showResult: false,
      isCorrect: false,
      userAnswer: null
    }));
  }, [gameState.questionNumber, gameState.questionsPool]);

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
      questionsPool: []
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