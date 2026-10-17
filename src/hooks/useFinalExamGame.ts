import { useState, useCallback } from 'react';

export type Operation = 'addition' | 'soustraction' | 'multiplication' | 'division';

export interface ExamQuestion {
  id: number;
  operation: Operation;
  expression: string;
  answer: number;
}

export interface ExamState {
  currentQuestion: ExamQuestion | null;
  questionNumber: number;
  totalCorrect: number;
  totalWrong: number;
  isComplete: boolean;
  userAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  questionsPool: ExamQuestion[];
}

const TOTAL_QUESTIONS = 20;

const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const formatNumber = (num: number): string => {
  return num.toString().replace('.', ',');
};

// ===== Addition : a+b avec a et b entiers relatifs entre -10 et 10 (pas de 0, jamais tous les deux positifs) =====
const generateAdditionQuestion = (id: number): ExamQuestion => {
  let a = 0, b = 0;
  do {
    a = generateRandomNumber(-10, 10);
    b = generateRandomNumber(-10, 10);
  } while (a === 0 || b === 0 || (a > 0 && b > 0));

  const bStr = b >= 0 ? formatNumber(b) : `(${formatNumber(b)})`;
  return {
    id,
    operation: 'addition',
    expression: `${formatNumber(a)} + ${bStr}`,
    answer: a + b
  };
};

// ===== Soustraction : a-b avec a et b entiers relatifs entre -10 et 10 (pas de 0) =====
const generateSubtractionQuestion = (id: number): ExamQuestion => {
  let a = 0, b = 0;
  do {
    a = generateRandomNumber(-10, 10);
    b = generateRandomNumber(-10, 10);
  } while (a === 0 || b === 0 || (a > 0 && b > 0 && a > b));

  const bStr = b >= 0 ? formatNumber(b) : `(${formatNumber(b)})`;
  return {
    id,
    operation: 'soustraction',
    expression: `${formatNumber(a)} - ${bStr}`,
    answer: a - b
  };
};

// ===== Multiplication : questions inspirées des tables (issues de l'item Multiplication) =====
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

const generateMultiplicationQuestion = (id: number): ExamQuestion => {
  const q = multiplicationQuestions[Math.floor(Math.random() * multiplicationQuestions.length)];
  const factorA = q.a < 0 ? `(${q.a})` : `${q.a}`;
  const factorB = q.b < 0 ? `(${q.b})` : `${q.b}`;
  return {
    id,
    operation: 'multiplication',
    expression: `${factorA} × ${factorB}`,
    answer: q.answer
  };
};

// ===== Division : questions inspirées des tables (issues de l'item Division) =====
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

const generateDivisionQuestion = (id: number): ExamQuestion => {
  const q = divisionQuestions[Math.floor(Math.random() * divisionQuestions.length)];
  const divisor = q.b < 0 ? `(${q.b})` : `${q.b}`;
  return {
    id,
    operation: 'division',
    expression: `${q.a} ÷ ${divisor}`,
    answer: q.answer
  };
};

const playSound = (isCorrect: boolean) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    if (isCorrect) {
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
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 220;
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

export const useFinalExamGame = () => {
  const [gameState, setGameState] = useState<ExamState>({
    currentQuestion: null,
    questionNumber: 0,
    totalCorrect: 0,
    totalWrong: 0,
    isComplete: false,
    userAnswer: '',
    showResult: false,
    isCorrect: false,
    questionsPool: []
  });

  const generateQuestionsPool = useCallback((): ExamQuestion[] => {
    const questions: ExamQuestion[] = [];

    // 5 questions de chaque opération
    for (let i = 0; i < 5; i++) questions.push(generateAdditionQuestion(i + 1));
    for (let i = 0; i < 5; i++) questions.push(generateSubtractionQuestion(i + 6));
    for (let i = 0; i < 5; i++) questions.push(generateMultiplicationQuestion(i + 11));
    for (let i = 0; i < 5; i++) questions.push(generateDivisionQuestion(i + 16));

    // Mélanger les questions (alternance aléatoire des opérations)
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return questions;
  }, []);

  const startGame = useCallback(() => {
    const questionsPool = generateQuestionsPool();
    setGameState({
      currentQuestion: questionsPool[0],
      questionNumber: 1,
      totalCorrect: 0,
      totalWrong: 0,
      isComplete: false,
      userAnswer: '',
      showResult: false,
      isCorrect: false,
      questionsPool
    });
  }, [generateQuestionsPool]);

  const submitAnswer = useCallback((answer: string) => {
    setGameState(prev => {
      if (!prev.currentQuestion) return prev;

      const normalizedAnswer = answer.replace(',', '.');
      const userNum = parseFloat(normalizedAnswer);
      const isCorrect = Math.abs(userNum - prev.currentQuestion.answer) < 0.01;

      playSound(isCorrect);

      return {
        ...prev,
        userAnswer: answer,
        showResult: true,
        isCorrect,
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

      const nextQuestion = prev.questionsPool[prev.questionNumber];

      return {
        ...prev,
        currentQuestion: nextQuestion,
        questionNumber: prev.questionNumber + 1,
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
      totalCorrect: 0,
      totalWrong: 0,
      isComplete: false,
      userAnswer: '',
      showResult: false,
      isCorrect: false,
      questionsPool: []
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
