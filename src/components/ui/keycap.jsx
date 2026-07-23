// KeycapButton.jsx
import KeycapIcon from "@/assets/new_one.svg"; // if using svgr, or as <img src=...> if not a component

export function KeycapButton({ onClick, children, ...props }) {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center justify-center rounded-xl
                 
                 transition-all duration-100
                 active:translate-y-1 "
      {...props}
    >
      <img src={KeycapIcon} className="h-10 w-20" />
      {children}
    </button>
  );
}