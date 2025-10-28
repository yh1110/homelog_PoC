import { useState } from "react";
import Header from "@/components/Header";
import { type Item } from "@/components/ItemList";
import AddItemDialog from "@/components/AddItemDialog";
import ItemDetailDialog from "@/components/ItemDetailDialog";
import SearchDialog from "@/components/SearchDialog";
import HomeTab from "@/components/HomeTab";
import CategoryTab from "@/components/CategoryTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Home, Sofa, Zap } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      name: "ダイニングテーブル",
      category: "furniture",
      purchaseDate: "2024-01-15",
      price: 45000,
      notes: "IKEAで購入、5年保証付き"
    },
    {
      id: "2",
      name: "冷蔵庫",
      category: "appliance",
      purchaseDate: "2023-11-20",
      price: 120000,
      notes: "省エネモデル、メーカー保証3年"
    },
    {
      id: "3",
      name: "ソファ",
      category: "furniture",
      purchaseDate: "2024-03-10",
      price: 78000,
    }
  ]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddItem = (newItem: Omit<Item, "id">) => {
    const item: Item = {
      ...newItem,
      id: Date.now().toString(),
    };
    setItems([item, ...items]);
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("アイテムを削除しました");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchClick={() => setIsSearchDialogOpen(true)} />
      
      <main className="container px-4 py-8 pb-24">
        <Tabs defaultValue="home" className="w-full">
          <TabsContent value="home" className="mt-0">
            <HomeTab items={items} onItemClick={handleItemClick} />
          </TabsContent>
          
          <TabsContent value="furniture" className="mt-0">
            <CategoryTab 
              items={items} 
              category="furniture" 
              onItemClick={handleItemClick} 
            />
          </TabsContent>
          
          <TabsContent value="appliance" className="mt-0">
            <CategoryTab 
              items={items} 
              category="appliance" 
              onItemClick={handleItemClick} 
            />
          </TabsContent>

          {/* 下部タブナビゲーション */}
          <TabsList className="fixed bottom-0 left-0 right-0 h-16 w-full rounded-none border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 grid grid-cols-3">
            <TabsTrigger 
              value="home" 
              className="flex flex-col items-center gap-1 data-[state=active]:text-primary"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">ホーム</span>
            </TabsTrigger>
            <TabsTrigger 
              value="furniture" 
              className="flex flex-col items-center gap-1 data-[state=active]:text-primary"
            >
              <Sofa className="h-5 w-5" />
              <span className="text-xs">家具</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appliance" 
              className="flex flex-col items-center gap-1 data-[state=active]:text-primary"
            >
              <Zap className="h-5 w-5" />
              <span className="text-xs">家電</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </main>

      {/* モバイル用FABボタン */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="sm:hidden fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground z-40"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* デスクトップ用追加ボタン */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="hidden sm:flex fixed bottom-8 right-8 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Plus className="h-5 w-5 mr-2" />
        追加
      </Button>

      <SearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddItem}
      />

      <ItemDetailDialog
        item={selectedItem}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};

export default Index;
