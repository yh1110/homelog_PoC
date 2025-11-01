import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Upload, X, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useCreateItem } from "@/hooks/useItems";
import { uploadItemImage, uploadItemDocument } from "@/lib/api/storage";
import { cn } from "@/lib/utils";
import { extractProductInfo, formatProductInfoForNotes } from "@/lib/extractProductInfo";
import supabase from "@/lib/supabase";

const formSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  category: z.enum(["furniture", "appliance"]),
  purchaseDate: z.date(),
  price: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddItemDialog = ({ open, onOpenChange }: AddItemDialogProps) => {
  const createItemMutation = useCreateItem();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>();
  const [warrantyFile, setWarrantyFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "furniture",
      purchaseDate: new Date(),
      price: "",
      notes: "",
    },
  });

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

  const handleAutoFill = async () => {
    if (!imageFile) return;

    setIsExtracting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("ログインが必要です");
        return;
      }

      const productInfo = await extractProductInfo(imageFile, user.id);
      const formattedNotes = formatProductInfoForNotes(productInfo);

      form.setValue('notes', formattedNotes);
      toast.success("商品情報を自動入力しました");
    } catch (error) {
      console.error("Auto-fill error:", error);
      toast.error("商品情報の取得に失敗しました");
    } finally {
      setIsExtracting(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setImageFile(null);
    setImagePreview(undefined);
    setWarrantyFile(null);
    setReceiptFile(null);
    setManualFile(null);
  };

  const onSubmit = async (values: FormValues) => {
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
          warrantyUrl = await uploadItemDocument(warrantyFile, "warranty");
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
          receiptUrl = await uploadItemDocument(receiptFile, "receipt");
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
          manualUrl = await uploadItemDocument(manualFile, "manual");
        } catch (error) {
          console.error("Manual upload error:", error);
          toast.error("取扱説明書のアップロードに失敗しました");
          setUploading(false);
          return;
        }
      }

      // アイテムを作成
      await createItemMutation.mutateAsync({
        name: values.name.trim(),
        category_id: values.category,
        image_url: imageUrl,
        warranty_url: warrantyUrl,
        receipt_url: receiptUrl,
        manual_url: manualUrl,
        purchase_date: format(values.purchaseDate, "yyyy-MM-dd"),
        price: values.price ? parseFloat(values.price) : undefined,
        notes: values.notes?.trim() || undefined,
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
      <DialogContent className="max-h-[80vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            新しいアイテムを追加
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel className="text-foreground">写真</FormLabel>
              <div className="flex flex-col gap-3">
                {imagePreview ? (
                  <>
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
                        onClick={() => {
                          setImagePreview(undefined);
                          setImageFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAutoFill}
                      disabled={isExtracting}
                      className="w-full border-border"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          商品情報を取得中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          自動入力
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      写真をアップロード
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名前 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例：ダイニングテーブル"
                      className="bg-background border-border"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリー *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="furniture">家具</SelectItem>
                      <SelectItem value="appliance">家電</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>購入日</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-background border-border",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ja })
                            ) : (
                              <span>日付を選択</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>価格（円）</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="例：50000"
                        className="bg-background border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモ</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="保証期間、購入場所など..."
                      className="bg-background border-border resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 書類アップロード */}
            <div className="space-y-3">
              <FormLabel className="text-foreground">書類（任意）</FormLabel>

              {/* 保証書 */}
              <div className="space-y-2">
                <FormLabel className="text-sm text-muted-foreground">
                  保証書
                </FormLabel>
                {warrantyFile ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1 truncate">
                      {warrantyFile.name}
                    </span>
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
                    <span className="text-sm text-muted-foreground">
                      クリックしてアップロード
                    </span>
                    <input
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
                <FormLabel className="text-sm text-muted-foreground">
                  領収書
                </FormLabel>
                {receiptFile ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1 truncate">
                      {receiptFile.name}
                    </span>
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
                    <span className="text-sm text-muted-foreground">
                      クリックしてアップロード
                    </span>
                    <input
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
                <FormLabel className="text-sm text-muted-foreground">
                  取扱説明書
                </FormLabel>
                {manualFile ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1 truncate">
                      {manualFile.name}
                    </span>
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
                    <span className="text-sm text-muted-foreground">
                      クリックしてアップロード
                    </span>
                    <input
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
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
