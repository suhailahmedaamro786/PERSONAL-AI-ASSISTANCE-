import { motion, type HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../lib/utils';

export function PageContainer({
  className,
  children,
  ...props
}: HTMLMotionProps<'div'>) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}