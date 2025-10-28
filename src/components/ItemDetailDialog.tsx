import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, FileText, Trash2, Download } from "lucide-react";
import type { Item } from "@/lib/api/items";

interface ItemDetailDialogProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
}

const ItemDetailDialog = ({ item, open, onOpenChange, onDelete }: ItemDetailDialogProps) => {
  if (!item) return null;

  const categoryLabel = item.category_id === "furniture" ? "家具" : "家電";
  const categoryColor = item.category_id === "furniture" ? "bg-secondary text-secondary-foreground" : "bg-accent/20 text-accent-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 pr-8">
            <DialogTitle className="text-2xl text-foreground">{item.name}</DialogTitle>
            <Badge className={`${categoryColor} w-fit`}>{categoryLabel}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {item.image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-foreground">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">購入日</p>
                <p className="font-medium">{item.purchase_date}</p>
              </div>
            </div>

            {item.price && (
              <div className="flex items-center gap-3 text-foreground">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">価格</p>
                  <p className="font-medium">¥{item.price.toLocaleString()}</p>
                </div>
              </div>
            )}

            {item.notes && (
              <div className="flex items-start gap-3 text-foreground">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">メモ</p>
                  <p className="text-sm leading-relaxed">{item.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* 書類ダウンロードセクション */}
          {(item.warranty_url || item.receipt_url || item.manual_url) && (
            <div className="space-y-3 pt-4 border-t border-border">
              <p className="text-sm font-semibold text-foreground">書類</p>
              <div className="space-y-2">
                {item.warranty_url && (
                  <a
                    href={item.warranty_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-muted rounded-md hover:bg-muted/70 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1">保証書</span>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
                {item.receipt_url && (
                  <a
                    href={item.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-muted rounded-md hover:bg-muted/70 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1">領収書</span>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
                {item.manual_url && (
                  <a
                    href={item.manual_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-muted rounded-md hover:bg-muted/70 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1">取扱説明書</span>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(item.id);
                onOpenChange(false);
              }}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border"
            >
              閉じる
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailDialog;
