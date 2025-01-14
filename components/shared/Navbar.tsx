import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import Link from "next/link";
import routes from "@/lib/routes";

const Navbar = () => {
  return (
    <header className="w-full flex justify-center pt-10">
      <div className="container grid grid-cols-3 items-center">
        <div className="">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <section className="flex justify-center">
          <div className="max-w-[400px]">
            <div>
              <Link
                href={routes.home}
                className="font-title text-4xl font-bold text-center tracking-wide"
              >
                CHIENCHUANW
              </Link>
              <div className="flex justify-between text-xs mx-auto px-1">
                <span>programmer / lighting designer</span>
                <span>from Taipei</span>
              </div>
            </div>
          </div>
        </section>
        <div className="flex justify-end">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem className="space-x-4">
                <Link href={routes.blog} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Blog
                  </NavigationMenuLink>
                </Link>
                <Button asChild className="rounded-full">
                  <Link href={routes.contact}>Contact</Link>
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
