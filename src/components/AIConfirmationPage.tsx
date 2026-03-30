import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface AIConfirmationPageProps {
  onNavigate: (page: string) => void;
  onSkip?: () => void;
  productData: {
    title: string;
    description: string;
    price: string;
  };
}

export function AIConfirmationPage({ onNavigate, onSkip, productData }: AIConfirmationPageProps) {
    return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Success ring animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-green-100 animate-ping opacity-75" />
            </div>
            
            {/* Success checkmark */}
            <div className="relative">
              <CheckCircle2 className="w-20 h-20 text-green-500 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h2 className="mb-2">
            ✨ 商品資訊已自動填入！
          </h2>
          <p className="text-muted-foreground">
            AI 已成功辨識您的商品，請確認以下資訊
          </p>
        </div>

        {/* Generated Fields Preview */}
        <Card className="rounded-2xl border-border mb-6 overflow-hidden relative">
          <CardContent className="p-6 space-y-4">
            {/* Product Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">商品名稱</span>
              </div>
              <p className="pl-4">
                {productData.title}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">商品描述</span>
              </div>
              <p className="pl-4 text-muted-foreground line-clamp-3">
                {productData.description}
              </p>
            </div>

            {/* Suggested Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">建議價格</span>
              </div>
              <p className="pl-4">
                NT$ {productData.price}
              </p>
            </div>
          </CardContent>

          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
        </Card>

        {/* Action Button */}
        <Button
          size="lg"
          className="w-full rounded-xl gap-2 group"
          onClick={() => onNavigate('post')}
        >
          前往編輯內容
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Skip Link */}
        <button
          onClick={() => {
            if (onSkip) {
              onSkip(); // 如果有傳入清空函數，就執行它
            } else {
              onNavigate('post'); // 如果沒有，就照舊回上一頁
            }
          }}
          className="w-full text-center text-muted-foreground hover:text-foreground transition-colors mt-4"
        >
          跳過
        </button>
      </div>
    </div>
  );
}