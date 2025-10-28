import { type Item } from "@/components/ItemList";
import StatisticsCards from "@/components/StatisticsCards";
import MonthlyPurchaseChart from "@/components/MonthlyPurchaseChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp } from "lucide-react";
import ItemCard from "@/components/ItemCard";

interface HomeTabProps {
  items: Item[];
  onItemClick: (item: Item) => void;
}

const HomeTab = ({ items, onItemClick }: HomeTabProps) => {
  // 直近追加されたアイテム（最新5件）
  const recentItems = [...items]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-20">
      {/* 月別購入グラフ */}
      <MonthlyPurchaseChart items={items} />

      {/* 全体統計 */}
      <StatisticsCards items={items} />

      {/* お知らせ */}
      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">お知らせ</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            今月は{items.filter(item => {
              const itemDate = new Date(item.purchaseDate);
              const now = new Date();
              return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
            }).length}件のアイテムを登録しました
          </p>
        </CardContent>
      </Card>

      {/* 直近追加したアイテム */}
      {recentItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">直近追加したアイテム</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentItems.map((item) => (
              <ItemCard
                key={item.id}
                {...item}
                onClick={() => onItemClick(item)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeTab;
