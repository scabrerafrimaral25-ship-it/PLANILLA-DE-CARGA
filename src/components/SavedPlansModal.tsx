import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Loader2, Trash2, Download, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingPlan, getAllPlans, deletePlan } from '../services/loadingPlansService';
import { PalletData } from '../types';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPlan: (masterData: PalletData[], searchIds: string[]) => void;
  onSavePlan: (planName: string) => void;
  masterData: PalletData[];
  searchIds: string[];
  currentPlanName?: string;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  onLoadPlan,
  onSavePlan,
  masterData,
  searchIds,
  currentPlanName,
}) => {
  const [plans, setPlans] = useState<LoadingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const allPlans = await getAllPlans();
      setPlans(allPlans);
    } catch (err) {
      console.error('Error loading plans:', err);
      toast.error('Error cargando planillas');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPlan = (plan: LoadingPlan) => {
    onLoadPlan(plan.master_data, plan.search_ids);
    toast.success(`Planilla "${plan.plan_name}" cargada`);
    onClose();
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!window.confirm(`¿Eliminar planilla "${planName}"?`)) return;

    try {
      const success = await deletePlan(planId);
      if (success) {
        setPlans(plans.filter(p => p.id !== planId));
        toast.success('Planilla eliminada');
      } else {
        toast.error('Error eliminando planilla');
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      toast.error('Error eliminando planilla');
    }
  };

  const handleSavePlan = async () => {
    if (!newPlanName.trim()) {
      toast.error('Ingresa un nombre para la planilla');
      return;
    }

    setSavingPlan(true);
    try {
      onSavePlan(newPlanName);
      setNewPlanName('');
      setShowSaveForm(false);
      setSavingPlan(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      loadPlans();
    } catch (err) {
      console.error('Error saving plan:', err);
      toast.error('Error guardando planilla');
      setSavingPlan(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mis Planillas</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {masterData.length > 0 && (
            <div>
              <AnimatePresence mode="wait">
                {!showSaveForm ? (
                  <motion.button
                    key="save-button"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => setShowSaveForm(true)}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Guardar Planilla Actual
                  </motion.button>
                ) : (
                  <motion.div
                    key="save-form"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-3"
                  >
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Nombre de la planilla:
                    </label>
                    <input
                      type="text"
                      value={newPlanName}
                      onChange={e => setNewPlanName(e.target.value)}
                      placeholder="ej: Carga 2024-03-05"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onKeyPress={e => e.key === 'Enter' && handleSavePlan()}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePlan}
                        disabled={savingPlan}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 rounded-lg transition-colors"
                      >
                        {savingPlan ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setShowSaveForm(false);
                          setNewPlanName('');
                        }}
                        className="flex-1 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Planillas Guardadas ({plans.length})
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : plans.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No tienes planillas guardadas. Carga un archivo y guárdalo para verlo aquí.
              </p>
            ) : (
              <div className="space-y-3">
                {plans.map(plan => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                          {plan.plan_name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {plan.master_data.length} pallets • {plan.search_ids.length} buscados • {formatDate(plan.updated_at)}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleLoadPlan(plan)}
                          className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          title="Cargar"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id, plan.plan_name)}
                          className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
