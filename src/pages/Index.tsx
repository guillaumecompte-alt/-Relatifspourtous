import { CategoryCard } from "@/components/CategoryCard";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Calculator, X, Divide, GraduationCap, Shuffle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const categories = [
    {
      title: "Addition",
      icon: Plus,
      gradient: "bg-gradient-addition",
      path: "/addition"
    },
    {
      title: "Soustraction", 
      icon: Minus,
      gradient: "bg-gradient-subtraction",
      path: "/subtraction"
    },
    {
      title: "Mélange + et −",
      icon: Calculator,
      gradient: "bg-gradient-mixed",
      path: "/mixed-add-sub"
    },
    {
      title: "Multiplication",
      icon: X,
      gradient: "bg-gradient-multiplication", 
      path: "/multiplication"
    },
    {
      title: "Division",
      icon: Divide,
      gradient: "bg-gradient-division",
      path: "/division"
    },
    {
      title: "Mélange × et ÷",
      icon: Shuffle,
      gradient: "bg-gradient-mixed",
      path: "/mixed-mul-div"
    },
    {
      title: "Examen final",
      icon: GraduationCap,
      gradient: "bg-gradient-exam",
      path: "/final-exam"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-6 bg-gradient-primary rounded-full mb-6">
            <Calculator className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Les Relatifs en 4ème
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Maîtrise les nombres relatifs avec des exercices interactifs et amusants !
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.path}
              title={category.title}
              icon={category.icon}
              gradient={category.gradient}
              onClick={() => navigate(category.path)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Révise tes mathématiques et deviens un expert des nombres relatifs !
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
