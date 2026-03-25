import { Upload, X, ChevronLeft, Save, Trash2, Archive, ArchiveRestore, Plus } from "lucide-react";
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

interface Variation {
    id: string;
    name: string;
    price: string;
    stock: string;
}

export function EditProductPage({ onNavigate, productId }: EditProductPageProps) {
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [status, setStatus] = useState("上架中");
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [variations, setVariations] = useState<Variation[]>([]);

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
                    setStatus(p.status || "上架中");
                    setImages(p.images || []);

                    if (p.variations && p.variations.length > 0) {
                        setVariations(p.variations.map((v: any, index: number) => ({
                            id: Date.now().toString() + index,
                            name: v.name === "單一款式" ? "" : v.name, // 如果是預設值，在編輯時清空
                            price: v.price.toString(),
                            stock: v.stock.toString()
                        })));
                    } else {
                        setVariations([{
                            id: Date.now().toString(),
                            name: "",
                            price: p.price ? p.price.toString() : "",
                            stock: p.stock ? p.stock.toString() : "1"
                        }]);
                    }
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

        if (file.size > 5 * 1024 * 1024) {
            toast.error("圖片檔案太大囉！請選擇 5MB 以下的照片。");
            return;
        }

        setIsUploading(true);
        const IMGBB_API_KEY = "56b4b5dbdd71601bcf28d83010505b19";

        try {
            const formData = new FormData();
            formData.append("image", file);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: "POST",
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const result = await response.json();

            if (result.success) {
                setImages((prev) => [...prev, result.data.url]);
                toast.success("照片上傳成功！📸");
            } else {
                throw new Error("ImgBB API 回傳失敗");
            }
        } catch (error) {
            console.warn("上傳到 ImgBB 失敗，啟動備用機制:", error);
            const localPreviewUrl = URL.createObjectURL(file);
            setImages((prev) => [...prev, localPreviewUrl]);
            toast.info("已啟用本機圖片預覽模式！");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
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

        if (images.length === 0) return toast.error("請至少保留一張照片");
        if (!title.trim() || title.length > 60) return toast.error("請正確填寫商品名稱 (最多 60 字)！");
        if (!description.trim() || description.length < 5 || description.length > 3000) return toast.error("請正確填寫商品描述 (5~3000 字)！");
        if (!category) return toast.error("請選擇商品分類！");
        if (!condition) return toast.error("請選擇商品狀況！");

        const isMultiVariation = variations.length > 1;

        for (let i = 0; i < variations.length; i++) {
            const v = variations[i];
            
            if (isMultiVariation && !v.name.trim()) {
                return toast.error(`請填寫第 ${i + 1} 個規格的名稱！`);
            }
            if (!v.price || Number(v.price) <= 0) return toast.error(`請填寫第 ${i + 1} 個規格的有效售價！`);
            if (!v.stock || parseInt(v.stock) < 1 || isNaN(parseInt(v.stock))) return toast.error(`請填寫第 ${i + 1} 個規格的數量 (至少 1)！`);
        }

        const updateData = {
            title,
            description,
            category,
            condition,
            images,
            price: Number(variations[0].price),
            stock: variations.reduce((sum, v) => sum + parseInt(v.stock), 0),
            variations: variations.map(v => ({
                name: v.name.trim() || "單一款式", // 🌟 如果沒填，自動補上預設名稱
                price: Number(v.price),
                stock: parseInt(v.stock)
            }))
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

    const handleDelete = async () => {
        const confirmDelete = window.confirm("⚠️ 確定要永久刪除這個商品嗎？\n刪除後將無法復原喔！");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:3001/api/product/${productId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                toast.success("商品已永久刪除！🗑️");
                onNavigate('profile');
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
                            {status === "已下架" && (
                                <span className="text-sm px-3 py-1 bg-neutral-200 text-neutral-600 rounded-full font-medium">已下架</span>
                            )}
                        </h1>
                        <p className="text-muted-foreground mt-2">更新您的商品資訊</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
                                            disabled={status === "已下架"}
                                            className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 3 && (
                                    <button
                                        type="button"
                                        disabled={isUploading || status === "已下架"}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-primary transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <div className="flex justify-between items-end">
                                    <Label>商品名稱 <span className="text-red-500">*</span></Label>
                                    <span className={`text-xs ${title.length > 60 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>{title.length}/60</span>
                                </div>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="請輸入商品名稱" className="rounded-xl h-11 bg-white" required disabled={status === "已下架"} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <Label>商品描述 <span className="text-red-500">*</span></Label>
                                    <span className={`text-xs ${description.length > 3000 || (description.length > 0 && description.length < 5) ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>{description.length}/3000</span>
                                </div>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={3000} placeholder="最少輸入 5 個字..." className="rounded-xl min-h-32 bg-white resize-none" required disabled={status === "已下架"} />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>分類 <span className="text-red-500">*</span></Label>
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
                                    <Label>商品狀況 <span className="text-red-500">*</span></Label>
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
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between border-b pb-4 mb-4">
                                <div>
                                    <Label className="text-lg font-medium">款式規格與售價 <span className="text-red-500">*</span></Label>
                                    <p className="text-sm text-muted-foreground mt-1">您可以隨時新增或修改商品的規格款式。</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addVariation}
                                    disabled={status === "已下架"}
                                    className="rounded-full shadow-sm hover:bg-neutral-100 disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> 新增規格
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {variations.map((variation) => (
                                    <div key={variation.id} className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100 relative">
                                        <div className="w-full sm:flex-1 space-y-2">
                                            <Label className="text-xs text-muted-foreground">
                                                款式名稱 {variations.length > 1 && <span className="text-red-500">*</span>}
                                            </Label>
                                            <Input
                                                placeholder={variations.length > 1 ? "請輸入款式名稱 (如：A款)" : "單一商品可留空"}
                                                value={variation.name}
                                                onChange={(e) => updateVariation(variation.id, 'name', e.target.value)}
                                                className="bg-white"
                                                disabled={status === "已下架"}
                                            />
                                        </div>
                                        <div className="w-full sm:w-32 space-y-2">
                                            <Label className="text-xs text-muted-foreground">單價 (NT$) <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={variation.price}
                                                onChange={(e) => updateVariation(variation.id, 'price', e.target.value)}
                                                className="bg-white"
                                                disabled={status === "已下架"}
                                            />
                                        </div>
                                        <div className="w-full sm:w-24 space-y-2">
                                            <Label className="text-xs text-muted-foreground">數量 <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={variation.stock}
                                                onChange={(e) => updateVariation(variation.id, 'stock', e.target.value)}
                                                className="bg-white"
                                                disabled={status === "已下架"}
                                            />
                                        </div>

                                        {variations.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeVariation(variation.id)}
                                                disabled={status === "已下架"}
                                                className="text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full sm:mb-1 disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-full rounded-full" disabled={isUploading || status === "已下架"}>
                        <Save className="w-5 h-5 mr-2" />
                        {isUploading ? "圖片處理中..." : (status === "已下架" ? "下架中無法編輯" : "儲存變更")}
                    </Button>
                </form>

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