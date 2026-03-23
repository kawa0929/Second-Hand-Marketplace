import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";

interface AIProcessingPageProps {
  onComplete: () => void;
}

export function AIProcessingPage({ onComplete }: AIProcessingPageProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: "📸", text: "正在處理照片…", duration: 1000 },
    { icon: "🤖", text: "AI 正在分析圖片…", duration: 1500 },
    { icon: "✨", text: "商品資訊即將自動產生…", duration: 1000 },
  ];

  useEffect(() => {
    let totalTime = 0;
    const stepDuration = steps[currentStep]?.duration || 1000;

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = (100 / (steps.reduce((acc, s) => acc + s.duration, 0) / 100));
        const next = Math.min(prev + increment, 100);
        return next;
      });
    }, 100);

    // Step advancement
    const stepTimeout = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        clearInterval(progressInterval);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [currentStep, onComplete, steps]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="max-w-md w-full px-8">
        {/* AI Icon Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Pulsing rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-primary/10 animate-ping" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 animate-pulse" />
            </div>
            
            {/* Center icon */}
            <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl animate-bounce">
                {steps[currentStep].icon}
              </span>
            </div>
          </div>
        </div>

        {/* Processing Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 transition-all duration-500 ${
                index === currentStep
                  ? "scale-105 opacity-100"
                  : index < currentStep
                  ? "opacity-50"
                  : "opacity-30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  index <= currentStep
                    ? "bg-primary/10"
                    : "bg-neutral-100"
                }`}
              >
                <span className="text-xl">{step.icon}</span>
              </div>
              <p
                className={`flex-1 transition-colors ${
                  index === currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.text}
              </p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-muted-foreground">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-pulse"
              style={{
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}