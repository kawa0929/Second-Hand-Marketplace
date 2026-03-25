import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

interface LoginPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string; // 🌟 新增這個屬性來接收動態文字
}

export function LoginPromptDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "請先登入",
  description = "登入後即可繼續操作。" // 🌟 預設文字
}: LoginPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-base mt-2">
            {description} {/* 🌟 這裡會顯示我們傳進來的文字 */}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onConfirm}>
            前往登入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}