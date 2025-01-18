//import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";
import { Cat } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          <Link href="/" className="flex-start ml-4">
            {/* 
            <Image
              src="/next.svg"
              alt={`${APP_NAME} logo`}
              height={48}
              width={48}
              priority={true}
            />
            */}
            <Cat />
            <span className="font-bold text-2xl ml-3">{APP_NAME}</span>
          </Link>
        </div>

        {/*   <div className="hidden md:block"></div> 
        <Menu /> */}
        <Menu />
      </div>
    </header>
  );
};

export default Header;
