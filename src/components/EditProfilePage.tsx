import { X, RefreshCw } from "lucide-react"; // 🌟 1. 把 Camera 換成 RefreshCw (重新整理/隨機圖示)
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState, useEffect } from "react"; // 🌟 2. 移除了 useRef，因為不需要 input file 了
import { toast } from "sonner";

interface EditProfilePageProps {
  onNavigate: (page: string) => void;
}

// 🌟 3. 加入隨機 Emoji 陣列 (跟註冊頁面一樣)
const randomEmojis = ["😺", "🐶", "🐻", "🐼", "🦁", "🦊", "🐨", "🦄", "🎨", "🛍️", "🚀", "🌟", "🍔", "🎮"];

export function EditProfilePage({ onNavigate }: EditProfilePageProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setEmail(user.email);
      setName(user.fullname || "");
      setAvatarUrl(user.avatarUrl || "");
      setAddress(user.address || "");
      setBio(user.bio || "");
    } else {
      onNavigate('login');
    }
  }, [onNavigate]);

  // 🌟 4. 把上傳圖片改成「隨機挑選 Emoji」的邏輯
  const handleRandomAvatar = () => {
    let newEmoji = avatarUrl;
    // 確保骰出來的跟現在不一樣
    while (newEmoji === avatarUrl) {
      const randomIndex = Math.floor(Math.random() * randomEmojis.length);
      newEmoji = randomEmojis[randomIndex];
    }
    setAvatarUrl(newEmoji);
    toast.success("已更換隨機頭貼！🎲");
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        email,
        fullname: name,
        address,
        bio,
        avatarUrl // 這裡現在只會傳純文字的 Emoji，超級省空間！
      };

      const response = await fetch('http://localhost:3001/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success("個人資料已更新！");

        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...storedUser, fullname: name, address, bio, avatarUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setTimeout(() => {
          onNavigate('profile');
        }, 800);
      } else {
        toast.error("更新失敗：" + data.message);
      }
    } catch (error) {
      toast.error("無法連線至伺服器");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => onNavigate('profile')}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white border border-border flex items-center justify-center transition-colors shadow-sm"
          aria-label="關閉"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-8">
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">編輯個人資料</h1>
              <p className="text-muted-foreground">更新您的個人資訊與聯絡方式</p>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-10">
              <div className="relative mb-4 group cursor-pointer" onClick={handleRandomAvatar}>
                <Avatar className="w-32 h-32 text-6xl shadow-md border-4 border-white">
                  <AvatarFallback className="bg-neutral-100 text-6xl select-none">
                    {avatarUrl || name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {/* 🌟 5. 滑鼠移過去的提示改成「旋轉更新」圖示 */}
                <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-white" />
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-full px-6"
                onClick={handleRandomAvatar}
              >
                隨機更換頭貼
              </Button>
              {/* 🌟 6. 已經徹底刪除 <input type="file" /> */}
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">登入信箱 (不可修改)</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="h-11 rounded-xl bg-neutral-100 border-border text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">真實姓名 (不可修改)</Label>
                <Input
                  id="name"
                  value={name}
                  disabled
                  className="h-11 rounded-xl bg-neutral-100 border-border text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">面交/寄件縣市 (選填)</Label>
                <select
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-11 rounded-xl bg-input-background border border-border px-3 text-sm focus-visible:ring-1 focus-visible:ring-primary outline-none"
                >
                  <option value="" disabled>請選擇縣市</option>
                  <option value="基隆市">基隆市</option>
                  <option value="台北市">台北市</option>
                  <option value="新北市">新北市</option>
                  <option value="桃園市">桃園市</option>
                  <option value="新竹市">新竹市</option>
                  <option value="新竹縣">新竹縣</option>
                  <option value="苗栗縣">苗栗縣</option>
                  <option value="台中市">台中市</option>
                  <option value="彰化縣">彰化縣</option>
                  <option value="南投縣">南投縣</option>
                  <option value="雲林縣">雲林縣</option>
                  <option value="嘉義市">嘉義市</option>
                  <option value="嘉義縣">嘉義縣</option>
                  <option value="台南市">台南市</option>
                  <option value="高雄市">高雄市</option>
                  <option value="屏東縣">屏東縣</option>
                  <option value="宜蘭縣">宜蘭縣</option>
                  <option value="花蓮縣">花蓮縣</option>
                  <option value="台東縣">台東縣</option>
                  <option value="澎湖縣">澎湖縣</option>
                  <option value="金門縣">金門縣</option>
                  <option value="連江縣">連江縣</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">自我介紹 (選填)</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="介紹一下您自己，增加買家對您的信任感..."
                  rows={4}
                  className="rounded-xl bg-input-background border-border resize-none focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-border">
              <Button
                onClick={handleSave}
                className="w-full h-12 rounded-full text-base font-medium"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "儲存中..." : "儲存變更"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}