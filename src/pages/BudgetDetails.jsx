import { createClient } from "@/lib/supabase/client"  
import TransactionForm from "@/components/TransactionForm"
import { useNavigate, useParams} from "react-router-dom"
import { useState, useEffect } from "react"
import { DURATION_CONFIG, addDuration, periodsElapsed, getCurrentPeriod, getPeriodHistory, getSpentForBudget} from "@/lib/helperFunctions";
import BudgetCard from "@/components/BudgetCard";

export default function BudgetDetails() {
    const {budgetID} = useParams()
    const supabase = createClient()
    const [budget, setBudget] = useState(null)
    const [transactions, setTransactions] = useState(null)

    useEffect(() => {
        async function load() {
        const { data: budgetData } = await supabase.from("budgets").select("*").eq("id", budgetID).single();
        setBudget(budgetData);

        const { data: transactions } = await supabase
            .from("transactions")
            .select("*")
            .eq("category_id", budgetData.category_id);
        setTransactions(transactions ?? []);
        }
        load();
    }, [budgetID]);

    if (!budget || !transactions) return null // or a loading spinner

    const history = getPeriodHistory(budget).map(period => ({
        period,
        spent: getSpentForBudget(budget, period, transactions),
    }));

    return (
        history.map(({period, spent}) =>
            <BudgetCard key={period.index} budget={budget} period={period} amount_spent={spent}/>
        )
    )  
}