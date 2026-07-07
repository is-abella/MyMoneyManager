import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldDescription
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { categoryDict } from "@/dummydata/data.js"
import { createClient } from "@/lib/supabase/client"


export default function RecurringTransactionForm( {
    initialValues, //takes in recurring_transaction instance
    onSubmit, // function to run
    onDeleteFuture,
    onDeleteAll,
}) {
    const [notes, setNotes] = useState(initialValues?.notes || "")
    const [categories, setCategories] = useState([])
    const [startDate, setStartDate] = useState(initialValues?.start_date ? new Date(initialValues.start_date) : new Date())
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [transactionAmount, setTransactionAmount] = useState(initialValues?.amount_cents / 100 || 0)
    const [duration, setDuration] = useState(initialValues?.recurring_duration || "")
    const [type, setType] = useState(initialValues?.type || "")
    const [drawerOpen, setOpen]= useState(false)
    //const [editScope, setEditScope] = useState("individual") // "individual" or "all"

    const supabase = createClient()

    useEffect(()=> {
        fetchCategories()
    }, [])

    async function fetchCategories() {
        const { data, error } = await supabase
        .from("categories")
        .select("*")
        console.log(data)

        if (error) {
        console.error(error)
        return
        }
        setCategories(data)
    }

    useEffect(() => {
        if (!initialValues) return

        setNotes(initialValues.notes || "")
        setStartDate(initialValues.start_date ? new Date(initialValues.start_date) : null)
        setTransactionAmount(initialValues.amount_cents / 100 || 0)
        setDuration(initialValues.recurring_duration || "")
        setType(initialValues.type || "")
    }, [initialValues])

    useEffect(() => {
        if (!categories.length || !initialValues) return
        const cat = categories.find(
            c => c.id === initialValues.category_id
        )
        setSelectedCategory(cat)
    }, [categories, initialValues])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!selectedCategory) {
            alert("Please select a category")
            return
        }
        if (!transactionAmount || Number(transactionAmount) <= 0) {
            alert("Please enter a valid amount")
            return
        }
        if (!startDate) {
            alert("Please pick a date")
            return
        }
        //const formData = new formData(e.target)
        const amount = Math.round(Number(transactionAmount)*100)
        const transaction_startdate = startDate.toISOString()// how to save as timestampz?

        const payload = {
            notes : notes,
            category_id: selectedCategory.id,
            amount_cents: amount,
            transaction_datetime: transaction_startdate,
            recurring_duration: duration,
            last_generated_date: transaction_startdate,
            is_active: true,
            type: type
        }

        onSubmit(payload) //editScope
    }

    const handleDeleteFuture = () => {
        const confirmed = window.confirm("Disable this recurring transaction?")
        if (!confirmed) return
        onDeleteFuture()
    }

    const handleDeleteAll = () => {
        const confirmed = window.confirm("Delete all occurrences related to this recurring transaction?")
        if (!confirmed) return
        onDeleteAll()
    }

    const hasAnyChanges = useMemo(() => {
        if (!initialValues) return true // creating new, always "changed"
        return (
            notes !== (initialValues.notes || "") ||
            selectedCategory?.id !== initialValues.category_id ||
            Number(transactionAmount) !== (initialValues.amount_cents / 100) ||
            startDate?.toISOString() !== new Date(initialValues.start_date).toISOString() ||
            duration !== (initialValues.recurring_duration || "")
        )
    }, [notes, duration, selectedCategory, transactionAmount, startDate, initialValues])

    
    return (
        <div className="w-full max-w-md p-5 text-base">
            <form onSubmit = {handleSubmit}>
                <FieldGroup className="grid max-w-sm grid-cols-2 pb-5">
                    <Field>
                        <FieldLabel>Category</FieldLabel>
                        <Drawer open = {drawerOpen} onOpenChange = {setOpen}> 
                            <DrawerTrigger asChild>
                                <Button variant="outline" className = "justify-start">
                                    {selectedCategory? 
                                    (<div className = "flex items-center gap-1.5"><img src={categoryDict[selectedCategory.id]}/><span>{selectedCategory.category_name}</span></div>) 
                                    : ("Select Category")}
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <div className="grid grid-cols-4 gap-4 m-5">
                                {categories.map(category => (
                                    <button className="flex flex-col items-center gap-2 border p-3"
                                        key={category.id}
                                        type="button"
                                        onClick={() =>{ setSelectedCategory(category) 
                                        setType(category.category_type)
                                        setOpen(false)}}
                                    >
                                    <img
                                        src={categoryDict[category.id]}
                                        alt={category.category_name}
                                        className="h-8 w-8"
                                    />
                                    <span className="text-sm">
                                        {category.category_name}
                                    </span>
                                    </button>
                                ))}
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </Field>

                    <Field>
                        <FieldLabel>Amount
                            {selectedCategory && <Badge variant="secondary" className="text-xs">{type}</Badge>}
                        </FieldLabel>
                        <Input className = "text-base" value = {transactionAmount} 
                        onChange={(e) => setTransactionAmount(e.target.value)} placeholder="Enter amount" type="number" inputMode="numeric" step="0.01" required/>
                    </Field>
                </FieldGroup>

                <FieldGroup className="grid max-w-sm grid-cols-2 pb-5">
                    <Field>
                        <FieldLabel>Transaction Date</FieldLabel> 
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant = "outline" className="justify-between text-left">
                                    {startDate ? format(startDate, "PPP") : <span >Pick a date</span>}
                                </Button>
                            </PopoverTrigger >
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar 
                                    mode="single" 
                                    selected={startDate} 
                                    onSelect={setStartDate}
                                    defaultMonth={startDate}>
                                </Calendar>
                            </PopoverContent>
                        </Popover>
                    </Field>
                                  
                    <Field>
                        <FieldLabel>Notes</FieldLabel>
                        <Input className = "text-base" value = {notes} onChange={(e) => setNotes(e.target.value)}  placeholder="Meow..." type="text"/>
                    </Field>
                </FieldGroup>
                
                <FieldGroup className = "grid max-w-sm grid-cols-2 pb-5">
                    <Field>
                        <FieldLabel>Duration</FieldLabel>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder = "Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1 Day">1 Day</SelectItem>
                                <SelectItem value="1 Week">1 Week</SelectItem>
                                <SelectItem value="2 Weeks">2 Weeks</SelectItem>
                                <SelectItem value="1 Month">1 Month</SelectItem>
                                <SelectItem value="6 Months">6 Months</SelectItem>
                                <SelectItem value="1 Year">1 Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </FieldGroup>

                <FieldSeparator className="pb-5"/>

                <div className="mt-4 float-right">
                    <Button  type="button" variant="outline" className="mt-4 mr-4" onClick={() => window.location.href = "/recurring-transactions"}>
                        Cancel
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" className="mt-4" variant="destructive">
                                Delete
                            </Button>
                        </PopoverTrigger >
                        <PopoverContent className="w-auto p-0" align="start">
                            <Button type="button" className="mt-4" variant="destructive" onClick={handleDeleteFuture}>
                                Disable Series from Now
                            </Button>
                            <Button type="button" className="mt-4" variant="destructive" onClick={handleDeleteAll}>
                                Delete All Related Transactions
                            </Button>
                        </PopoverContent>
                    </Popover>

                    
                    <Button type="submit" className="mt-4" disabled={!hasAnyChanges}>
                        Edit This Series
                    </Button>
                
                </div>
            </form>
        </div> 
    )
}