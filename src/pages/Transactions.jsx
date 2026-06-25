import {useState, useEffect, useMemo} from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { categoryDict } from "@/dummydata/data"
import { MoveUp, MoveDown } from "lucide-react"


export default function Transactions() {
  const supabase = createClient()
  const [transactionData, setTransactionData] = useState([])
  const [categories, setCategories] = useState([])
  const [sortField, setSortField] = useState("date")
  const [sortAscending, setSortAscending] = useState(false)


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

  const filteredTransactions = useMemo(() => {
    if (!transactionData.length) return []
    const data = [...transactionData]
    if (sortField == "date") {
      if (sortAscending) {
        return data.sort((a, b) => new Date(a.transaction_datetime) - new Date(b.transaction_datetime))
      } else {
        return data.sort((a, b) => new Date(b.transaction_datetime) - new Date(a.transaction_datetime))
      }
    }
    if (sortField == "amount") {
      if (sortAscending) {
        return data.sort((a, b) => a.amount_cents - b.amount_cents)
      } else {
        return data.sort((a, b) => b.amount_cents - a.amount_cents)
      }
    }
  }, [sortField, sortAscending, transactionData])



  function formatDate(isoDate) {
    const date = new Date(isoDate)
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
  }

  

  
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
            <TableHead>Item</TableHead>
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
      </Table>

    </div>

  )


}