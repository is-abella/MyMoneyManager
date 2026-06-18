
export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      
      {/* "phone frame" container */}
      <div className="w-full max-w-md bg-white min-h-screen relative">

        {children}

      </div>
    </div>
  )
}