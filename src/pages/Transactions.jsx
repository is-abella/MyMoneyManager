import {useState, useEffect, useMemo} from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableFooter,
  TableRow,
} from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { categoryDict } from "@/dummydata/data"
import { MoveUp, MoveDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"


export default function Transactions() {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]
  const supabase = createClient()
  const [transactionData, setTransactionData] = useState([])
  const [categories, setCategories] = useState([])
  const [sortField, setSortField] = useState("date")
  const [sortAscending, setSortAscending] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [monthSelected, setMonthSelected] = useState(monthNames[new Date().getMonth()])
  const [yearSelected, setYearSelected] = useState(new Date().getFullYear())
  const [months, setMonths] = useState([])
  const [years, setYears] = useState([])



  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const {data, error} = await supabase.from("categories").select("*")
    console.log(data)
    if (error) {
      console.log(error)
      return
    }
    setCategories(data)
    setSelectedCategories(data.map(c => c.id))
  }

  useEffect(()=> {
      fetchTransactions() 
  }, [])

  async function fetchTransactions() {
      const { data, error } = await supabase.from("transactions").select("*")
      console.log(data)
      if (error) { 
        console.error(error) 
        return
      }
      setTransactionData(data)
      const years = [...new Set(
        data.map(t => new Date(t.transaction_datetime).getFullYear())
      )].sort((a, b) => a - b)
      setYears(years)
      const months = [...new Set(
        data.map(t => new Date(t.transaction_datetime).getMonth())
      )].sort((a, b) => a - b)
      setMonths(months)

  }

  function toggleCategory(id) {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c!==id) : [...prev, id]
    )
  }

  function deselectAll() {
    setSelectedCategories([])
  }

  function selectAll() {
    setSelectedCategories(categories.map(c=>c.id))
  }

  function formatDate(isoDate) {
    const date = new Date(isoDate)
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
  }

  const filteredTransactions = useMemo(() => {
    if (!transactionData.length) return []
    const data = transactionData.map((t) => {
      const date = new Date(t.transaction_datetime)
      return {
        ...t,
        signedAmount: t.type === "expense" ? -t.amount_cents : t.amount_cents,
        month: date.getMonth(),
        year: date.getFullYear(),
        timestamp: date.getTime(),
      }
    }).filter((t)=> {
      return (
        selectedCategories.includes(t.category_id) &&
        monthNames[t.month] === monthSelected &&
        t.year === yearSelected
      )
    })
    
    if (sortField == "date") {
      return data.sort((a, b) => sortAscending
        ? a.timestamp - b.timestamp
        : b.timestamp - a.timestamp
      )
    }
    if (sortField == "amount") {
      return data.sort((a,b)=> sortAscending 
        ? a.signedAmount - b.signedAmount
        : b.signedAmount - a.signedAmount
      )
    }
  }, [sortField, sortAscending, transactionData, categories, selectedCategories, monthSelected, yearSelected])

  const summary = useMemo(() => {
  let income = 0
  let expense = 0
  let net = 0

  for (const t of filteredTransactions) {
    const value = t.amount_cents / 100

    if (t.type === "income") income += value
    else expense += value

    net += t.signedAmount / 100
  }

  return { income, expense, net }
}, [filteredTransactions])

  
  return (
    <div className="p-4 pb-24 overflow-y-auto">
      <div className="flex">
        <h1 className="text-2xl font-bold mb-4 mr-4">Transactions</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">
                {monthSelected} {yearSelected}
              </Button>
            </PopoverTrigger >
            <PopoverContent>
              <div className="flex">
              <ScrollArea className="h-50 w-40">
                <div className="p-4">
                  <h4 className="mb-4 text-sm leading-none font-medium">Month</h4>
                  {months.map((month) => (
                    <div>
                      <Button variant="secondary" onClick={()=>setMonthSelected(monthNames[month])}
                        className={`w-full px-3 py-2 text-left
                        ${monthSelected === monthNames[month]
                          ? "bg-gray-400 text-primary-foreground"
                          : "hover:bg-muted"}`}>
                        {monthNames[month]}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <ScrollArea className="h-50 w-40"> {/*can add border*/}
                <div className="p-4">
                  <h4 className="mb-4 text-sm leading-none font-medium">Year</h4>
                  {years.map((year) => (
                    <div>
                      <Button variant="secondary" onClick={()=>setYearSelected(year)}
                        className={`w-full px-3 py-2 text-left
                        ${yearSelected === year
                          ? "bg-gray-400 text-primary-foreground"
                          : "hover:bg-muted"}`}>
                        {year}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            </PopoverContent>
          </Popover>
      </div>
      
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">
                {(sortField=="date") ?

                  <Button variant = "secondary" className="flex" onClick={()=> setSortAscending(!sortAscending)}>
                  { sortAscending ? (
                    <div className="flex"><MoveUp/>Date</div>
                  ) : <div className="flex"><MoveDown/>Date</div> } 
                  </Button> :
                  
                  <Button variant = "ghost" className="flex" onClick={()=> setSortField("date")}>
                    Date
                  </Button> 
                }
              </TableHead>
              <TableHead className="w-[180px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary">
                      Category & Item
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Command>
                      <CommandList>
                        {categories.map((c) => {
                          return (
                          <CommandItem>
                            <Checkbox onCheckedChange={()=>toggleCategory(c.id)}  checked={selectedCategories.includes(c.id)} /> {/* checked={} and onCheckedChange={}*/}
                            <img src = {categoryDict[c.id]} /> {c.category_name}
                          </CommandItem>)
                          })
                        } 
                      </CommandList>
                      <div className="items-end">
                        <Button onClick = {deselectAll}>
                          Deselect All
                        </Button>
                        <Button onClick = {selectAll}>
                          Select All
                        </Button>
                      </div>
                    </Command>
                  </PopoverContent>
                </Popover>
              </TableHead>
              <TableHead className="text-left">
                {(sortField=="amount") ?

                  <Button variant = "secondary" className="flex" onClick={()=> setSortAscending(!sortAscending)}>
                  { sortAscending ? (
                    <div className="flex"><MoveUp/>Amount</div>
                  ) : <div className="flex"><MoveDown/>Amount</div> } 
                  </Button> :
                  
                  <Button variant = "ghost" className="flex" onClick={()=> setSortField("amount")}>
                    Amount
                  </Button> 
                }

              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => {
              return (
    
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{formatDate(transaction.transaction_datetime)}</TableCell>
                  <TableCell className = "flex items-center gap-1.5"><img className="w-4.5" src = {categoryDict[transaction.category_id]}/> {transaction.notes}</TableCell>
                  <TableCell className="font-right">
                    {transaction.type === "expense" ? (
                      <span className="text-[var(--budget-high)]">
                        -${(transaction.amount_cents / 100).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[var(--budget-low)]">
                        +${(transaction.amount_cents / 100).toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter className="w-full">
            <TableRow>
              <TableCell colSpan={2}>Total Expenses</TableCell>
              <TableCell>
                <span className="text-[var(--budget-high)]">
                  -${summary.expense.toFixed(2)}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>Total Income</TableCell>
              <TableCell>
                <span className="text-[var(--budget-low)]">
                +${summary.income.toFixed(2)}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>Net</TableCell>
              <TableCell>
                {summary.net > 0 ? 
                  <span className="text-[var(--budget-low)]">
                    +${summary.net.toFixed(2)}
                  </span> :
                  <span className="text-[var(--budget-high)]">
                    -${summary.net.toFixed(2)}
                  </span>}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}