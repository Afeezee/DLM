export default function Modal({ children, isOpen = false, title = 'Modal' }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 p-4">
      <div className="surface w-full max-w-lg p-6">
        <h2 className="text-3xl">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}