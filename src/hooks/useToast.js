import { useState, useCallback } from "react";
let _id = 0;
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const add    = useCallback((message, type = "info") => setToasts(p => [...p, { id: ++_id, message, type }]), []);
  const remove = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}
