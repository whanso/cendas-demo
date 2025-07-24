import { useAuth } from "@/auth";
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
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="grid grid-cols-3 p-4 gap-8 border-b">
        <CendasLogo />
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
                  style={{ backgroundColor: user.userColor }}
                  className="text-white"
                >
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
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
