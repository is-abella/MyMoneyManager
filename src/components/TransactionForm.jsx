import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { categoryDict } from "@/dummydata/data.js"
import { createClient } from "@/lib/supabase/client"


export default function TransactionForm( {
    initialValues, //budget instance
    onSubmit, // function to run
    create // true if create, false if edit
}) {
    const [notes, setNotes] = useState(initialValues?.notes || "")
    const [categories, setCategories] = useState([])
    const [date, setDate] = useState(initialValues?.transaction_datetime ? new Date(initialValues.transaction_datetime) : new Date())
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [transactionAmount, setTransactionAmount] = useState(initialValues?.amount_cents / 100 || 0)
    const [duration, setDuration] = useState(initialValues?.recurring_duration || "")
    const [isRecurring, setRecurring] = useState(initialValues?.is_recurring || false)
    const [type, setType] = useState(initialValues?.type || "")
    const [drawerOpen, setOpen]= useState(false)

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
        setDate(initialValues.transaction_datetime ? new Date(initialValues.transaction_datetime) : null)
        setTransactionAmount(initialValues.amount_cents / 100 || 0)
        setDuration(initialValues.recurring_duration || "")
        setRecurring(initialValues.is_recurring || false)
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
        //const formData = new formData(e.target)
        const amount = Math.round(Number(transactionAmount)*100)
        const transaction_datetime = date.toISOString()// how to save as timestampz?

        const payload = {
            notes : notes,
            category_id: selectedCategory.id,
            amount_cents: amount,
            transaction_datetime: transaction_datetime,
            recurring_duration: duration,
            is_recurring: isRecurring,
            type: type
        }
        onSubmit(payload)
    }
    
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
                                    {date ? format(date, "PPP") : <span >Pick a date</span>}
                                </Button>
                            </PopoverTrigger >
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar 
                                    mode="single" 
                                    selected={date} 
                                    onSelect={setDate}
                                    defaultMonth={date}>
                                </Calendar>
                            </PopoverContent>
                        </Popover>
                    </Field>
                                  
                    <Field>
                        <FieldLabel>Notes</FieldLabel>
                        <Input className = "text-base" value = {notes} onChange={(e) => setNotes(e.target.value)}  placeholder="Meow..." type="text" required/>
                    </Field>
                </FieldGroup>
                
                <FieldSeparator />
                
                <FieldGroup className = "grid max-w-sm grid-cols-2 pt-5 pb-5">
                    <Field className="self-start">
                        <div className="flex items-center gap-2">
                            <FieldLabel>Recurrence</FieldLabel>
                            <Switch checked = {isRecurring} onCheckedChange ={(checked) => {setRecurring(checked)
                             !checked ? setDuration("") : {}
                            }} />
                        </div>
                    </Field>
                                    
                    <Field>
                        <FieldLabel>Duration</FieldLabel>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder = "Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1 Week">1 Week</SelectItem>
                                <SelectItem value="2 Weeks">2 Weeks</SelectItem>
                                <SelectItem value="1 Month">1 Month</SelectItem>
                                <SelectItem value="2 Months">2 Months</SelectItem>
                                <SelectItem value="3 Months">3 Months</SelectItem>
                                <SelectItem value="6 Months">6 Months</SelectItem>
                                <SelectItem value="1 Year">1 Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </FieldGroup>

                <FieldSeparator className="pb-5"/>

                <div className="mt-4 float-right">
                    <Button variant="outline" className="mt-4 mr-4" onClick={() => window.location.href = "/transactions"}>
                        Cancel
                    </Button>
                    { create ? 
                    <Button type="submit" className="mt-4">
                        Create Transaction
                    </Button>  :    
                    <Button type="submit" className="mt-4">
                        Edit Transaction
                    </Button> }

                </div>

            </form>
        </div> 
    )
}