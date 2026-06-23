import { motion, useMotionValue } from "framer-motion"
import { useState } from "react"
import { Trash2, Pencil} from 'lucide-react';

export default function SwipeBudgetCard({
  children,
  onEdit,
  onDelete,
}) {
  const x = useMotionValue(0)
  const [open, setOpen] = useState(false)

  const handleDragEnd = (_, info) => {
    const offsetX = info.offset.x

    if (offsetX < -80) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  return (
    <div className="relative w-full overflow-hidden">

      {/* BACKGROUND ACTIONS */}
      <div className="absolute inset-0.5 flex justify-end bg-gray-200">
        <button
          onClick={onEdit}
          className="w-18 bg-gray-300 text-white px-4 text-sm flex items-center justify-center"
        >
          <Pencil/>
        </button>

        <button
          onClick={onDelete}
          className="w-18 bg-gray-400 text-white px-4 text-sm flex items-center justify-center"
        >
          <Trash2/>
        </button>
      </div>

      {/* FOREGROUND CARD */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={{ x: open ? -140 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-10 bg-white w-full"
      >
        {children}
      </motion.div>

    </div>
  )
}