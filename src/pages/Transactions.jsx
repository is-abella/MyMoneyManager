import {useState, useEffect, useMemo} from "react"
import { useSearchParams } from 'react-router-dom'
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
import {Badge} from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { categoryDict } from "@/dummydata/data"
import { MoveUp, MoveDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { motion, useMotionValue, animate } from "framer-motion"
import { useNavigate } from "react-router-dom"


export default function Transactions() {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]
  const supabase = createClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [dateRangeFilter, setDateRangeFilter] = useState(null)
  const [transactionData, setTransactionData] = useState([])
  const [categories, setCategories] = useState([])
  const [sortField, setSortField] = useState("date")
  const [sortAscending, setSortAscending] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [months, setMonths] = useState([])
  const [years, setYears] = useState([])
  const x = useMotionValue(0)
  const SWIPE_THRESHOLD = 15

  //if is_recurring==false and recurring_id==true, means used to be recurring, now deactivated

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
    if (!searchParams.get('category')) setSelectedCategories(data.map(c => c.id))
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

  useEffect(() => {
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const category = parseInt(searchParams.get('category'))

    if (start && end) {
      setDateRangeFilter({ start: new Date(start), end: new Date(end) })
    }
    if (category) {
      setSelectedCategories([category])
    }
  }, [searchParams])


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
      const categoryMatch = selectedCategories.includes(t.category_id)
      if (dateRangeFilter) {
        const date = new Date(t.transaction_datetime)
        return (
          categoryMatch &&
          date >= dateRangeFilter.start &&
          date <= dateRangeFilter.end
        )
      }
      return (
        categoryMatch &&
        t.month === currentDate.getMonth() &&
        t.year === currentDate.getFullYear()
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
  }, [sortField, sortAscending, transactionData, categories, selectedCategories, currentDate, dateRangeFilter])

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

  function goPrevMonth() {
    setCurrentDate(prev => {return new Date(prev.getFullYear(), prev.getMonth()-1, 1)})
  }
  function goNextMonth() {
    setCurrentDate(prev => {return new Date(prev.getFullYear(), prev.getMonth()+1, 1)})
  }

  return (
    <div className="p-4 pb-24 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 mr-4">Transactions</h1>
        <div className="flex justify-end mb-4">
          <Popover >
            <PopoverTrigger asChild>
              {dateRangeFilter ?
              <Button variant="secondary" className="mr-4">
                {formatDate(dateRangeFilter.start)} to {formatDate(dateRangeFilter.end)}
              </Button> :
              <Button variant="secondary" className="mr-4">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Button>
              }
            </PopoverTrigger >
            <PopoverContent>
              <div className="flex">
              <ScrollArea className="h-50 w-40">
                <div className="p-4">
                  <h4 className="mb-4 text-sm leading-none font-medium">Month</h4>
                  {months.map((month) => (
                    <div key={month}>
                      <Button variant="secondary" onClick={()=>{
                        setDateRangeFilter(null)
                        setCurrentDate(prev => {return new Date(prev.getFullYear(), month, 1)})}}
                        className={`w-full px-3 py-2 text-left
                        ${currentDate.getMonth() === month
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
                    <div key={year}>
                      <Button variant="secondary" onClick={()=> {
                        setDateRangeFilter(null)
                        setCurrentDate(prev => {return new Date(year, prev.getMonth(), 1)})}}
                        className={`w-full px-3 py-2 text-left
                        ${currentDate.getFullYear() === year
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
          <Button variant="default" onClick={() => window.location.href = "/new-transaction"}>
            New Transaction
          </Button>
      </div>
      
      <div className="overflow-hidden">
      <motion.div
        className="touch-pan-y select-none"
        style={{ x }}
        drag="x"
        dragElastic={0.15}
        dragMomentum={false}
        onDragEnd={(e, info) => {
          console.log("INFO:", info)
          console.log("OFFSET:", info.offset)
          console.log("VELOCITY:", info.velocity)
          if (info.offset.x > SWIPE_THRESHOLD) {
            animate(x, window.innerWidth, {
              duration: 0.18,
              onComplete: () => {
                goPrevMonth()
                x.set(-window.innerWidth)
                animate(x, 0, {
                  duration: 0.18
                })
              }
            })

          } else if (info.offset.x < -SWIPE_THRESHOLD && currentDate.getMonth() < new Date().getMonth()) {
            animate(x, -window.innerWidth, {
              duration: 0.18,
              onComplete: () => {
                goNextMonth()
                x.set(window.innerWidth)
                animate(x, 0, {
                  duration: 0.18
                })
              }
            })
          } else {
            animate(x, 0, {
              duration: 0.2
            })
          }
        }}
      >
        <div className="w-full">
          <Table>
            <TableHeader >
              <TableRow>
                <TableHead className="w-[90px]">
                  {(sortField=="date") ?

                    <Button variant = "ghost" className="flex" onClick={()=> setSortAscending(!sortAscending)}>
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
                      <Button variant="ghost" className="w-full justify-start">
                        Category & Item
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Command>
                        <CommandList>
                          {categories.map((c) => {
                            return (
                            <CommandItem key={c.id}>
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

                    <Button variant = "ghost" className="flex" onClick={()=> setSortAscending(!sortAscending)}>
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
              <TableRow>
                <TableCell colSpan={3} className="p-0">
                  <Button variant = "secondary" className="w-full justify-start" onClick={() => navigate("/recurring-transactions")}>
                    Recurring Transactions
                  </Button>
                </TableCell>
              </TableRow>
              {filteredTransactions.map((transaction) => {
                return (
                  <TableRow key={transaction.id}
                  onClick = {() => navigate(`/edit-transaction/${transaction.id}`)}>
                    <TableCell className="font-medium">{formatDate(transaction.transaction_datetime)}</TableCell>
                    <TableCell className = "flex items-center gap-1.5"><img className="w-4.5" src = {categoryDict[transaction.category_id]}/> {transaction.notes}
                      {transaction.is_recurring && transaction.recurring_id && (
                        <Badge variant="secondary" className="text-xs">Recurring</Badge>
                      )}
                      {/*!transaction.is_recurring && transaction.recurring_id && (
                        <Badge variant="destructive" className="text-xs">Recurred</Badge>
                      )*/}
                    </TableCell>
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
                      -${summary.net.toFixed(2)/-1}
                    </span>}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </motion.div>
      </div>
    </div>
  )
}