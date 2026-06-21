import {budgets, transactions, categories} from "@/dummydata/data.js";
import { getSpentForBudget } from "@/components/BudgetCard"; 
import BudgetCard from "@/components/BudgetCard";
import { Button } from "@/components/ui/button";



function Budgets() {

  return (
    <div className="p-4">

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4">Budgets</h1>
        <Button variant="default" size="sm" onClick={() => window.location.href = "/new-budget"}>
          New Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {budgets.map((budget) => {
          const amount_spent = getSpentForBudget(budget, transactions);
          const category_name = categories.find(c => c.id === budget.category_id)?.name;
          return (
            <BudgetCard budget={budget} amount_spent={amount_spent} key={budget.id} category_name={category_name}/>
          );
        })}


      </div>
    </div>

  )



}


export default Budgets
