import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Trash2, CircleAlert as AlertCircle } from 'lucide-react';
import { loadPlansFromGitHub, deletePlanFromGitHub } from '../services/githubService';
import { PalletData } from '../types';
import toast from 'react-hot-toast';

interface GitHubPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPlan: (masterData: PalletData[], searchIds: string[]) => void;
}

interface Plan {
  name: string;
  date: string;
  masterData: PalletData[];
  searchIds: string[];
  filePath?: string;
}

export const GitHubPlansModal: React.FC<GitHubPlansModalProps> = ({ isOpen, onClose, onLoadPlan }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedPlans = await loadPlansFromGitHub();
      setPlans(loadedPlans as Plan[]);
    } catch (err: any) {
      setError('Error al cargar las planillas desde GitHub');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPlan = (plan: Plan) => {
    onLoadPlan(plan.masterData, plan.searchIds);
    toast.success(`Planilla "${plan.name}" cargada`);
    onClose();
  };

  const handleDeletePlan = async (plan: Plan) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${plan.name}"?`)) {
      return;
    }

    try {
      // For now, we can only delete by reconstructing the file path
      const filePath = `planillas/${plan.name}_*.json`;
      // Since we can't know the exact timestamp, we'll show a message
      toast.info('Eliminación desde GitHub requiere la interfaz de GitHub');
    } catch (err) {
      toast.error('Error al eliminar la planilla');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mis Planillas en GitHub</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {!loading && !error && plans.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400 text-lg">No hay planillas guardadas</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Crea y guarda una planilla para verla aquí</p>
              </div>
            )}

            {!loading && !error && plans.length > 0 && (
              <div className="space-y-3">
                {plans.map((plan, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(plan.date).toLocaleDateString()} - {new Date(plan.date).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {plan.masterData.length} pallets, {plan.searchIds.length} seleccionados
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleLoadPlan(plan)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Cargar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
