import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const NumericKeypad = ({ value, onChange, onSubmit, disabled }: NumericKeypadProps) => {
  const handleNumberClick = (num: string) => {
    if (disabled) return;
    onChange(value + num);
  };

  const handleCommaClick = () => {
    if (disabled || value.includes(',')) return;
    if (value === '' || value === '-') {
      onChange(value + '0,');
    } else {
      onChange(value + ',');
    }
  };

  const handleMinusClick = () => {
    if (disabled) return;
    if (value === '') {
      onChange('-');
    }
  };

  const handleClear = () => {
    if (disabled) return;
    onChange('');
  };

  const handleBackspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const canSubmit = value.trim() !== '' && value !== '-' && !value.endsWith(',');

  return (
    <div className="max-w-sm mx-auto">
      {/* Display */}
      <div className="mb-4 p-4 bg-muted rounded-lg min-h-[60px] flex items-center justify-center">
        <span className="text-2xl font-dyslexic font-bold">
          {value || '0'}
        </span>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3">
        {/* Row 1 */}
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('7')}
          disabled={disabled}
          className="h-14 text-xl font-dyslexic font-bold"
        >
          7
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('8')}
          disabled={disabled}
          className="h-14 text-xl font-dyslexic font-bold"
        >
          8
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('9')}
          disabled={disabled}
          className="h-14 text-xl font-dyslexic font-bold"
        >
          9
        </Button>

        {/* Row 2 */}
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('4')}
          disabled={disabled}
          className="h-14 text-xl font-dyslexic font-bold"
        >
          4
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('5')}
          disabled={disabled}
          className="h-14 text-xl font-dyslexic font-bold"
        >
          5
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('6')}
          disabled={disabled}
          className="h-14 text-xl font-dyslexic font-bold"
        >
          6
        </Button>

        {/* Row 3 */}
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('1')}
          disabled={disabled}
          className="h-14 text-xl font-dyslexic font-bold"
        >
          1
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('2')}
          disabled={disabled}
          className="h-14 text-xl font-dyslexic font-bold"
        >
          2
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('3')}
          disabled={disabled}
          className="h-14 text-xl font-dyslexic font-bold"
        >
          3
        </Button>

        {/* Row 4 */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleMinusClick}
          disabled={disabled}
          className="h-14 text-xl font-dyslexic font-bold"
        >
          -
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('0')}
          disabled={disabled}
          className="h-14 text-xl font-dyslexic font-bold"
        >
          0
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleCommaClick}
          disabled={disabled}
          className="h-14 text-xl font-dyslexic font-bold"
        >
          ,
        </Button>

        {/* Row 5 - Controls */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleBackspace}
          disabled={disabled}
          className="h-14"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleClear}
          disabled={disabled}
          className="h-14 text-sm font-medium"
        >
          Effacer
        </Button>
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={disabled || !canSubmit}
          className="h-14 text-lg font-semibold"
        >
          Valider
        </Button>
      </div>
    </div>
  );
};