import { Upload, X, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface PostItemPageProps {
  onNavigate: (page: string) => void;
  aiGeneratedData?: any;
}

export function PostItemPage({ onNavigate, aiGeneratedData }: PostItemPageProps) {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 當 AI 資料進來時自動填入
  useEffect(() => {
    if (aiGeneratedData) {
      if (aiGeneratedData.image) setImages([aiGeneratedData.image]);
      setTitle(aiGeneratedData.title || "");
      setDescription(aiGeneratedData.description || "");
      setCategory(aiGeneratedData.category || "");
      setCondition(aiGeneratedData.condition || "");
      setPrice(aiGeneratedData.price || "");
      toast.success("✨ 商品資訊已自動填入！");
    }
  }, [aiGeneratedData]);

  // 🌟 手動上傳圖片到 ImgBB
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      toast.error("最多只能上傳 3 張照片喔！");
      return;
    }

    setIsUploading(true);
    const IMGBB_API_KEY = "56b4b5dbdd71601bcf28d83010505b19"; // 👈 記得填入你的 Key

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setImages((prev) => [...prev, result.data.url]);
        toast.success("照片上傳成功！📸");
      } else {
        toast.error("上傳失敗，請稍後再試");
      }
    } catch (error) {
      toast.error("網路連線錯誤");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // 清空 input
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("請至少上傳一張照片");
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const postData = {
      title,
      description,
      category,
      condition,
      price,
      location,
      images,
      sellerEmail: user.email
    };

    try {
      const response = await fetch('http://localhost:3001/api/post-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success("商品刊登成功！🎉");
        onNavigate('profile');
      }
    } catch (error) {
      toast.error("發布失敗，請檢查後端連線");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => onNavigate('home')} className="mb-6 rounded-full">
          <ChevronLeft className="w-4 h-4 mr-2" /> 取消
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">刊登商品</h1>
          <p className="text-muted-foreground mt-2">填寫以下資訊以建立您的商品刊登</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="rounded-2xl border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-medium">商品照片</Label>
                {/* 🌟 你的 AI 智慧上傳按鈕回來啦！ */}
                <Button
                  type="button"
                  onClick={() => onNavigate('ai-camera')}
                  className="rounded-full gap-2 bg-neutral-900 hover:bg-neutral-800 text-white border-0 shadow-md"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4" />
                  AI 智慧上傳
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                最多可上傳 3 張照片，或使用 AI 智慧上傳自動填入資訊。第一張將作為封面圖。
              </p>

              <div className="grid grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-border">
                    <img src={image} alt="product" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground rounded-md text-[10px] font-bold">
                        封面圖
                      </div>
                    )}
                  </div>
                ))}

                {/* 手動上傳區塊 */}
                {images.length < 3 && (
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className={`w-6 h-6 ${isUploading ? 'animate-bounce' : 'text-neutral-400'}`} />
                    <span className="text-sm text-neutral-500">{isUploading ? '上傳中...' : '手動上傳'}</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">商品名稱 *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：復古實木椅" className="rounded-xl h-11 bg-white border-border" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">商品描述 *</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述一下商品的使用狀況、尺寸等..." className="rounded-xl min-h-32 bg-white border-border resize-none" required />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>分類 *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="rounded-xl h-11 bg-white border-border">
                      <SelectValue placeholder="選擇分類" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">電子產品</SelectItem>
                      <SelectItem value="furniture">家具</SelectItem>
                      <SelectItem value="fashion">服飾配件</SelectItem>
                      <SelectItem value="sports">運動用品</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>商品狀況 *</Label>
                  <Select value={condition} onValueChange={setCondition} required>
                    <SelectTrigger className="rounded-xl h-11 bg-white border-border">
                      <SelectValue placeholder="選擇狀況" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">全新</SelectItem>
                      <SelectItem value="like-new">近全新</SelectItem>
                      <SelectItem value="good">良好</SelectItem>
                      <SelectItem value="fair">尚可</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">售價 *</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">NT$</span>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="rounded-xl h-11 bg-white border-border pl-14" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">面交地點 *</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例如：台北市信義區" className="rounded-xl h-11 bg-white border-border" required />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" size="lg" className="flex-1 rounded-full" onClick={() => onNavigate('home')}>取消</Button>
            <Button type="submit" size="lg" className="flex-1 rounded-full" disabled={isUploading}>
              {isUploading ? "圖片上傳中..." : "發布刊登"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}