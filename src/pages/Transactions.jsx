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
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { categoryDict } from "@/dummydata/data"
import { MoveUp, MoveDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"


export default function Transactions() {
  const supabase = createClient()
  const [transactionData, setTransactionData] = useState([])
  const [categories, setCategories] = useState([])
  const [sortField, setSortField] = useState("date")
  const [sortAscending, setSortAscending] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])


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
      const signedAmount = t.type === "expense" ? -t.amount_cents : t.amount_cents
      return {
        ...t,
        signedAmount}
      }).filter((t)=> selectedCategories.includes(t.category_id))
    

    if (sortField == "date") {
      if (sortAscending) {
        return data.sort((a, b) => new Date(a.transaction_datetime) - new Date(b.transaction_datetime))
      } else {
        return data.sort((a, b) => new Date(b.transaction_datetime) - new Date(a.transaction_datetime))
      }
    }
    if (sortField == "amount") {
      if (sortAscending) {
        return data.sort((a, b) => a.signedAmount - b.signedAmount)
      } else {
        return data.sort((a, b) => b.signedAmount - a.signedAmount)
      }
    }
  }, [sortField, sortAscending, transactionData, categories, selectedCategories])

  
  return (
    <div className="p-4 pb-24 overflow-y-auto">
       <h1 className="text-2xl font-bold mb-4">Transactions</h1>
       <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
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
            <TableHead>
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
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total Expenses</TableCell>
            <TableCell>
              <span className="text-[var(--budget-high)]">
                -${filteredTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount_cents/100, 0).toFixed(2)}
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3}>Total Income</TableCell>
            <TableCell>
              <span className="text-[var(--budget-low)]">
               +${filteredTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount_cents/100, 0).toFixed(2)}
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3}>Net</TableCell>
            <TableCell> 
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>


    </div>

  )


}