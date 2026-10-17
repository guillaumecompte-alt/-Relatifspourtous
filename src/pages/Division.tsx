import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDivisionGame } from "@/hooks/useDivisionGame";
import { NumericKeypad } from "@/components/NumericKeypad";
import { TeacherAvatar } from "@/components/TeacherAvatar";

const Division = () => {
  const navigate = useNavigate();
  const { gameState, startGame, submitAnswer, nextQuestion, resetGame } = useDivisionGame();
  const [inputValue, setInputValue] = useState('');
  const [showAvatar, setShowAvatar] = useState(false);

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
            <h1 className="text-3xl font-bold bg-gradient-division bg-clip-text text-transparent">
              Division de nombres relatifs
            </h1>
          </div>

          <Card className="p-8 text-center">
            <div className="w-24 h-24 bg-gradient-division rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">÷</span>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Prêt à commencer ?</h2>
            <p className="text-muted-foreground mb-6">
              Tu vas résoudre 10 questions de division. Le niveau s'adaptera à tes réponses !
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
            <h1 className="text-3xl font-bold bg-gradient-division bg-clip-text text-transparent">
              Division de nombres relatifs
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
            <h2 className="text-3xl font-bold mb-4">Félicitations !</h2>
            <div className="text-6xl font-bold mb-4">
              <span className="bg-gradient-division bg-clip-text text-transparent">
                {score}%
              </span>
            </div>
            <p className="text-xl mb-6">
              Score : {gameState.totalCorrect} bonne{gameState.totalCorrect > 1 ? 's' : ''} réponse{gameState.totalCorrect > 1 ? 's' : ''} sur {gameState.totalCorrect + gameState.totalWrong}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleResetGame} size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Recommencer
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour au menu
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold bg-gradient-division bg-clip-text text-transparent">
            Division de nombres relatifs
          </h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Question {gameState.questionNumber} / 10
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    Type {gameState.currentType}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-4">
                  {gameState.currentQuestion?.expression}
                </div>
              </div>

              <NumericKeypad
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                disabled={gameState.showResult}
              />

              {gameState.showResult && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 text-center ${
                    gameState.isCorrect 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-red-500 bg-red-50 text-red-700'
                  }`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {gameState.isCorrect ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <XCircle className="h-6 w-6" />
                      )}
                      <span className="text-xl font-semibold">
                        {gameState.isCorrect ? 'Juste !' : 'Faux !'}
                      </span>
                    </div>
                    
                    <div className="text-lg">
                      <span>Ta réponse : </span>
                      <span className="font-mono font-bold">{gameState.userAnswer}</span>
                    </div>
                    
                    {!gameState.isCorrect && (
                      <div className="text-lg mt-1">
                        <span>Bonne réponse : </span>
                        <span className="font-mono font-bold">
                          {gameState.currentQuestion?.answer.toString().replace('.', ',')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    {gameState.questionNumber < 10 ? (
                      <Button onClick={handleNextQuestion} size="lg">
                        Question suivante
                      </Button>
                    ) : (
                      <Button onClick={() => nextQuestion()} size="lg">
                        Voir les résultats
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {showAvatar && (
            <TeacherAvatar
              isVisible={showAvatar}
              isCorrect={gameState.isCorrect}
              onAnimationComplete={() => setShowAvatar(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Division;