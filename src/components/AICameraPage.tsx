import { ArrowLeft, Zap, ZapOff, Image } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useRef } from "react";

interface AICameraPageProps {
  onNavigate: (page: string) => void;
  onCapture: (imageUrl?: string) => void;
}

export function AICameraPage({ onNavigate, onCapture }: AICameraPageProps) {
  const [flashEnabled, setFlashEnabled] = useState(false);

  // 建立兩個獨立的 Ref，分別對應「相機」與「相簿」
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  // 共用的圖片處理邏輯
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onCapture(base64String); // 拍完或選完後直接轉交給 AI
      };
      reader.readAsDataURL(file);
    }
  };

  const standbyBackground = "https://images.unsplash.com/photo-1632222623518-bbbd5f1f2489?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjBjYW1lcmF8ZW58MXx8fHwxNz5709723fDA&ixlib=rb-4.1.0&q=80&w=1080";

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* 隱藏輸入框 1：相機 (加上 capture="environment" 屬性) */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 隱藏輸入框 2：相簿 */}
      <input
        type="file"
        ref={albumInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 待機背景：因為不會顯示真實預覽，改為稍微暗化的示意背景 */}
      <div className="absolute inset-0">
        <img
          src={standbyBackground}
          alt="待機背景"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

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
          <h2 className="text-white">AI 智慧上傳</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFlashEnabled(!flashEnabled)}
            className="text-white hover:bg-white/20 rounded-full"
          >
            {flashEnabled ? <Zap className="w-6 h-6 fill-white" /> : <ZapOff className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* 中間裝飾外框與提示文字更新 */}
      <div className="absolute inset-0 flex items-center justify-center px-8 pointer-events-none">
        <div className="relative w-full max-w-sm aspect-square">
          <div className="absolute inset-0 border-4 border-white/50 rounded-3xl" />
          <div className="absolute -bottom-16 left-0 right-0 text-center">
            <p className="text-white text-sm drop-shadow-lg">
              點擊下方快門開啟相機，或選擇相簿圖片
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8 z-10">
        <div className="flex items-center justify-center gap-8">
          {/* 左側佔位符保持版面平衡 */}
          <div className="w-14 h-14" />

          {/* 中間大快門：觸發相機 */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full bg-white shadow-2xl hover:scale-105 transition-transform active:scale-95"
          >
            <div className="absolute inset-2 rounded-full border-4 border-black" />
          </button>

          {/* 右側按鈕：觸發相簿 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => albumInputRef.current?.click()}
            className="w-14 h-14 rounded-full text-white/70 hover:text-white hover:bg-white/20 active:scale-95"
          >
            <Image className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </div>
  );
}