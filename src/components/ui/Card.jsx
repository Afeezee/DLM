export default function Card({ className = '', children }) {
  return <div className={["surface p-6 sm:p-8", className].join(' ')}>{children}</div>
}