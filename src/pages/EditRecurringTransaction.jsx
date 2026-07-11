import { createClient } from "@/lib/supabase/client"  
import { useNavigate, useParams} from "react-router-dom"
import { useState, useEffect } from "react"
import RecurringTransactionForm from "@/components/RecurringTransactionForm"

export default function EditRecurringTransaction() {
    const {recurringTransactionID} = useParams()
    const navigate = useNavigate()
    const supabase = createClient()
    const [recurringTransaction, setRecurringTransaction] = useState([])

    useEffect (()=> {//code inside runs after render. telling it to run again when id changes
        async function loadRecurringTransactions() {
            const {data} = await supabase.from("recurring_transactions").select("*").eq("id", recurringTransactionID).single()
    
            setRecurringTransaction(data)
        }
        loadRecurringTransactions()
    }, [recurringTransactionID]) //id is dependency array

    const handleDeleteFuture = async () => { 
        // Deactivate the recurring transaction rule
        const { error: deactivateError } = await supabase
            .from("recurring_transactions")
            .update({ is_active: false })
            .eq("id", recurringTransactionID)
        if (deactivateError) return console.log(deactivateError)
        
        // Delete all future transactions associated with this recurring transaction
        const { error: deleteError } = await supabase
            .from("transactions")
            .delete()
            .eq("recurring_id", recurringTransactionID)
            .gt("transaction_datetime", new Date().toISOString()) // Only delete future transactions
        if (deleteError) return console.log(deleteError)
        
        // Deactivate is_recurring from the rest. if is_recurring==false and recurring_id==true, means used to be recurring, now deactivated
        const {error: disableError } = await supabase
            .from("transactions")
            .update({is_recurring: false})
            .eq("recurring_id", recurringTransactionID)
        if (disableError) return console.log(disableError)
        navigate("/recurring-transactions")

    }

    const handleDeleteAll = async () => {
        // Deactivate the recurring transaction rule
        const { error: deactivateError } = await supabase
            .from("recurring_transactions")
            .update({ is_active: false })
            .eq("id", recurringTransactionID)
        if (deactivateError) return console.log(deactivateError)
        
        // Delete all transactions associated with this recurring transaction
        const { error: deleteError } = await supabase
            .from("transactions")
            .delete()
            .eq("recurring_id", recurringTransactionID)
        if (deleteError) return console.log(deleteError)
        navigate("/recurring-transactions")
    }


    const handleUpdateFuture = async (payload) => { // taking out EditScope for now
        // Disable old rule
        const newDate = new Date().toISOString()
        const { error: deactivateError } = await supabase
            .from("recurring_transactions")
            .update({ is_active: false })
            .eq("id", recurringTransactionID)
        if (deactivateError) return console.log(deactivateError)
        // Delete future reansactions from old rule
        const { error: deleteError } = await supabase
            .from("transactions")
            .delete()
            .eq("recurring_id", recurringTransactionID)
            .gt("transaction_datetime", newDate)
        if (deleteError) return console.log(deleteError)
        // Create new rule with updated values
        const { data, error: ruleError} = await supabase
            .from("recurring_transactions")
            .insert({
                category_id: payload.category_id,
                amount_cents: payload.amount_cents,
                type: payload.type,
                notes: payload.notes,
                recurring_duration: payload.recurring_duration,
                start_date: newDate,
                last_generated_date: newDate,
                is_active: true
            })
            .select()
            .single()
        if (ruleError) return console.log(ruleError)

        // Call cron function
        const { error: genError } = await supabase.rpc("generate_recurring_transactions")
        if (genError) console.log(genError)

        navigate("/recurring-transactions")
    }

    return recurringTransaction ? (
        <div>
            <RecurringTransactionForm initialValues={recurringTransaction} onSubmit={handleUpdateFuture} onDeleteFuture={handleDeleteFuture} onDeleteAll={handleDeleteAll} create={false}/> 
        </div> 
    ) : null 
    //only render when transaction is ready


}