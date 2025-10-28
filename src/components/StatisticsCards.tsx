import { type Item } from "@/components/ItemList";
import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign } from "lucide-react";

interface StatisticsCardsProps {
  items: Item[];
}

const StatisticsCards = ({ items }: StatisticsCardsProps) => {
  const totalItems = items.length;
  const totalCost = items.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">総登録数</p>
              <p className="text-2xl font-bold text-foreground">
                {totalItems}個
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent">
              <DollarSign className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">総費用</p>
              <p className="text-2xl font-bold text-foreground">
                ¥{totalCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCards;
