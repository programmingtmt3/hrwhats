import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { localePath, type Locale } from "@/lib/i18n";
import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type DesktopNavProps = {
  locale: Locale;
  items: NavItem[];
  label: string;
};

export function DesktopNav({ locale, items, label }: DesktopNavProps) {
  return (
    <NavigationMenu viewport={false} aria-label={label} className="hidden lg:flex">
      <NavigationMenuList className="gap-1">
        {items.map((item) =>
          "children" in item ? (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuTrigger className="text-base">{item.label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul
                  className={cn(
                    "grid gap-1 p-1",
                    item.children.length > 5 ? "w-[30rem] grid-cols-2" : "w-64",
                  )}
                >
                  {item.children.map((child) => (
                    <li key={child.path}>
                      <NavigationMenuLink asChild>
                        <Link href={localePath(locale, child.path)} className="text-sm">
                          {child.label}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.path}>
              <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "text-base")}>
                <Link href={localePath(locale, item.path)}>{item.label}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
