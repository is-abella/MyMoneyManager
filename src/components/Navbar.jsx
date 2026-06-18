import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import { House, BanknoteArrowDown, PiggyBank } from 'lucide-react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <NavigationMenu>
        <NavigationMenuList>

            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link to="/">
                        <House /> Home
                    </Link>
                </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link to="/expenses">
                       <BanknoteArrowDown /> Expenses
                    </Link>

                </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link to="/budgets">
                        <PiggyBank /> Budgets
                    </Link>
                </NavigationMenuLink>
            </NavigationMenuItem>

        </NavigationMenuList>
        </NavigationMenu>
    )
}

export default Navbar


