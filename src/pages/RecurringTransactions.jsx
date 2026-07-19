import { use, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import RecurringTransactionCard from "@/components/RecurringTransactionCard"
import RecurringTransactionForm from "@/components/RecurringTransactionForm"

export default function RecurringTransactions() {
    const supabase = createClient()
    const [recurringTransactions, setRecurringTransactions] = useState([])

    useEffect(() => {
        async function loadRecurringTransactions() {
            const { data, error } = await supabase.from("recurring_transactions").select("*").eq("is_active", true)
            if (error) {
                console.log(error)
                return
            }
            setRecurringTransactions(data)
        }
        loadRecurringTransactions()
    }, [])


    return (
        <div className="p-4 pb-24 overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4">Recurring Transactions</h1>
            <div className="grid grid-cols-1 gap-4">
                {recurringTransactions.map((recurring_transaction) => (
                    <RecurringTransactionCard key={recurring_transaction.id} {...recurring_transaction} />
                ))}
            </div>
        </div>
    )
}