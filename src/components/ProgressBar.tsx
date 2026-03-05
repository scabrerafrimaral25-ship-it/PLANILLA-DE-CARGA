import React from 'react';
import { motion } from 'motion/react';
import { CircleCheck as CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  total: number;
  show: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, show }) => {
  if (!show || total === 0) return null;

  const percentage = Math.round((current / total) * 100);
  const isComplete = current === total;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 print:hidden"
    >
      <div className="bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center gap-4 min-w-[320px]">
        {isComplete ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                Completado
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {current} de {total} pallets escaneados
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Progreso de escaneo
                </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {current} de {total} pallets
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
