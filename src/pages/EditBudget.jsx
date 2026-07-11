import { createClient } from "@/lib/supabase/client"  
import BudgetForm from "@/components/BudgetForm" 
import { useNavigate, useParams} from "react-router-dom"
import { getCurrentPeriod } from "@/lib/helperFunctions"
import { useState, useEffect } from "react"

export default function EditBudget() {
    const {budgetID} = useParams()
    const navigate = useNavigate()
    const supabase = createClient()
    const [budget, setBudget] = useState([])

    useEffect (()=> {//code inside runs after render. telling it to run again when id changes
        async function loadBudget() {
            const {data} = await supabase.from("budgets").select("*").eq("id", budgetID).single()
            setBudget(data)
        }
        loadBudget()
    }, [budgetID]) //id is dependency array

    const handleUpdate = async (payload) => {
        const finalPayload = {...payload}
        //If turn off recurring, still retain the most recent budget
        if (budget.is_recurring && !payload.is_recurring) {
            const current_period = getCurrentPeriod(budget)
            if (current_period) {
                finalPayload.start_datetime = current_period.start.toISOString();
            }
        }
        const {error} = await supabase.from("budgets").update(finalPayload).eq("id",Number(budgetID) )
        if (!error) {
            navigate("/budgets")
        } else {
            console.log(error)
        }
    }

    return budget ? (
        <div>
            <BudgetForm initialValues={budget} onSubmit={handleUpdate} create={false}/> 
        </div> 
    ) : null 
    //only render when budget is ready


}