import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import Link from "next/link";
import { EllipsisVertical, Cat } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

      {/*
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle">
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start">
            <SheetTitle>Menu</SheetTitle>
            <ModeToggle />
            <Button asChild variant="ghost">
              <Link target="_blank" href="https://www.wishket.com/">
                <Cat /> 위시켓으로
              </Link>
            </Button>

            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
*/}
    </div>
  );
};

export default Menu;
