import { LoaderCircle, Inbox } from 'lucide-react';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-white text-black hover:bg-violet-100',
    accent: 'bg-violet-600 text-white hover:bg-violet-500',
    ghost: 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
    danger: 'bg-red-500/15 text-red-300 hover:bg-red-500/25',
  };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export function Field({ label, error, as: Component = 'input', className = '', ...props }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span>{label}</span>
      <Component className={`input ${className}`} {...props} />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}

export function Select({ label, children, ...props }) {
  return <Field label={label} as="select" {...props}>{children}</Field>;
}

export function LoadingSpinner({ label = 'Đang tải' }) {
  return <div className="flex items-center justify-center gap-2 py-12 text-zinc-400"><LoaderCircle className="animate-spin" /> {label}</div>;
}

export function EmptyState({ title, description, action }) {
  return <div className="glass grid place-items-center rounded-3xl p-10 text-center"><Inbox className="mb-4 text-zinc-500" size={34} /><h3 className="font-semibold">{title}</h3><p className="mt-2 max-w-sm text-sm text-zinc-400">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function ErrorState({ message = 'Không thể tải dữ liệu', onRetry }) {
  return <div role="alert" className="glass grid place-items-center rounded-3xl border border-red-500/20 p-10 text-center"><p className="font-semibold text-red-300">{message}</p><p className="mt-2 text-sm text-zinc-500">Kiểm tra kết nối và thử lại sau ít phút.</p>{onRetry && <Button type="button" variant="ghost" className="mt-5" onClick={onRetry}>Thử lại</Button>}</div>;
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onMouseDown={onClose}><div role="dialog" aria-modal="true" aria-label={title} className="glass max-h-[90vh] w-full max-w-xl overflow-auto rounded-3xl p-6" onMouseDown={(e) => e.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">{title}</h2><button className="text-zinc-400" onClick={onClose}>Đóng</button></div>{children}</div></div>;
}

export function ConfirmDialog({ open, title, description, onConfirm, onClose }) {
  return <Modal open={open} title={title} onClose={onClose}><p className="text-zinc-400">{description}</p><div className="mt-6 flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Hủy</Button><Button variant="danger" onClick={onConfirm}>Xác nhận</Button></div></Modal>;
}
