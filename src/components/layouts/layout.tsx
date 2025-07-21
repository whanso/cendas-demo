import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, Outlet, useLocation } from "react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import CendasLogo from "../icons/CendasLogo";
import useAuth from "@/hooks/useAuth";

const links: { title: string; href: string }[] = [
  {
    title: "Tasks",
    href: "/tasks",
  },
  {
    title: "Floor Plan",
    href: "/floor-plan",
  },
];

const getInitials = (name = "") => {
  const names = name.split(" ");
  if (names.length > 1 && names[1]) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="grid grid-cols-[1fr_2fr_1fr] sm:grid-cols-3 p-4 gap-8 border-b">
        <CendasLogo className="hidden md:block" />
        <img
          src="/logo.png"
          alt="Cendas Logo"
          className="block md:hidden h-[3.25rem]"
        />
        <NavigationMenu className="max-w-full">
          <NavigationMenuList>
            {links.map((link) => (
              <NavigationMenuItem
                key={link.title}
                className={
                  location.pathname === link.href ? "bg-accent rounded-sm" : ""
                }
              >
                <NavigationMenuLink asChild>
                  <Link to={link.href}>{link.title}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer ml-auto">
                <AvatarFallback
                  style={{ backgroundColor: currentUser.userColor }}
                  className="text-white"
                >
                  {getInitials(currentUser.username)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{currentUser.username}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
