
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card";
import { categoryDict } from "@/dummydata/data";
import { createClient } from "@/lib/supabase/client"
import { useNavigate } from "react-router-dom";
import {Badge} from "@/components/ui/badge";
import RecurringTransactionForm from "@/components/RecurringTransactionForm";

export default function RecurringTransactionCard(recurring_transaction) {
    const supabase = createClient()
    const [categories, setCategories] = useState([])
    const navigate = useNavigate()
    

    useEffect(() => {
        async function loadCategories() {
            const { data, error } = await supabase.from("categories").select("*")
            if (error) {
                console.log(error)
                return
            }
            setCategories(data)
        }
        loadCategories()
    }, [])
    


    return (
        <Card onClick={() => navigate(`/edit-recurring-transaction/${recurring_transaction.id}`)} className="p-2">

                <div className = "flex items-center gap-2 w-full">
                    <img src = {categoryDict[recurring_transaction.category_id]} />
                    {/*<p className="text-sm font-semibold">{categories.find(c => c.id === recurring_transaction.category_id)?.category_name}</p>*/}
                    <p className="text-sm font-semibold font-normal mr-4">{recurring_transaction.notes}</p>
                    
                    {recurring_transaction.type == "expense" ? 
                    <Badge className="bg-[var(--budget-high)] opacity-40">
                        <p className="text-sm font-normal font-semibold"> ${(recurring_transaction.amount_cents/100).toFixed(2)}</p>
                    </Badge> :
                    <Badge className="bg-[var(--budget-low)] opacity-60">
                        <p className="text-sm font-normal font-semibold"> ${(recurring_transaction.amount_cents/100).toFixed(2)}</p>
                    </Badge> 
                    }      

                    <p className="text-sm font-normal ml-auto">Every {recurring_transaction.recurring_duration}</p>
                </div>  

        </Card>
    )
}