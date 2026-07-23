import { createClient } from "@/lib/supabase/client"  
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import TransactionForm from "@/components/TransactionForm"
import { useNavigate, useParams} from "react-router-dom"
import { useState, useEffect } from "react"
import { DURATION_CONFIG, addDuration, periodsElapsed, getCurrentPeriod, getPeriodHistory, getSpentForBudget} from "@/lib/helperFunctions";
import BudgetCard from "@/components/BudgetCard";
import SwipeDetailsCard from "@/components/SwipeDetailsCard";

export default function BudgetDetails() {
    const {budgetID} = useParams()
    const navigate = useNavigate()
    const supabase = createClient()
    const [budget, setBudget] = useState(null)
    const [transactions, setTransactions] = useState(null)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

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

    function handleSeeTransactions(budget, period) {
        const params = new URLSearchParams({
            start: period.start.toISOString(),
            end: period.end.toISOString(),
            category: budget.category_id, // adjust to whatever field holds the category
        })
        console.log(params)
        navigate(`/transactions?${params.toString()}`)
    }

    const handleEdit = (budget) => {
        navigate(`/edit-budget/${budgetID}`)
    }
    
    const handleDelete = () => {
        setOpenDeleteDialog(true)
   }
  
    const confirmDelete = async () => {
        const query = supabase
        .from("budgets")
        .delete()
        .eq("id", budgetID)

        const {error} = await query
        if (error) {
        console.error(error)
        }
        //setBudgets(prev => prev.filter(b=> b.id !==deleteId))
        setOpenDeleteDialog(false)
        navigate('/budgets')
    } 

    const latestPeriod = getCurrentPeriod(budget)



    return (
        <div className="p-4 pb-24 overflow-y-auto">
            <div className="flex justify-between">
            <h1 className="text-xl font-bold mb-4">Current Budget</h1>
                <div>
                    <Button variant="destructive" onClick={()=>handleDelete()}>
                        Delete
                    </Button>

                    <Button onClick={()=>handleEdit(budget.id)}>
                        Edit
                    </Button>
                </div>
            </div>
            {history.slice(0,1).map(({period, spent}) => {
                console.log(history)
                return (
                    <SwipeDetailsCard key={period.index} onSeeTransactions={()=>handleSeeTransactions(budget,period)}>
                        <BudgetCard key={period.index} budget={budget} period={period} amount_spent={spent}/>
                    </SwipeDetailsCard>
                );  
            })}
            {history.length==0 && 
            <div>
                <SwipeDetailsCard onSeeTransactions={()=>handleSeeTransactions(budget, latestPeriod)}>
                    <BudgetCard budget={budget} period={latestPeriod} amount_spent={getSpentForBudget(budget, latestPeriod, transactions)}/>
                </SwipeDetailsCard>
            </div>}

            <h1 className="text-xl font-bold mb-4 mt-6">Previous Budgets</h1>
                <div className="grid grid-cols-1 gap-4">
                {history.slice(1).map(({period, spent}) => {
                    return (
                        <SwipeDetailsCard key={period.index} onSeeTransactions={()=>handleSeeTransactions(budget,period)}>
                            <BudgetCard key={period.index} budget={budget} period={period} amount_spent={spent}/>
                        </SwipeDetailsCard>
                    );  
                })}
            </div>
            <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete budget?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently remove this budget.
                </AlertDialogDescription>
            </AlertDialogHeader> 

            <AlertDialogFooter className="flex flex-row justify-center">
                <AlertDialogCancel>
                   Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                    onClick={confirmDelete}
                    className="bg-red-500 hover:bg-red-600"
                >
                Delete
                </AlertDialogAction>
            </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>

        </div>
    )  
}