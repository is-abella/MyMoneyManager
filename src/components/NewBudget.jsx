import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
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
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { format } from "date-fns"
import {categories} from "@/dummydata/data.js"


export default function NewBudget() {
    const [date, setDate] = useState(null)
    const [selectedCategory, setCategory] = useState(null)
    const [drawerOpen, setOpen] = useState(false)
    
    return (
        <div className="w-full max-w-md p-5">
            <form>
                <FieldGroup className="grid max-w-sm grid-cols-2 pb-5">
                    <Field>
                        <FieldLabel>Category</FieldLabel>
                        <Drawer open = {drawerOpen} onOpenChange = {setOpen}> 
                            <DrawerTrigger asChild>
                                <Button variant="outline" className = "justify-start">
                                    {selectedCategory? 
                                    (<div className = "flex items-center gap-1.5"><img src={selectedCategory.icon}/><span>{selectedCategory.name}</span></div>) 
                                    : ("Select Category")}
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <div className="grid grid-cols-4 gap-4 m-5">
                                {categories.map(category => (
                                    <button className="flex flex-col items-center gap-2 rounded-lg border p-3"
                                        key={category.id}
                                        type="button"
                                        onClick={() =>{ setCategory(category) 
                                                        setOpen(false)}}
                                    >
                                    <img
                                        src={category.icon}
                                        alt={category.name}
                                        className="h-8 w-8"
                                    />
                                    <span className="text-sm">
                                        {category.name}
                                    </span>
                                    </button>
                                ))}
                                </div>
                            </DrawerContent>

                        </Drawer>
                    </Field>
                    <Field>
                        <FieldLabel>Amount</FieldLabel>
                        <Input id="budget-amount" placeholder="Enter amount" type="number" step="0.01" required/>
                    </Field>
                    <Field>
                        <FieldLabel>Start Date</FieldLabel> 
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button id="budget-start-date" variant = "outline">
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
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
                        <FieldLabel>Duration</FieldLabel>
                        <Select defaultValue="1 Month">
                            <SelectTrigger id = "budget-duration" className="w-full">
                                <SelectValue placeholder = "Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Custom">Custom</SelectItem>
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
                
                <FieldSeparator />
                
                <FieldGroup className = "grid max-w-sm grid-cols-2 pt-5 pb-5">
                    <Field className="self-start">
                        <div className="flex items-center gap-2">
                            <FieldLabel>Recurrence</FieldLabel>
                            <Switch id="budget-recurrence" />
                        </div>
                    </Field>
                </FieldGroup>

                <FieldSeparator className="pb-5"/>

                <div className="mt-4 float-right">
                    <Button variant="outline" className="mt-4 mr-4" onClick={() => window.location.href = "/budgets"}>
                        Cancel
                    </Button>
                    <Button type="submit" className="mt-4">
                        Create Budget
                    </Button>

                </div>

            </form>
        </div> 
    )

}