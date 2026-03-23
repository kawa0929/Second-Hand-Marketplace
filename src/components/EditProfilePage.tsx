import { X, Camera } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState, useRef } from "react";
import { toast } from "sonner@2.0.3";

interface EditProfilePageProps {
  onNavigate: (page: string) => void;
}

export function EditProfilePage({ onNavigate }: EditProfilePageProps) {
  const [name, setName] = useState("王曉民");
  const [address, setAddress] = useState("台北市");
  const [bio, setBio] = useState("熱愛復古物件和永續購物。總是在尋找獨特的單品來增添我的收藏！");
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 在真實應用中，這裡會上傳圖片
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast.success("頭貼已更新");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // 在真實應用中，這裡會保存到後端
    toast.success("個人資料已更新");
    setTimeout(() => {
      onNavigate('profile');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Close Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => onNavigate('profile')}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white border border-border flex items-center justify-center transition-colors"
          aria-label="關閉"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2">編輯個人資料</h1>
              <p className="text-muted-foreground">更新您的個人資訊</p>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl">王</AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
                  aria-label="更換頭貼"
                >
                  <Camera className="w-5 h-5 text-primary-foreground" />
                </button>
              </div>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={handleAvatarClick}
              >
                更換頭貼
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">名稱</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="輸入您的名稱"
                  className="h-11 rounded-xl bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">地址</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="輸入您的地址"
                  className="h-11 rounded-xl bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">自我介紹</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="介紹一下您自己..."
                  rows={4}
                  className="rounded-xl bg-input-background border-border resize-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-border">
              <Button
                onClick={handleSave}
                className="w-full h-12 rounded-full"
                size="lg"
              >
                儲存變更
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}