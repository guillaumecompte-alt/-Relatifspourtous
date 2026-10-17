import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useFinalExamGame, Operation } from "@/hooks/useFinalExamGame";
import { NumericKeypad } from "@/components/NumericKeypad";
import { TeacherAvatar } from "@/components/TeacherAvatar";

const operationLabels: Record<Operation, string> = {
  addition: 'Addition',
  soustraction: 'Soustraction',
  multiplication: 'Multiplication',
  division: 'Division'
};

const FinalExam = () => {
  const navigate = useNavigate();
  const { gameState, startGame, submitAnswer, nextQuestion, resetGame } = useFinalExamGame();
  const [inputValue, setInputValue] = useState('');
  const [showAvatar, setShowAvatar] = useState(false);

  const isPerfectScore = gameState.isComplete && gameState.totalCorrect === 20;

  // Explosion de confettis si 20/20
  useEffect(() => {
    if (isPerfectScore) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });

      frame();
    }
  }, [isPerfectScore]);

  const handleSubmit = () => {
    if (inputValue.trim() !== '') {
      submitAnswer(inputValue.trim());
      setShowAvatar(true);
    }
  };

  const handleNextQuestion = () => {
    setInputValue('');
    nextQuestion();
  };

  const handleStartGame = () => {
    setInputValue('');
    startGame();
  };

  const handleResetGame = () => {
    setInputValue('');
    resetGame();
  };

  if (!gameState.currentQuestion && !gameState.isComplete) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-exam bg-clip-text text-transparent">
              Examen final
            </h1>
          </div>

          <Card className="p-8 text-center">
            <div className="w-24 h-24 bg-gradient-exam rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">🎓</span>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Prêt à commencer ?</h2>
            <p className="text-muted-foreground mb-6">
              Tu vas résoudre 20 questions mélangées : additions, soustractions, multiplications et divisions de nombres relatifs. Bonne chance !
            </p>
            <Button onClick={handleStartGame} size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Commencer
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState.isComplete) {
    const score = Math.round((gameState.totalCorrect / (gameState.totalCorrect + gameState.totalWrong)) * 100);

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-exam bg-clip-text text-transparent">
              Examen final
            </h1>
          </div>

          <Card className="p-8 text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-green-400 shadow-lg shadow-green-400/50">
              <img
                src="/lovable-uploads/d132febc-5880-4c93-89b9-fafda5ade82c.png"
                alt="Professeur"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              {isPerfectScore ? 'Sans faute, bravo ! 🎉' : 'Félicitations !'}
            </h2>
            <p className="text-xl mb-6">Tu as terminé tes 20 questions</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{gameState.totalCorrect}</div>
                <div className="text-sm text-green-600/80 dark:text-green-400/80">Bonnes réponses</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{gameState.totalWrong}</div>
                <div className="text-sm text-red-600/80 dark:text-red-400/80">Erreurs</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}%</div>
                <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Score</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={handleResetGame} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Recommencer
              </Button>
              <Button onClick={() => navigate('/')} className="gap-2">
                Retour au menu
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg sm:text-3xl font-bold bg-gradient-exam bg-clip-text text-transparent">
            Examen final
          </h1>
        </div>

        <div className="grid gap-3 sm:gap-6">
          {/* Progress and Info */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-lg">
                  Question {gameState.questionNumber} sur 20
                </CardTitle>
                <div className="flex gap-1 sm:gap-2">
                  <Badge variant="outline" className="text-xs">
                    {operationLabels[gameState.currentQuestion.operation]}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">{gameState.totalCorrect}/20</Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Question */}
          <Card>
            <CardContent className="p-4 sm:p-8">
              <div className="text-center">
                <div className="text-lg sm:text-4xl font-dyslexic font-bold mb-4 sm:mb-8 p-3 sm:p-6 bg-muted rounded-lg whitespace-nowrap overflow-x-auto">
                  {gameState.currentQuestion.expression} = ?
                </div>

                {!gameState.showResult ? (
                  <div className="space-y-6">
                    <NumericKeypad
                      value={inputValue}
                      onChange={setInputValue}
                      onSubmit={handleSubmit}
                      disabled={false}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className={`p-6 rounded-lg ${gameState.isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        {gameState.isCorrect ? (
                          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        )}
                        <span className={`text-xl font-semibold ${gameState.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {gameState.isCorrect ? 'Correct !' : 'Incorrect'}
                        </span>
                      </div>

                      <div className="text-lg">
                        <p>Ta réponse : <span className="font-dyslexic font-bold">{gameState.userAnswer?.replace('.', ',')}</span></p>
                        {!gameState.isCorrect && (
                          <p>Bonne réponse : <span className="font-dyslexic font-bold text-green-600 dark:text-green-400">{gameState.currentQuestion.answer.toString().replace('.', ',')}</span></p>
                        )}
                      </div>
                    </div>

                    <Button onClick={handleNextQuestion} size="lg">
                      {gameState.questionNumber >= 20 ? 'Voir les résultats' : 'Question suivante'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avatar du professeur */}
      <TeacherAvatar
        isVisible={showAvatar && gameState.showResult}
        isCorrect={gameState.isCorrect}
        onAnimationComplete={() => setShowAvatar(false)}
      />
    </div>
  );
};

export default FinalExam;
