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
  previousPage?: string;
}

export function PostItemPage({ onNavigate, aiGeneratedData, previousPage = 'home' }: PostItemPageProps) {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aiGeneratedData) {
      if (aiGeneratedData.image) setImages([aiGeneratedData.image]);
      setTitle(aiGeneratedData.title || "");
      setDescription(aiGeneratedData.description || "");
      setCategory(aiGeneratedData.category || "");
      setCondition(aiGeneratedData.condition || "");
      setPrice(aiGeneratedData.price || "");
      setStock("1");
      toast.success("✨ 商品資訊已自動填入！");
    }
  }, [aiGeneratedData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      toast.error("最多只能上傳 3 張照片喔！");
      return;
    }

    setIsUploading(true);
    const IMGBB_API_KEY = "56b4b5dbdd71601bcf28d83010505b19";

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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // 🌟 強化版防呆驗證
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 照片驗證
    if (images.length === 0) {
      toast.error("請至少上傳一張商品照片！");
      return;
    }

    // 2. 名稱驗證
    if (!title.trim()) {
      toast.error("請填寫商品名稱！");
      return;
    }
    if (title.trim().length > 60) {
      toast.error("商品名稱不可超過 60 個字！");
      return;
    }

    // 3. 描述驗證
    if (!description.trim()) {
      toast.error("請填寫商品描述！");
      return;
    }
    if (description.trim().length < 5) {
      toast.error("商品描述太短囉，請至少輸入 5 個字！");
      return;
    }
    if (description.trim().length > 3000) {
      toast.error("商品描述不可超過 3000 個字！");
      return;
    }

    // 4. 下拉選單驗證
    if (!category) {
      toast.error("請選擇商品分類！");
      return;
    }
    if (!condition) {
      toast.error("請選擇商品狀況！");
      return;
    }

    // 5. 售價驗證
    if (!price || Number(price) <= 0) {
      toast.error("請輸入有效的商品售價！");
      return;
    }

    // 6. 數量驗證
    if (!stock || parseInt(stock) < 1 || isNaN(parseInt(stock))) {
      toast.error("商品數量至少需要 1 件！");
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const postData = {
      title,
      description,
      category,
      condition,
      price: Number(price),
      stock: parseInt(stock),
      location: "",
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
        <Button variant="ghost" onClick={() => onNavigate(previousPage)} className="mb-6 rounded-full">
          <ChevronLeft className="w-4 h-4 mr-2" /> 取消
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">刊登商品</h1>
          <p className="text-muted-foreground mt-2">填寫以下資訊以建立您的商品刊登</p>
        </div>

        {/* 🌟 移除 form 標籤預設的驗證行為，交由 handleSubmit 處理 */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <Card className="rounded-2xl border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-medium">商品照片 <span className="text-red-500">*</span></Label>
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
                <div className="flex justify-between items-end">
                  <Label htmlFor="title">商品名稱 <span className="text-red-500">*</span></Label>
                  <span className={`text-xs ${title.length > 60 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>{title.length}/60</span>
                </div>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={60}
                  placeholder="例如：復古實木椅"
                  className="rounded-xl h-11 bg-white border-border"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <Label htmlFor="description">商品描述 <span className="text-red-500">*</span></Label>
                  <span className={`text-xs ${description.length > 3000 || (description.length > 0 && description.length < 5) ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>{description.length}/3000</span>
                </div>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={3000}
                  placeholder="最少輸入 5 個字，描述一下商品的使用狀況、尺寸等..."
                  className="rounded-xl min-h-32 bg-white border-border resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>分類 <span className="text-red-500">*</span></Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-xl h-11 bg-white border-border">
                      <SelectValue placeholder="選擇分類" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">電子產品</SelectItem>
                      <SelectItem value="furniture">家具</SelectItem>
                      <SelectItem value="fashion">服飾配件</SelectItem>
                      <SelectItem value="sports">運動用品</SelectItem>
                      <SelectItem value="books">書籍</SelectItem>
                      <SelectItem value="toys">玩具</SelectItem>
                      <SelectItem value="plants">居家園藝</SelectItem>
                      <SelectItem value="kitchen">廚房用品</SelectItem>
                      <SelectItem value="idol">偶像周邊</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>商品狀況 <span className="text-red-500">*</span></Label>
                  <Select value={condition} onValueChange={setCondition}>
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
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">售價 <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">NT$</span>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="rounded-xl h-11 bg-white border-border pl-14" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">商品數量 <span className="text-red-500">*</span></Label>
                  <Input
                    id="stock"
                    type="number"
                    min="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="輸入數量 (預設為 1)"
                    className="rounded-xl h-11 bg-white border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" size="lg" className="flex-1 rounded-full" onClick={() => onNavigate(previousPage)}>取消</Button>
            <Button type="submit" size="lg" className="flex-1 rounded-full" disabled={isUploading}>
              {isUploading ? "圖片上傳中..." : "發布刊登"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}