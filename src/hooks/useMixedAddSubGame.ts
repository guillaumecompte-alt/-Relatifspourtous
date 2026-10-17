import { useState, useCallback } from 'react';

interface Question {
  id: number;
  type: number;
  numbers: number[];
  expression: string;
  answer: number;
  isFillInTheBlank?: boolean;
}

interface GameState {
  currentQuestion: Question | null;
  questionNumber: number;
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  userAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  isComplete: boolean;
  currentType: number;
}

const TOTAL_QUESTIONS = 10;

// Generate random number with exclusion of 0
const generateRandomNumber = (min: number, max: number, excludeZero: boolean = false, decimal: boolean = false): number => {
  let num: number;
  do {
    if (decimal) {
      num = Math.round((Math.random() * (max - min) + min) * 10) / 10;
    } else {
      num = Math.floor(Math.random() * (max - min + 1)) + min;
    }
  } while (excludeZero && num === 0);
  return num;
};

const formatNumber = (num: number): string => {
  return num.toString().replace('.', ',');
};

const generateQuestion = (type: number, id: number): Question => {
  let numbers: number[];
  let expression: string;
  let answer: number;
  let isFillInTheBlank = false;

  switch (type) {
    case 1: {
      // TYPE 1: a+b=? avec a et b entiers relatifs entre -10 et 10, jamais tous les deux positifs, jamais égal à 0
      let a: number, b: number;
      do {
        a = generateRandomNumber(-10, 10, true);
        b = generateRandomNumber(-10, 10, true);
      } while (a > 0 && b > 0); // Éviter que les deux soient positifs
      
      numbers = [a, b];
      expression = `${formatNumber(a)} + (${formatNumber(b)})`;
      answer = a + b;
      break;
    }

    case 2: {
      // TYPE 2: a-b=? avec a et b entiers relatifs entre -10 et 10, jamais égal à 0, pas le cas où a et b sont positifs et a > b
      let a: number, b: number;
      do {
        a = generateRandomNumber(-10, 10, true);
        b = generateRandomNumber(-10, 10, true);
      } while (a > 0 && b > 0 && a > b); // Éviter le cas a et b positifs avec a > b
      
      numbers = [a, b];
      expression = `${formatNumber(a)} - (${formatNumber(b)})`;
      answer = a - b;
      break;
    }

    case 3: {
      // TYPE 3: a-(...)=c (opération à trou)
      const a = generateRandomNumber(-10, 10, false);
      const c = generateRandomNumber(-10, 10, false);
      const missingNumber = a - c; // b = a - c donc a - b = c
      
      numbers = [a, missingNumber, c];
      expression = `${formatNumber(a)} - (...) = ${formatNumber(c)}`;
      answer = missingNumber;
      isFillInTheBlank = true;
      break;
    }

    case 4: {
      // TYPE 4: a+b+c=? avec a et b décimaux relatifs entre -10 et 10 (1 chiffre après virgule), c entier entre -10 et 10
      const a = generateRandomNumber(-10, 10, false, true);
      const b = generateRandomNumber(-10, 10, false, true);
      const c = generateRandomNumber(-10, 10, false);
      
      numbers = [a, b, c];
      expression = `${formatNumber(a)} + (${formatNumber(b)}) + (${formatNumber(c)})`;
      answer = Math.round((a + b + c) * 10) / 10;
      break;
    }

    case 5: {
      // TYPE 5: a-b+c=? avec a, b, c entiers relatifs entre -20 et 20
      const a = generateRandomNumber(-20, 20, false);
      const b = generateRandomNumber(-20, 20, false);
      const c = generateRandomNumber(-20, 20, false);
      
      numbers = [a, b, c];
      expression = `${formatNumber(a)} - (${formatNumber(b)}) + (${formatNumber(c)})`;
      answer = a - b + c;
      break;
    }

    default:
      numbers = [0, 0];
      expression = "0 + 0";
      answer = 0;
  }

  return {
    id,
    type,
    numbers,
    expression,
    answer,
    isFillInTheBlank
  };
};

// Generate question sequence: each type appears exactly 2 times
const generateQuestionSequence = (): number[] => {
  const sequence: number[] = [];
  
  // Add each type twice
  for (let type = 1; type <= 5; type++) {
    sequence.push(type, type);
  }
  
  // Shuffle the sequence
  for (let i = sequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
  }
  
  return sequence;
};

const playSound = (isCorrect: boolean) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  if (isCorrect) {
    // Son de succès (Do majeur)
    const frequencies = [523.25, 659.25, 783.99]; // Do, Mi, Sol
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1 + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4 + index * 0.1);
      
      oscillator.start(audioContext.currentTime + index * 0.1);
      oscillator.stop(audioContext.currentTime + 0.4 + index * 0.1);
    });
  } else {
    // Son d'erreur (note grave)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }
};

export const useMixedAddSubGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: TOTAL_QUESTIONS,
    totalCorrect: 0,
    totalWrong: 0,
    userAnswer: '',
    showResult: false,
    isCorrect: false,
    isComplete: false,
    currentType: 1,
  });

  const [questionSequence] = useState<number[]>(() => generateQuestionSequence());

  const startGame = useCallback(() => {
    const firstQuestion = generateQuestion(questionSequence[0], 1);
    setGameState({
      currentQuestion: firstQuestion,
      questionNumber: 1,
      totalQuestions: TOTAL_QUESTIONS,
      totalCorrect: 0,
      totalWrong: 0,
      userAnswer: '',
      showResult: false,
      isCorrect: false,
      isComplete: false,
      currentType: questionSequence[0],
    });
  }, [questionSequence]);

  const submitAnswer = useCallback((answer: string) => {
    if (!gameState.currentQuestion) return;

    const userNum = parseFloat(answer.replace(',', '.'));
    const correct = Math.abs(userNum - gameState.currentQuestion.answer) < 0.001;
    
    const newTotalCorrect = correct ? gameState.totalCorrect + 1 : gameState.totalCorrect;
    const newTotalWrong = correct ? gameState.totalWrong : gameState.totalWrong + 1;

    setGameState(prev => ({
      ...prev,
      userAnswer: answer,
      showResult: true,
      isCorrect: correct,
      totalCorrect: newTotalCorrect,
      totalWrong: newTotalWrong,
    }));

    playSound(correct);
  }, [gameState.currentQuestion, gameState.totalCorrect, gameState.totalWrong]);

  const nextQuestion = useCallback(() => {
    const nextQuestionNumber = gameState.questionNumber + 1;
    
    if (nextQuestionNumber > TOTAL_QUESTIONS) {
      setGameState(prev => ({
        ...prev,
        isComplete: true,
        currentQuestion: null,
      }));
    } else {
      const nextQuestion = generateQuestion(questionSequence[nextQuestionNumber - 1], nextQuestionNumber);
      setGameState(prev => ({
        ...prev,
        currentQuestion: nextQuestion,
        questionNumber: nextQuestionNumber,
        userAnswer: '',
        showResult: false,
        isCorrect: false,
        currentType: questionSequence[nextQuestionNumber - 1],
      }));
    }
  }, [gameState.questionNumber, questionSequence]);

  const resetGame = useCallback(() => {
    setGameState({
      currentQuestion: null,
      questionNumber: 0,
      totalQuestions: TOTAL_QUESTIONS,
      totalCorrect: 0,
      totalWrong: 0,
      userAnswer: '',
      showResult: false,
      isCorrect: false,
      isComplete: false,
      currentType: 1,
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