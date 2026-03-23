import { ArrowLeft, Zap, ZapOff } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface AICameraPageProps {
  onNavigate: (page: string) => void;
  onCapture: () => void;
}

export function AICameraPage({ onNavigate, onCapture }: AICameraPageProps) {
  const [flashEnabled, setFlashEnabled] = useState(false);

  // Mock camera preview image
  const mockCameraPreview = "https://images.unsplash.com/photo-1632222623518-bbbd5f1f2489?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjBjYW1lcmF8ZW58MXx8fHwxNzY1NzA5NzIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Camera Preview Background */}
      <div className="absolute inset-0">
        <img 
          src={mockCameraPreview} 
          alt="相機預覽" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('post')}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <h2 className="text-white">AI 智慧上傳 – 拍照模式</h2>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFlashEnabled(!flashEnabled)}
            className="text-white hover:bg-white/20 rounded-full"
          >
            {flashEnabled ? (
              <Zap className="w-6 h-6 fill-white" />
            ) : (
              <ZapOff className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Center Focus Frame */}
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <div className="relative w-full max-w-sm aspect-square">
          {/* Focus Frame */}
          <div className="absolute inset-0 border-4 border-white rounded-3xl shadow-2xl">
            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-3xl" />
          </div>
          
          {/* Hint Text */}
          <div className="absolute -bottom-16 left-0 right-0 text-center">
            <p className="text-white text-sm drop-shadow-lg">
              請將商品置於框內，AI 將自動分析並填寫資訊
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8 z-10">
        <div className="flex items-center justify-center gap-8">
          {/* Thumbnail Preview */}
          <div className="w-14 h-14 rounded-xl border-2 border-white/50 overflow-hidden bg-neutral-800">
            <img 
              src={mockCameraPreview} 
              alt="縮圖預覽" 
              className="w-full h-full object-cover opacity-50"
            />
          </div>

          {/* Shutter Button */}
          <button
            onClick={onCapture}
            className="relative w-20 h-20 rounded-full bg-white shadow-2xl hover:scale-105 transition-transform active:scale-95"
          >
            <div className="absolute inset-2 rounded-full border-4 border-black" />
          </button>

          {/* Spacer for symmetry */}
          <div className="w-14 h-14" />
        </div>
      </div>
    </div>
  );
}