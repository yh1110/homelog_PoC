import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useCreateItem } from "@/hooks/useItems";
import { uploadItemImage, uploadItemDocument } from "@/lib/api/storage";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddItemDialog = ({ open, onOpenChange }: AddItemDialogProps) => {
  const createItemMutation = useCreateItem();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<"furniture" | "appliance">(
    "furniture"
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>();
  const [warrantyFile, setWarrantyFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルサイズチェック（5MB）
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ファイルサイズは5MB以下である必要があります");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("furniture");
    setImageFile(null);
    setImagePreview(undefined);
    setWarrantyFile(null);
    setReceiptFile(null);
    setManualFile(null);
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setPrice("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("名前を入力してください");
      return;
    }

    setUploading(true);

    try {
      let imageUrl: string | undefined;
      let warrantyUrl: string | undefined;
      let receiptUrl: string | undefined;
      let manualUrl: string | undefined;

      // 画像がある場合はアップロード
      if (imageFile) {
        try {
          imageUrl = await uploadItemImage(imageFile);
        } catch (error) {
          console.error("Image upload error:", error);
          toast.error("画像のアップロードに失敗しました");
          setUploading(false);
          return;
        }
      }

      // 保証書がある場合はアップロード
      if (warrantyFile) {
        try {
          warrantyUrl = await uploadItemDocument(warrantyFile, 'warranty');
        } catch (error) {
          console.error("Warranty upload error:", error);
          toast.error("保証書のアップロードに失敗しました");
          setUploading(false);
          return;
        }
      }

      // 領収書がある場合はアップロード
      if (receiptFile) {
        try {
          receiptUrl = await uploadItemDocument(receiptFile, 'receipt');
        } catch (error) {
          console.error("Receipt upload error:", error);
          toast.error("領収書のアップロードに失敗しました");
          setUploading(false);
          return;
        }
      }

      // 取扱説明書がある場合はアップロード
      if (manualFile) {
        try {
          manualUrl = await uploadItemDocument(manualFile, 'manual');
        } catch (error) {
          console.error("Manual upload error:", error);
          toast.error("取扱説明書のアップロードに失敗しました");
          setUploading(false);
          return;
        }
      }

      // アイテムを作成
      await createItemMutation.mutateAsync({
        name: name.trim(),
        category_id: category,
        image_url: imageUrl,
        warranty_url: warrantyUrl,
        receipt_url: receiptUrl,
        manual_url: manualUrl,
        purchase_date: purchaseDate,
        price: price ? parseFloat(price) : undefined,
        notes: notes.trim() || undefined,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Create item error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            新しいアイテムを追加
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image" className="text-foreground">
              写真
            </Label>
            <div className="flex flex-col gap-3">
              {imagePreview ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setImagePreview(undefined)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    写真をアップロード
                  </span>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              名前 *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：ダイニングテーブル"
              required
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground">
              カテゴリー *
            </Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as "furniture" | "appliance")}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="furniture">家具</SelectItem>
                <SelectItem value="appliance">家電</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground">
                購入日
              </Label>
              <Input
                id="date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground">
                価格（円）
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="例：50000"
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              メモ
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="保証期間、購入場所など..."
              className="bg-background border-border resize-none"
              rows={3}
            />
          </div>

          {/* 書類アップロード */}
          <div className="space-y-3">
            <Label className="text-foreground">書類（任意）</Label>

            {/* 保証書 */}
            <div className="space-y-2">
              <Label htmlFor="warranty" className="text-sm text-muted-foreground">
                保証書
              </Label>
              {warrantyFile ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{warrantyFile.name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setWarrantyFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 cursor-pointer border-2 border-dashed border-border bg-muted/50 hover:bg-muted rounded-md transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">クリックしてアップロード</span>
                  <input
                    id="warranty"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setWarrantyFile(file);
                    }}
                  />
                </label>
              )}
            </div>

            {/* 領収書 */}
            <div className="space-y-2">
              <Label htmlFor="receipt" className="text-sm text-muted-foreground">
                領収書
              </Label>
              {receiptFile ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{receiptFile.name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setReceiptFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 cursor-pointer border-2 border-dashed border-border bg-muted/50 hover:bg-muted rounded-md transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">クリックしてアップロード</span>
                  <input
                    id="receipt"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setReceiptFile(file);
                    }}
                  />
                </label>
              )}
            </div>

            {/* 取扱説明書 */}
            <div className="space-y-2">
              <Label htmlFor="manual" className="text-sm text-muted-foreground">
                取扱説明書
              </Label>
              {manualFile ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{manualFile.name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setManualFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 cursor-pointer border-2 border-dashed border-border bg-muted/50 hover:bg-muted rounded-md transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">クリックしてアップロード</span>
                  <input
                    id="manual"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setManualFile(file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border"
              disabled={uploading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="flex-1 from-primary to-accent hover:opacity-90 text-primary-foreground"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  追加中...
                </>
              ) : (
                "追加"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
