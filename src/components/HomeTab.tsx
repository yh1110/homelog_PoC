import { type Item } from "@/lib/api/items";
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
  // 直近追加されたアイテム（1週間以内・最大3件）
  const recentItems = [...items]
    .filter(item => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.purchase_date) >= weekAgo;
    })
    .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
    .slice(0, 3);

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
              const itemDate = new Date(item.purchase_date);
              const now = new Date();
              return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
            }).length}件のアイテムを登録しました
          </p>
        </CardContent>
      </Card>

      {/* 直近追加したアイテム */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">直近追加したアイテム</h3>
        </div>
        {recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentItems.map((item) => (
              <ItemCard
                key={item.id}
                {...item}
                onClick={() => onItemClick(item)}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-card/60 backdrop-blur-sm border-border border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">
                直近1週間以内に追加されたアイテムはありません
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HomeTab;
