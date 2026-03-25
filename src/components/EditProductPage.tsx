import { Upload, X, ChevronLeft, Save, Trash2, Archive, ArchiveRestore } from "lucide-react";
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
    productId: string;
}

export function EditProductPage({ onNavigate, productId }: EditProductPageProps) {
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("1");
    const [status, setStatus] = useState("上架中"); // 🌟 新增：追蹤目前商品的狀態
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);

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
                    setStock(p.stock ? p.stock.toString() : "1");
                    setStatus(p.status || "上架中"); // 🌟 載入狀態
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
        if (parseInt(stock) < 1 || isNaN(parseInt(stock))) {
            toast.error("數量請至少輸入 1");
            return;
        }

        const updateData = {
            title, description, category, condition,
            price: Number(price), stock: parseInt(stock), images
        };

        try {
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

    // 🌟 功能：切換上下架狀態
    const handleToggleStatus = async () => {
        const newStatus = status === "上架中" ? "已下架" : "上架中";
        try {
            const response = await fetch(`http://localhost:3001/api/product/${productId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                setStatus(newStatus);
                toast.success(`商品${newStatus}成功！`);
            }
        } catch (error) {
            toast.error("狀態更新失敗，請檢查網路");
        }
    };

    // 🌟 功能：永久刪除商品
    const handleDelete = async () => {
        // 防呆：跳出原生的確認視窗
        const confirmDelete = window.confirm("⚠️ 確定要永久刪除這個商品嗎？\n刪除後將無法復原喔！");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:3001/api/product/${productId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                toast.success("商品已永久刪除！🗑️");
                onNavigate('profile'); // 刪除後直接退回個人頁面
            }
        } catch (error) {
            toast.error("刪除失敗，請檢查網路");
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">載入中...</div>;

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Button variant="ghost" onClick={() => onNavigate('profile')} className="mb-6 rounded-full">
                    <ChevronLeft className="w-4 h-4 mr-2" /> 返回我的商品
                </Button>

                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            編輯商品
                            {/* 🌟 狀態標籤 */}
                            {status === "已下架" && (
                                <span className="text-sm px-3 py-1 bg-neutral-200 text-neutral-600 rounded-full font-medium">已下架</span>
                            )}
                        </h1>
                        <p className="text-muted-foreground mt-2">更新您的商品資訊</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="rounded-2xl border-border">
                        <CardContent className="p-6">
                            <Label className="text-lg font-medium mb-4 block">商品照片</Label>
                            <div className="grid grid-cols-3 gap-4">
                                {images.map((image, index) => (
                                    <div key={index} className={`relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-border ${status === "已下架" ? "grayscale opacity-70" : ""}`}>
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
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl h-11 bg-white" required disabled={status === "已下架"} />
                            </div>
                            <div className="space-y-2">
                                <Label>商品描述 *</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl min-h-32 bg-white resize-none" required disabled={status === "已下架"} />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>分類 *</Label>
                                    <Select value={category} onValueChange={setCategory} required disabled={status === "已下架"}>
                                        <SelectTrigger className="rounded-xl h-11 bg-white">
                                            <SelectValue />
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
                                    <Label>商品狀況 *</Label>
                                    <Select value={condition} onValueChange={setCondition} required disabled={status === "已下架"}>
                                        <SelectTrigger className="rounded-xl h-11 bg-white">
                                            <SelectValue />
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
                        <CardContent className="p-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>售價 *</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">NT$</span>
                                        <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl h-11 bg-white pl-14" required disabled={status === "已下架"} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>商品數量 *</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        className="rounded-xl h-11 bg-white"
                                        required
                                        disabled={status === "已下架"}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 儲存變更按鈕 */}
                    <Button type="submit" size="lg" className="w-full rounded-full" disabled={isUploading || status === "已下架"}>
                        <Save className="w-5 h-5 mr-2" />
                        {isUploading ? "圖片處理中..." : (status === "已下架" ? "下架中無法編輯" : "儲存變更")}
                    </Button>
                </form>

                {/* 🌟 進階商品管理：下架與刪除 */}
                <div className="mt-12 pt-8 border-t border-border">
                    <h3 className="text-lg font-bold text-red-500 mb-4">危險區域 (商品管理)</h3>
                    <Card className="rounded-2xl border-red-100 bg-red-50/50">
                        <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div>
                                <h4 className="font-bold mb-1">
                                    {status === "上架中" ? "暫時下架商品" : "重新上架商品"}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {status === "上架中"
                                        ? "商品將不會顯示在首頁與搜尋中，您可以隨時重新上架。"
                                        : "商品將重新開放讓大家搜尋與購買。"}
                                </p>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    className="flex-1 sm:flex-none rounded-xl bg-white hover:bg-neutral-100"
                                    onClick={handleToggleStatus}
                                >
                                    {status === "上架中" ? (
                                        <><Archive className="w-4 h-4 mr-2" /> 暫時下架</>
                                    ) : (
                                        <><ArchiveRestore className="w-4 h-4 mr-2" /> 重新上架</>
                                    )}
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1 sm:flex-none rounded-xl"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    永久刪除
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}