import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Package, X } from "lucide-react";

const randomEmojis = ["😺", "🐶", "🐻", "🐼", "🦁", "🦊", "🐨", "🦄", "🎨", "🛍️"];

interface RegisterPageProps {
  onNavigate: (page: string) => void;
  onLogin: () => void;
  onAvatarGenerated?: (emoji: string) => void;
}

export function RegisterPage({ onNavigate, onLogin, onAvatarGenerated }: RegisterPageProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");

  // --- 新增：用來紀錄 Email 的狀態 ---
  const [email, setEmail] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * randomEmojis.length);
    const selected = randomEmojis[randomIndex];
    setSelectedEmoji(selected);
    if (onAvatarGenerated) onAvatarGenerated(selected);
  }, [onAvatarGenerated]);

  // --- 新增：呼叫後端發信的函式 ---
  const handleSendOTP = async () => {
    if (!email) {
      alert("請先輸入電子郵件！");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('http://localhost:3001/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.success) {
        alert('驗證碼已寄出！請至您的信箱查看。');
      } else {
        alert('發送失敗：' + data.error);
      }
    } catch (error) {
      alert('無法連線至後端伺服器，請確認 node index.js 是否正在執行。');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md rounded-2xl border-border relative">
        <button
          onClick={() => onNavigate('home')}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1 hover:bg-neutral-100"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">建立帳戶</CardTitle>
            <CardDescription className="mt-2 text-base">加入我們的二手市集社群</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 頭貼區塊 */}
            <div className="flex flex-col items-center justify-center gap-2 mb-2">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center border-2 border-dashed border-neutral-300 relative group overflow-hidden">
                {!selectedEmoji ? (
                  <div className="w-full h-full animate-pulse bg-neutral-200" />
                ) : (
                  <span className="text-6xl group-hover:scale-110 transition-transform">{selectedEmoji}</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">預設頭貼</span>
            </div>

            {/* 姓名 */}
            <div className="space-y-2">
              <Label htmlFor="fullname">真實姓名</Label>
              <Input id="fullname" placeholder="請輸入真實姓名" className="rounded-xl h-11 bg-input-background border-0" required />
            </div>

            {/* 手機 */}
            <div className="space-y-2">
              <Label htmlFor="phone">手機號碼</Label>
              <Input id="phone" type="tel" placeholder="09xx-xxx-xxx" className="rounded-xl h-11 bg-input-background border-0" required />
            </div>

            {/* Email (新增了 onChange 來捕捉輸入) */}
            <div className="space-y-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="rounded-xl h-11 bg-input-background border-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* 驗證碼 (按鈕已綁定 handleSendOTP) */}
            <div className="space-y-2">
              <Label htmlFor="verification">信箱驗證碼</Label>
              <div className="flex gap-2">
                <Input
                  id="verification"
                  placeholder="輸入 6 位數驗證碼"
                  className="rounded-xl h-11 bg-input-background border-0 flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 rounded-xl px-4 hover:bg-neutral-200"
                  onClick={handleSendOTP}
                  disabled={isSending}
                >
                  {isSending ? "傳送中..." : "發送驗證信"}
                </Button>
              </div>
            </div>

            {/* 密碼 */}
            <div className="space-y-2">
              <Label htmlFor="password">設定密碼</Label>
              <Input id="password" type="password" placeholder="請輸入 8 位以上英數字" className="rounded-xl h-11 bg-input-background border-0" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">確認密碼</Label>
              <Input id="confirm-password" type="password" placeholder="請再次輸入密碼" className="rounded-xl h-11 bg-input-background border-0" required />
            </div>

            <div className="flex items-start gap-3 py-2">
              <Checkbox id="terms" className="mt-1 rounded-md" required />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                我已閱讀並同意服務條款和隱私政策。
              </label>
            </div>

            <Button type="submit" className="w-full rounded-xl h-11 text-base font-medium mt-2">
              完成註冊
            </Button>
          </form>

          <div className="text-center pt-6">
            <span className="text-muted-foreground text-sm">已經有帳戶？ </span>
            <button onClick={() => onNavigate('login')} className="text-primary hover:underline font-medium text-sm">
              立即登入
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}