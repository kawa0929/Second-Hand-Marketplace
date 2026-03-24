import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Package, X } from "lucide-react";

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: () => void;
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        alert(`登入成功！歡迎 ${data.user.fullname} 👏`);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin();

        if (data.user.role === 'admin') {
          console.log('🚨 管理員登入，已取得最高權限！');
          onNavigate('home'); // 如果有後台頁面可以改成 'admin'
        } else {
          onNavigate('home');
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("無法連線至伺服器，請確認後端 Node.js 是否正在執行。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl border-border relative">
        <button
          onClick={() => onNavigate('home')}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1 hover:bg-neutral-100"
          aria-label="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle>歡迎回來</CardTitle>
            <CardDescription className="mt-2">
              登入您的帳戶以繼續使用
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="rounded-xl h-11 bg-input-background border-0"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密碼</Label>
                {/* 🌟 忘記密碼的按鈕在這裡，設定導向 forgot-password 頁面 */}
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  忘記密碼？
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入您的密碼"
                className="rounded-xl h-11 bg-input-background border-0"
                required
              />
            </div>

            <Button type="submit" className="w-full rounded-xl h-11" disabled={isLoading}>
              {isLoading ? "登入中..." : "登入"}
            </Button>
          </form>

          {/* Google 按鈕和分隔線已經被刪除了 🗑️ */}

          <div className="text-center">
            <span className="text-muted-foreground">還沒有帳戶？ </span>
            <button onClick={() => onNavigate('register')} className="text-primary hover:underline">
              立即註冊
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}