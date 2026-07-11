import { useEffect, useState, useMemo } from "react"
import BudgetCard from "@/components/BudgetCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client"
import { DURATION_CONFIG, addDuration, periodsElapsed, getCurrentPeriod, getSpentForBudget} from "@/lib/helperFunctions";
import SwipeBudgetCard from "@/components/SwipeBudgetCard";
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
import { useNavigate } from "react-router-dom";

function Budgets() {
  const navigate = useNavigate()
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransaction] = useState([])
  const [categories, setCategories] = useState([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const supabase = createClient()

  useEffect(() => { // useEffect lets u run code after rendering to avoid infinite running. [] is dependency array, means run exactly once when component first mounts.
    fetchBudgets()
  }, [])

  useEffect(()=> {
    fetchTransactions()
  }, [])

  useEffect(()=> {
    fetchCategories()
  }, [])

  async function fetchBudgets() {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")

    if (error) {
      console.error(error)
      return
    }
    setBudgets(data)
    
  }

  async function fetchTransactions() {
  const { data, error } = await supabase
      .from("transactions")
      .select("*")

    if (error) {
      console.error(error)
      return
    }
    setTransaction(data)
  }

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")

    if (error) {
      console.error(error)
      return
    }
    setCategories(data)
  }

  const sortedBudgets = useMemo(() => {
    if (!budgets.length || !transactions.length) return []

    return budgets
      .map((budget) => ({budget, period: getCurrentPeriod(budget)}))
      .filter(({period}) => period !== null)
      .map(({budget, period}) => {
        const spent = getSpentForBudget(budget, period, transactions) //in cents
        const total = budget.amount_cents || 1
        return {
          ...budget,
          period,
          spent,
          progress: spent / total,
        }
      })    
     .sort((a, b) => b.progress - a.progress)
  }, [budgets, transactions])

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setOpenDeleteDialog(true)

  }
  const confirmDelete = async () => {
    const query = supabase
      .from("budgets")
      .delete()
      .eq("id", deleteId)

    const {error} = await query
    if (error) {
      console.error(error)
    }
    setBudgets(prev => prev.filter(b=> b.id !==deleteId))
    setOpenDeleteDialog(false)
    setDeleteId(null)
  }

  //edit: go new page. 
  const handleEditClick = (budget) => {
    navigate(`/edit-budget/${budget.id}`)
  }



  return (
    <div className="p-4 pb-24 overflow-y-auto">

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4">Budgets</h1>
        <Button variant="default" onClick={() => window.location.href = "/new-budget"}>
          New Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedBudgets.map((budget) => {
          //const category_id = categories.find(c => c.id === budget.category_id)?.category_id;
          return (

            <SwipeBudgetCard key={budget.id}
              onEdit={()=> handleEditClick(budget)} 
              onDelete={()=> handleDeleteClick(budget.id)}
            >
              <BudgetCard budget={budget} period={budget.period} amount_spent={budget.spent}/>
            </SwipeBudgetCard>
          );
        })}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete budget?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove this budget.
              </AlertDialogDescription>
            </AlertDialogHeader> 

            <AlertDialogFooter className="flex flex-row justify-center">
              <AlertDialogCancel onClick={() => setDeleteId(null)}>
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
    </div>

  )



}


export default Budgets
