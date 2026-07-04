import TransactionForm from "@/components/TransactionForm"
import { createClient } from "@/lib/supabase/client"  
import { useNavigate } from "react-router-dom"


export default function NewTransaction() {
    const navigate = useNavigate()
    const supabase = createClient()
    const handleCreate = async (payload, editScope) => {
        let recurringId = null

        if (payload.is_recurring) {
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
            const { data, error } = await supabase
            .from("recurring_transactions")
            .insert(recurringPayload)
            .select()
            .single()
            if (error) {
                console.log(error)
                return
            }
            recurringId = data.id
        }
        const {recurring_duration, ...transactionPayload } = payload
        const { error } = await supabase.from("transactions").insert({
            ...transactionPayload,
            recurring_id: recurringId
        })
        if (!error) {
            navigate("/transactions")
        } else {
            console.log(error)
        }
    }


    return (
        <div>
            <TransactionForm onSubmit={handleCreate} create={true}/>
        </div>
    )


}