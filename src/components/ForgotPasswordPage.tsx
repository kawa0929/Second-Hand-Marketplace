import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { KeyRound, X } from "lucide-react"; // 換成鑰匙圖示 🔑

interface ForgotPasswordPageProps {
    onNavigate: (page: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
    const [email, setEmail] = useState<string>("");
    const [userInputCode, setUserInputCode] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [isSending, setIsSending] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 1. 發送驗證信邏輯 (完全沿用註冊的 API)
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
                alert('驗證碼已模擬發送！請去 VS Code 的終端機查看。');
            } else {
                alert('發送失敗：' + data.message);
            }
        } catch (error) {
            alert('無法連線至後端伺服器，請確認 node index.js 是否正在執行。');
        } finally {
            setIsSending(false);
        }
    };

    // 2. 驗證並重設密碼的邏輯
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userInputCode) {
            alert("請輸入驗證碼！");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("兩次輸入的密碼不一致，請重新確認！");
            return;
        }

        setIsLoading(true);
        try {
            // 步驟 A：先驗證驗證碼對不對 (沿用註冊時的驗證 API)
            const verifyResponse = await fetch('http://localhost:3001/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: userInputCode })
            });
            const verifyData = await verifyResponse.json();

            if (!verifyData.success) {
                alert("驗證碼輸入錯誤或已過期，請再試一次。");
                setIsLoading(false);
                return;
            }

            // 步驟 B：驗證碼對了！呼叫新的「重設密碼」API
            const resetResponse = await fetch('http://localhost:3001/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword })
            });
            const resetData = await resetResponse.json();

            if (resetData.success) {
                alert("密碼重設成功！請使用新密碼登入。🎉");
                onNavigate('login'); // 成功後導回登入頁面
            } else {
                alert("重設失敗：" + resetData.message);
            }

        } catch (error) {
            alert("系統發生錯誤，請確認後端伺服器狀態。");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 py-12">
            <Card className="w-full max-w-md rounded-2xl border-border relative">
                <button onClick={() => onNavigate('login')} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1 hover:bg-neutral-100">
                    <X className="w-5 h-5" />
                </button>

                <CardHeader className="text-center space-y-4 pb-6">
                    <div className="flex justify-center">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                            <KeyRound className="w-6 h-6 text-primary-foreground" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-2xl">重設密碼</CardTitle>
                        <CardDescription className="mt-2 text-base">請輸入您的電子郵件以獲取驗證碼</CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">電子郵件</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="rounded-xl h-11 bg-input-background border-0" required />
                        </div>

                        {/* 驗證碼 */}
                        <div className="space-y-2">
                            <Label htmlFor="verification">信箱驗證碼</Label>
                            <div className="flex gap-2">
                                <Input id="verification" value={userInputCode} onChange={(e) => setUserInputCode(e.target.value)} placeholder="輸入 6 位數驗證碼" className="rounded-xl h-11 bg-input-background border-0 flex-1" required />
                                <Button type="button" variant="secondary" className="h-11 rounded-xl px-4 hover:bg-neutral-200" onClick={handleSendOTP} disabled={isSending}>
                                    {isSending ? "傳送中..." : "發送驗證信"}
                                </Button>
                            </div>
                        </div>

                        {/* 新密碼 */}
                        <div className="space-y-2">
                            <Label htmlFor="new-password">設定新密碼</Label>
                            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="請輸入 8 位以上英數字" className="rounded-xl h-11 bg-input-background border-0" required />
                        </div>

                        {/* 確認新密碼 */}
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">確認新密碼</Label>
                            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="請再次輸入新密碼" className="rounded-xl h-11 bg-input-background border-0" required />
                        </div>

                        <Button type="submit" className="w-full rounded-xl h-11 text-base font-medium mt-2" disabled={isLoading}>
                            {isLoading ? "處理中..." : "重設密碼"}
                        </Button>
                    </form>

                    <div className="text-center pt-6">
                        <span className="text-muted-foreground text-sm">想起密碼了？ </span>
                        <button onClick={() => onNavigate('login')} className="text-primary hover:underline font-medium text-sm">
                            立即登入
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}