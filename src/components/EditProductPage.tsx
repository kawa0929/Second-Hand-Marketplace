import { Upload, X, ChevronLeft, Save } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface EditProductPageProps {
    onNavigate: (page: string) => void;
    productId: string; // 🌟 必須傳入商品 ID 才知道要編輯哪一個
}

export function EditProductPage({ onNavigate, productId }: EditProductPageProps) {
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [price, setPrice] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🌟 一進頁面，馬上用 ID 去後端撈舊資料來填格子
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/product/${productId}`);
                const data = await res.json();
                if (data.success) {
                    const p = data.product;
                    setTitle(p.title);
                    setDescription(p.description);
                    setCategory(p.category);
                    setCondition(p.condition);
                    setPrice(p.price.toString());
                    setImages(p.images || []);
                } else {
                    toast.error("找不到該商品資料");
                    onNavigate('profile');
                }
            } catch (error) {
                toast.error("連線錯誤");
            } finally {
                setIsLoading(false);
            }
        };

        if (productId) fetchProduct();
    }, [productId, onNavigate]);

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
                toast.error("上傳失敗");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0) {
            toast.error("請至少保留一張照片");
            return;
        }

        const updateData = { title, description, category, condition, price, images };

        try {
            // 🌟 呼叫 PUT API 更新資料
            const response = await fetch(`http://localhost:3001/api/product/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            const data = await response.json();
            if (data.success) {
                toast.success("商品更新成功！🎉");
                onNavigate('profile');
            }
        } catch (error) {
            toast.error("更新失敗，請檢查網路");
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">載入中...</div>;

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Button variant="ghost" onClick={() => onNavigate('profile')} className="mb-6 rounded-full">
                    <ChevronLeft className="w-4 h-4 mr-2" /> 返回我的商品
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">編輯商品</h1>
                    <p className="text-muted-foreground mt-2">更新您的商品資訊</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="rounded-2xl border-border">
                        <CardContent className="p-6">
                            <Label className="text-lg font-medium mb-4 block">商品照片</Label>
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
                                    </div>
                                ))}
                                {images.length < 3 && (
                                    <button
                                        type="button"
                                        disabled={isUploading}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-primary transition-all flex flex-col items-center justify-center gap-2"
                                    >
                                        <Upload className={`w-6 h-6 ${isUploading ? 'animate-bounce' : 'text-neutral-400'}`} />
                                        <span className="text-sm text-neutral-500">{isUploading ? '上傳中...' : '新增照片'}</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border">
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>商品名稱 *</Label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl h-11 bg-white" required />
                            </div>
                            <div className="space-y-2">
                                <Label>商品描述 *</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl min-h-32 bg-white resize-none" required />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>分類 *</Label>
                                    <Select value={category} onValueChange={setCategory} required>
                                        <SelectTrigger className="rounded-xl h-11 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* 🌟 補齊所有分類 */}
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
                                    <Label>商品狀況 *</Label>
                                    <Select value={condition} onValueChange={setCondition} required>
                                        <SelectTrigger className="rounded-xl h-11 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* 🌟 補齊極佳 (excellent) */}
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
                        <CardContent className="p-6">
                            <div className="space-y-2">
                                <Label>售價 *</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">NT$</span>
                                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl h-11 bg-white pl-14" required />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-full rounded-full" disabled={isUploading}>
                        <Save className="w-5 h-5 mr-2" />
                        {isUploading ? "圖片處理中..." : "儲存變更"}
                    </Button>
                </form>
            </div>
        </div>
    );
}