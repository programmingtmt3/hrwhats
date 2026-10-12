"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Dictionary, Locale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";
import type { NavItem } from "@/lib/navigation";
import { APP_URLS } from "@/lib/site";

type MobileMenuProps = {
  locale: Locale;
  items: NavItem[];
  dict: Pick<Dictionary["nav"], "openMenu" | "closeMenu" | "menuTitle" | "login" | "signup">;
};

const linkClass = "block rounded-lg px-2 py-2.5 text-base font-medium hover:bg-muted";

export function MobileMenu({ locale, items, dict }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label={dict.openMenu}>
          <MenuIcon className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="end" closeLabel={dict.closeMenu} className="w-full max-w-xs gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{dict.menuTitle}</SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <Accordion type="single" collapsible>
            {items.map((item) =>
              "children" in item ? (
                <AccordionItem key={item.label} value={item.label} className="border-b-0">
                  <AccordionTrigger className="px-2 py-2.5 text-base hover:bg-muted hover:no-underline">
                    {item.label}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="ms-3 border-s ps-2">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <SheetClose asChild>
                            <Link
                              href={localePath(locale, child.path)}
                              className="block rounded-lg px-2 py-2 text-sm hover:bg-muted"
                            >
                              {child.label}
                            </Link>
                          </SheetClose>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <SheetClose asChild key={item.path}>
                  <Link href={localePath(locale, item.path)} className={linkClass}>
                    {item.label}
                  </Link>
                </SheetClose>
              ),
            )}
          </Accordion>
        </nav>

        <SheetFooter className="border-t">
          <Button asChild variant="outline" size="lg" className="h-11 text-base">
            <a href={APP_URLS.login}>{dict.login}</a>
          </Button>
          <Button asChild size="lg" className="h-11 text-base">
            <a href={APP_URLS.signup}>{dict.signup}</a>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
