import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import Link from "next/link";
import { Cat } from "lucide-react";

const Menu = () => {
  return (
    <div className="flex justify-end gap-3">
      <nav className="md:flex w-full max-w-xs gap-1">
        <ModeToggle />
        <Button asChild variant="ghost">
          <Link target="_blank" href="https://www.wishket.com/">
            <Cat /> <span className="hidden sm:inline">위시켓으로</span>
          </Link>
        </Button>
      </nav>
    </div>
  );
};

export default Menu;
