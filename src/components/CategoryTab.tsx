import { type Item } from "@/components/ItemList";
import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign, Calendar } from "lucide-react";
import ItemCard from "@/components/ItemCard";

interface CategoryTabProps {
  items: Item[];
  category: "furniture" | "appliance";
  onItemClick: (item: Item) => void;
}

const CategoryTab = ({ items, category, onItemClick }: CategoryTabProps) => {
  const categoryItems = items.filter(item => item.category === category);
  const categoryLabel = category === "furniture" ? "家具" : "家電";
  
  const totalCost = categoryItems.reduce((sum, item) => sum + (item.price || 0), 0);
  
  // 直近購入（最新3件）
  const recentPurchases = [...categoryItems]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-20">
      {/* カテゴリー統計サマリー */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">登録総数</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {categoryItems.length}
            <span className="text-sm font-normal text-muted-foreground ml-1">個</span>
          </p>
        </Card>
        
        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-accent" />
            <p className="text-xs text-muted-foreground">総費用</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            ¥{totalCost.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* 直近の購入 */}
      {recentPurchases.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">直近の購入</h3>
          </div>
          <div className="space-y-2">
            {recentPurchases.map((item) => (
              <Card 
                key={item.id}
                className="p-3 bg-card/60 backdrop-blur-sm border-border cursor-pointer hover:shadow-card transition-shadow"
                onClick={() => onItemClick(item)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.purchaseDate}</p>
                  </div>
                  {item.price && (
                    <p className="font-semibold text-foreground">¥{item.price.toLocaleString()}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 全アイテム一覧 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">すべての{categoryLabel}</h3>
        {categoryItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{categoryLabel}が登録されていません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryItems.map((item) => (
              <ItemCard
                key={item.id}
                {...item}
                onClick={() => onItemClick(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTab;
