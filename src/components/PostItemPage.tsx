import { Upload, X, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner@2.0.3";

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

  // Auto-fill form when AI data is available
  useEffect(() => {
    if (aiGeneratedData) {
      setImages([aiGeneratedData.image]);
      setTitle(aiGeneratedData.title);
      setDescription(aiGeneratedData.description);
      setCategory(aiGeneratedData.category);
      setCondition(aiGeneratedData.condition);
      setPrice(aiGeneratedData.price);
      toast.success("✨ 商品資訊已自動填入！");
    }
  }, [aiGeneratedData]);

  const handleImageUpload = () => {
    // Mock image upload
    const mockImage = "https://images.unsplash.com/photo-1759643161985-5fcb6dfc9a13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZnVybml0dXJlJTIwY2hhaXJ8ZW58MXx8fHwxNzYyODY0NDA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    if (images.length < 6) {
      setImages([...images, mockImage]);
    }
  };

  const handleAISmartUpload = () => {
    // Navigate to AI camera page
    onNavigate('ai-camera');
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('profile');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('home')}
          className="mb-6 rounded-full"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          取消
        </Button>

        <div className="mb-8">
          <h1>刊登商品</h1>
          <p className="text-muted-foreground mt-2">
            填寫以下資訊以建立您的商品刊登
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <Card className="rounded-2xl border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label>商品照片</Label>
                <Button
                  type="button"
                  onClick={handleAISmartUpload}
                  className="rounded-full gap-2"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4" />
                  AI 智慧上傳
                </Button>
              </div>
              <p className="text-muted-foreground mb-4">
                最多可上傳 6 張照片，或使用 AI 智慧上傳自動填入資訊。
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
                    <img src={image} alt={`上傳 ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs">
                        封面
                      </div>
                    )}
                  </div>
                ))}
                
                {images.length < 6 && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-neutral-50 transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-muted-foreground">上傳</span>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="rounded-2xl border-border">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">商品名稱 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：復古實木椅"
                  className="rounded-xl h-11 bg-input-background border-0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">商品描述 *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="詳細描述您的商品..."
                  className="rounded-xl min-h-32 bg-input-background border-0 resize-none"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">分類 *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category" className="rounded-xl h-11 bg-input-background border-0">
                      <SelectValue placeholder="選擇分類" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">電子產品</SelectItem>
                      <SelectItem value="furniture">家具</SelectItem>
                      <SelectItem value="fashion">服飾配件</SelectItem>
                      <SelectItem value="sports">運動用品</SelectItem>
                      <SelectItem value="books">書籍</SelectItem>
                      <SelectItem value="home">居家園藝</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">商品狀況 *</Label>
                  <Select value={condition} onValueChange={setCondition} required>
                    <SelectTrigger id="condition" className="rounded-xl h-11 bg-input-background border-0">
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

          {/* Price & Location */}
          <Card className="rounded-2xl border-border">
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">售價 *</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">NT$</span>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      className="rounded-xl h-11 bg-input-background border-0 pl-14"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">地點 *</Label>
                  <Input
                    id="location"
                    placeholder="城市/縣市"
                    className="rounded-xl h-11 bg-input-background border-0"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 rounded-xl"
              onClick={() => onNavigate('home')}
            >
              取消
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 rounded-xl"
            >
              發布刊登
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}