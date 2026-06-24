import {useState, useEffect} from "react"
 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"


export function Expenses() {
  const supabase = createClient()
  const [transactionData, setTransactionData] = useState([])

  useEffect(()=> {
      fetchTransactions()
  }, [])

  async function fetchTransactions() {
      const { data, error } = await supabase
      .from("transactions")
      .select("*")
      console.log(data)
      if (error) {
      console.error(error)
      return
      }
      setTransactionData(data)
  }



  return (
    <div className="p-4 pb-24 overflow-y-auto">
       <h1 className="text-2xl font-bold mb-4">Transactions</h1>
       <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactionData.map((transaction) => {
            return (
  
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.transaction_datetime}</TableCell>
                <TableCell>{transaction.category_id} {transaction.notes}</TableCell>
                <TableCell className="font-right">{transaction.amount_cents/100}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

    </div>



  )


}

export default Expenses