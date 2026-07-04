import { createClient } from "@/lib/supabase/client"  
import TransactionForm from "@/components/TransactionForm"
import { useNavigate, useParams} from "react-router-dom"
import { useState, useEffect } from "react"
/*
        const payload = {
            notes : notes,
            category_id: selectedCategory.id,
            amount_cents: amount,
            transaction_datetime: transaction_datetime,
            recurring_duration: duration,
            is_recurring: isRecurring,
            type: type
        }
*/
export default function EditTransaction() {
    const {transactionID} = useParams()
    const navigate = useNavigate()
    const supabase = createClient()
    const [transaction, setTransaction] = useState([])

    useEffect (()=> {//code inside runs after render. telling it to run again when id changes
        async function loadTransaction() {
            const {data} = await supabase.from("transactions").select("*").eq("id", transactionID).single()
            const {data: durationData} = await supabase.from("recurring_transactions").select("recurring_duration").eq("id", data.recurring_id).single()
            setTransaction({...data, recurring_duration: durationData?.recurring_duration || null})
        }
        loadTransaction()
    }, [transactionID]) //id is dependency array

    const handleUpdate = async (payload) => { // taking out EditScope for now
        // transactionPayload for transaction table 
        const {recurring_duration, ...transactionPayload } = payload
        //when creating new recurring rule
        const recurringPayload = {
            category_id: payload.category_id,   
            amount_cents: payload.amount_cents,
            notes: payload.notes,
            type: payload.type,
            recurring_duration: payload.recurring_duration,
            start_date: payload.transaction_datetime,
            last_generated_date: payload.transaction_datetime,
            is_active: true
        }

        if (!transaction.is_recurring) { 
            if (!payload.is_recurring) {
                // Handle the case where the transaction is remains non-recurring
                const { error } = await supabase
                    .from("transactions")
                    .update({...transactionPayload, recurring_id: null})
                    .eq("id", transaction.id)
                if (error) return console.log(error)
            }
            else {
                // Handle the case where the transaction is made recurring
                // Add new recurring_transactions rule
                const { data, error: ruleError} = await supabase
                    .from("recurring_transactions")
                    .insert(recurringPayload)
                    .select()
                    .single()
                if (ruleError) {
                    console.log(ruleError)
                    return
                }

                const { error } = await supabase
                    .from("transactions")
                    .update({...transactionPayload, recurring_id: data.id})
                    .eq("id", transaction.id)
                if (error) return console.log(error)

            }
        
        // if recurrence turned off: disable whole series. 
        } else if (transaction.is_recurring && !payload.is_recurring) {

            const { error: deactivateError } = await supabase
                .from("recurring_transactions")
                .update({ is_active: false })
                .eq("id", transaction.recurring_id)
            if (deactivateError) return console.log(deactivateError)

            const { error: deleteError } = await supabase
                .from("transactions")
                .delete()
                .eq("recurring_id", transaction.recurring_id)
                .gt("transaction_datetime", transaction.transaction_datetime)
            if (deleteError) return console.log(deleteError)

            const { error } = await supabase
                .from("transactions")
                .update({...transactionPayload, recurring_id: null})
                .eq("id", transaction.id)
            if (error) return console.log(error)
        }
        //Transaction still turned on --> indiv or future edit
        /*else if (transaction.is_recurring && payload.is_recurring && editScope === "individual") {
                const { error } = await supabase
                    .from("transactions")
                    .update({...transactionPayload, recurring_id: transaction.recurring_id})
                    .eq("id", transaction.id)
                if (error) return console.log(error)
       }
        */

        else if (transaction.is_recurring && payload.is_recurring) { //&& editScope === "future"
            // if stays recurring:
              // disable old rule, delete transactions where transaction_datetime >= initialValues.transaction_datetime
              // create new rule, create new transaction
            // if turns off recurring:
              // disable old rule, delete transactions where transaction_datetime >= initialValues.transaction_datetime
              // current transaction is not recurring

            //Either way, disable old rule and delete future transactions
            const { error: deactivateError } = await supabase
                .from("recurring_transactions")
                .update({ is_active: false })
                .eq("id", transaction.recurring_id)
            if (deactivateError) return console.log(deactivateError)

            const { error: deleteError } = await supabase
                .from("transactions")
                .delete()
                .eq("recurring_id", transaction.recurring_id)
                .gt("transaction_datetime", transaction.transaction_datetime)
            if (deleteError) return console.log(deleteError)

            // Create new rule and update current.
            const { data, error: ruleError} = await supabase
                .from("recurring_transactions")
                .insert(recurringPayload)
                .select()
                .single()
            if (ruleError) return console.log(ruleError)
            
            const { error } = await supabase
                .from("transactions")
                .update({...transactionPayload, recurring_id: data.id})
                .eq("id", transaction.id)
            if (error) return console.log(error)
        }
        navigate("/transactions")
    }

    return transaction ? (
        <div>
            <TransactionForm initialValues={transaction} onSubmit={handleUpdate} create={false}/> 
        </div> 
    ) : null 
    //only render when transaction is ready


}