import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onSearchClick: () => void;
}

const Header = ({ onSearchClick }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-lg supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchClick}
          className="mr-auto"
        >
          <Search className="h-5 w-5" />
        </Button>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-card">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">家具家電管理</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
