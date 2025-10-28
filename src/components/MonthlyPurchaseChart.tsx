import { type Item } from "@/components/ItemList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MonthlyPurchaseChartProps {
  items: Item[];
}

const MonthlyPurchaseChart = ({ items }: MonthlyPurchaseChartProps) => {
  const isMobile = useIsMobile();

  // 画面サイズに応じた表示月数（モバイル: 3ヶ月、デスクトップ: 6ヶ月）
  const displayMonths = isMobile ? 3 : 6;

  // 今月から遡って直近Nヶ月の月キーを生成
  const now = new Date();
  const recentMonthKeys: string[] = [];

  for (let i = displayMonths - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${targetDate.getFullYear()}-${String(
      targetDate.getMonth() + 1
    ).padStart(2, "0")}`;
    recentMonthKeys.push(monthKey);
  }

  // 月ごとのデータを集計
  const monthlyData = items.reduce((acc, item) => {
    const date = new Date(item.purchaseDate);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!acc[monthKey]) {
      acc[monthKey] = 0;
    }
    acc[monthKey] += item.price || 0;

    return acc;
  }, {} as Record<string, number>);

  // 直近N ヶ月のデータを配列に変換（データがない月は0）
  const chartData = recentMonthKeys.map((monthKey) => ({
    month: monthKey,
    amount: monthlyData[monthKey] || 0,
    displayMonth: new Date(monthKey + "-01").toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
    }),
  }));

  const chartConfig = {
    amount: {
      label: "購入金額",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">月別購入金額</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 pr-6">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="displayMonth"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number) => [
                  `¥${value.toLocaleString()}`,
                  "購入金額",
                ]}
              />
              <Bar
                dataKey="amount"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyPurchaseChart;
