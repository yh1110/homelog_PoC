import { Calendar, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ItemCardProps {
  id: string;
  name: string;
  category_id: "furniture" | "appliance";
  image_url?: string;
  purchase_date: string;
  price?: number;
  onClick: () => void;
}

const ItemCard = ({
  name,
  image_url,
  purchase_date,
  price,
  onClick,
}: ItemCardProps) => {
  return (
    <Card
      className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-card hover:-translate-y-1 bg-card border-border"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Tag className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-2">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{purchase_date}</span>
          </div>
          {price !== undefined && (
            <p className="font-semibold text-foreground">
              ¥{price.toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemCard;
