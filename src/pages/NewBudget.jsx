import { createClient } from "@/lib/supabase/client"  
import BudgetForm from "@/components/BudgetForm" 
import { useNavigate } from "react-router-dom"


export default function NewBudget() {
    const navigate = useNavigate()
    const supabase = createClient()
    const handleCreate = async (payload) => {
        const {error} = await supabase.from("budgets").insert(payload)
        if (!error) {
            navigate("/budgets")
        } else {
            console.log(error)
        }

    }


    return (
        <div>
            <BudgetForm onSubmit={handleCreate} create={true}/>
        </div>
    )


}