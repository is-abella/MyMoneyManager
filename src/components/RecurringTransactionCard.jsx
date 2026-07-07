
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card";
import { categoryDict } from "@/dummydata/data";
import { createClient } from "@/lib/supabase/client"
import { useNavigate } from "react-router-dom";
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
            <div className="flex justify-between">
                <div className = "flex items-center gap-2">
                    <img src = {categoryDict[recurring_transaction.category_id]} />
                    <p className="text-sm font-semibold">{categories.find(c => c.id === recurring_transaction.category_id)?.category_name}</p>
                    <p className="text-sm font-semibold">{recurring_transaction.notes}</p>
                    <p className="text-sm text-gray-600"> ${(recurring_transaction.amount_cents/100).toFixed(2)}</p>
                    <p className="text-sm text-gray-600"> {recurring_transaction.type}</p>
                    <p className="text-sm text-gray-600">Recurring {recurring_transaction.recurring_duration}</p>
                </div>  
            </div>
        </Card>
    )
}