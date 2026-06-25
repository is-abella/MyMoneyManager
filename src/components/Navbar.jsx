import { Home, BanknoteArrowDown, PiggyBank } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

function Navbar() {
  const location = useLocation()

  const item = (path) =>
    `flex flex-col items-center text-sm ${
      location.pathname === path ? "text-black" : "text-gray-500"
    }`

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t bg-white flex justify-around py-4 pb-6 z-10">

      <Link to="/" className={item("/")}>
        <Home size={23} />
        Home
      </Link>

      <Link to="/transactions" className={item("/transactions")}>
        <BanknoteArrowDown size={23} />
        Expenses
      </Link>

      <Link to="/budgets" className={item("/budgets")}>
        <PiggyBank size={23} />
        Budgets
      </Link>

    </nav>
  )
}


{/*function Navbar() {
    return (
        <NavigationMenu className="flex justify-center max-w-none w-full border-t">
        <NavigationMenuList className="flex items-center justify-center w-full">

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
}*/}

export default Navbar


