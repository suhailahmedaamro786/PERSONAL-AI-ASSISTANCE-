import { AnimatePresence, motion } from 'framer-motion';
import { CheckCheck, Trash2, X } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { Button } from '../ui/Button';

export function TaskBulkBar() {
  const count = useTaskStore((s) => s.selected.length);
  const bulkComplete = useTaskStore((s) => s.bulkComplete);
  const bulkDelete = useTaskStore((s) => s.bulkDelete);
  const clearSelected = useTaskStore((s) => s.clearSelected);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18 }}
          className="sticky bottom-4 z-20 mx-auto flex w-fit items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-lg"
        >
          <span className="tabular-nums text-sm font-semibold text-text">{count} selected</span>
          <div className="mx-1 h-5 w-px bg-border" />
          <Button variant="secondary" size="sm" onClick={bulkComplete}>
            <CheckCheck className="h-3.5 w-3.5" /> Complete
          </Button>
          <Button variant="danger" size="sm" onClick={bulkDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={clearSelected} aria-label="Clear selection">
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
