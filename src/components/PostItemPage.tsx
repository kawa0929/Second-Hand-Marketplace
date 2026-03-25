import { Upload, X, ChevronLeft, Sparkles, Plus, Trash2 } from "lucide-react";
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

interface Variation {
  id: string;
  name: string;
  price: string;
  stock: string;
}

export function PostItemPage({ onNavigate, aiGeneratedData, previousPage = 'home' }: PostItemPageProps) {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [variations, setVariations] = useState<Variation[]>([
    { id: Date.now().toString(), name: "", price: "", stock: "1" }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aiGeneratedData) {
      if (aiGeneratedData.image) setImages([aiGeneratedData.image]);
      setTitle(aiGeneratedData.title || "");
      setDescription(aiGeneratedData.description || "");
      setCategory(aiGeneratedData.category || "");
      setCondition(aiGeneratedData.condition || "");

      if (aiGeneratedData.price) {
        setVariations([{ id: Date.now().toString(), name: "", price: aiGeneratedData.price.toString(), stock: "1" }]);
      }
      toast.success("✨ 商品資訊已自動填入！");
    }
  }, [aiGeneratedData]);

  // 🌟 修改：加入雙 API Key 輪替機制，並移除本機假網址預覽
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      toast.error("最多只能上傳 3 張照片喔！");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("圖片檔案太大囉！請選擇 5MB 以下的照片。");
      return;
    }

    setIsUploading(true);

    // 🌟 把你申請到的兩把 Key 都放在這個陣列裡
    const IMGBB_API_KEYS = [
      "f428676453b3be7a71b6eb5ffe777c91", // 👈 新申請的 Key！
      "56b4b5dbdd71601bcf28d83010505b19" // 這把你原本舊的就當作備用
    ];

    let uploadSuccess = false;
    let uploadedUrl = "";

    // 🌟 開始輪替測試：如果第一把失敗，就自動試第二把
    for (const apiKey of IMGBB_API_KEYS) {
      if (!apiKey || apiKey.includes("請填入")) continue; // 防呆，跳過沒填的預設文字

      try {
        const formData = new FormData();
        formData.append("image", file);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超時

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const result = await response.json();

        if (result.success) {
          uploadedUrl = result.data.url;
          uploadSuccess = true;
          break; // 🎯 成功了！跳出迴圈，不用再試下一把 Key
        }
      } catch (error) {
        console.warn(`Key ${apiKey} 上傳失敗，嘗試下一把...`, error);
        // 失敗了就什麼都不做，讓迴圈繼續跑，去試下一把 Key
      }
    }

    // 🌟 判斷最終結果
    if (uploadSuccess) {
      setImages((prev) => [...prev, uploadedUrl]);
      toast.success("照片上傳成功！📸");
    } else {
      // 兩把 Key 都失敗，直接報錯，不再存入 blob 假網址
      toast.error("圖片上傳失敗，請確認 API Key 額度或稍後再試！");
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addVariation = () => {
    if (variations.length >= 10) {
      toast.error("最多只能新增 10 種規格喔！");
      return;
    }
    setVariations([...variations, { id: Date.now().toString(), name: "", price: "", stock: "1" }]);
  };

  const removeVariation = (id: string) => {
    if (variations.length === 1) {
      toast.error("至少要保留一個規格喔！");
      return;
    }
    setVariations(variations.filter(v => v.id !== id));
  };

  const updateVariation = (id: string, field: keyof Variation, value: string) => {
    setVariations(variations.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("請至少上傳一張商品照片！");
      return;
    }
    if (!title.trim()) {
      toast.error("請填寫商品名稱！");
      return;
    }
    if (title.trim().length > 60) {
      toast.error("商品名稱不可超過 60 個字！");
      return;
    }
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
    if (!category) {
      toast.error("請選擇商品分類！");
      return;
    }
    if (!condition) {
      toast.error("請選擇商品狀況！");
      return;
    }

    const isMultiVariation = variations.length > 1;

    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      
      if (isMultiVariation && !v.name.trim()) {
        toast.error(`請填寫第 ${i + 1} 個規格的名稱！`);
        return;
      }

      if (!v.price || Number(v.price) <= 0) {
        toast.error(`請填寫第 ${i + 1} 個規格的有效售價！`);
        return;
      }
      if (!v.stock || parseInt(v.stock) < 1 || isNaN(parseInt(v.stock))) {
        toast.error(`請填寫第 ${i + 1} 個規格的數量 (至少 1)！`);
        return;
      }
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const postData = {
      title,
      description,
      category,
      condition,
      price: Number(variations[0].price),
      stock: variations.reduce((sum, v) => sum + parseInt(v.stock), 0),
      variations: variations.map(v => ({
        name: v.name.trim() || "單一款式",
        price: Number(v.price),
        stock: parseInt(v.stock)
      })),
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
                最多可上傳 3 張照片。第一張將作為封面圖。
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
                  placeholder="請輸入商品名稱"
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
                      <SelectItem value="excellent">極佳</SelectItem>
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
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <Label className="text-lg font-medium">售價與數量 <span className="text-red-500">*</span></Label>
                  <p className="text-sm text-muted-foreground mt-1">若有多款商品（如款式 A、款式 B），請點擊新增規格。</p>
                </div>
                <Button type="button" variant="outline" onClick={addVariation} className="rounded-full shadow-sm hover:bg-neutral-100">
                  <Plus className="w-4 h-4 mr-1" /> 新增規格
                </Button>
              </div>

              <div className="space-y-4">
                {variations.map((variation, index) => (
                  <div key={variation.id} className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100 relative">
                    
                    <div className="w-full sm:flex-1 space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        款式名稱 {variations.length > 1 && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        placeholder={variations.length > 1 ? "請輸入款式名稱 (如：A款)" : "單一商品可留空"}
                        value={variation.name}
                        onChange={(e) => updateVariation(variation.id, 'name', e.target.value)}
                        className="bg-white rounded-lg"
                      />
                    </div>
                    
                    <div className="w-full sm:w-32 space-y-2">
                      <Label className="text-xs text-muted-foreground">單價 (NT$) <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={variation.price}
                        onChange={(e) => updateVariation(variation.id, 'price', e.target.value)}
                        className="bg-white rounded-lg"
                      />
                    </div>
                    
                    <div className="w-full sm:w-24 space-y-2">
                      <Label className="text-xs text-muted-foreground">數量 <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        min="1"
                        value={variation.stock}
                        onChange={(e) => updateVariation(variation.id, 'stock', e.target.value)}
                        className="bg-white rounded-lg"
                      />
                    </div>

                    {variations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariation(variation.id)}
                        className="text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full sm:mb-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
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