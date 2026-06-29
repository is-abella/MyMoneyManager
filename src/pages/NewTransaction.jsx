import TransactionForm from "@/components/TransactionForm"
import { createClient } from "@/lib/supabase/client"  
import { useNavigate } from "react-router-dom"


export default function NewTransaction() {
    const navigate = useNavigate()
    const supabase = createClient()
    const handleCreate = async (payload) => {
        const {error} = await supabase.from("transactions").insert(payload)
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