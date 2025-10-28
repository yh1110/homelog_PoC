import ItemCard from "./ItemCard";

export interface Item {
  id: string;
  name: string;
  category: "furniture" | "appliance";
  imageUrl?: string;
  purchaseDate: string;
  price?: number;
  notes?: string;
}

interface ItemListProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  searchQuery: string;
}

const ItemList = ({ items, onItemClick, searchQuery }: ItemListProps) => {
  const filteredItems = items.filter((item) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">アイテムが見つかりません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              {...item}
              onClick={() => onItemClick(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemList;
