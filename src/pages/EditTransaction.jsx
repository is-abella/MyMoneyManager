import { createClient } from "@/lib/supabase/client"  
import TransactionForm from "@/components/TransactionForm"
import { useNavigate, useParams} from "react-router-dom"
import { useState, useEffect } from "react"

export default function EditTransaction() {
    const {transactionID} = useParams()
    const navigate = useNavigate()
    const supabase = createClient()
    const [transaction, setTransaction] = useState([])

    useEffect (()=> {//code inside runs after render. telling it to run again when id changes
        async function loadTransaction() {
            const {data} = await supabase.from("transactions").select("*").eq("id", transactionID).single()
            setTransaction(data)
        }
        loadTransaction()
    }, [transactionID]) 

    //category_id
    //amount_cents
    //transaction_datetime
    //type
    //notes

    const handleUpdate = async (payload) => { 
        const {recurring_duration, ...transactionPayload} = payload
        const { error } = await supabase
            .from("transactions")
            .update({...transactionPayload, recurring_id: transaction.recurring_id})
            .eq("id", transactionID)
        if (error) return console.log(error) 
        navigate("/transactions")
    }

    const handleDelete = async() => {
        const { error } = await supabase
            .from("transactions")
            .delete()
            .eq("id", transactionID)
        if (error) return console.log(error)
        navigate("/transactions")

    }

    return transaction ? (
        <div>
            <TransactionForm initialValues={transaction} onSubmit={handleUpdate} create={false} onDelete={handleDelete} /> 
        </div> 
    ) : null 
    //only render when transaction is ready


}