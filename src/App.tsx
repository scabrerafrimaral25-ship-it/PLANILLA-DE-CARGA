/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { PalletSearch } from './components/PalletSearch';
import { LoadingPlan } from './components/LoadingPlan';
import { Dashboard } from './components/Dashboard';
import { ProgressBar } from './components/ProgressBar';
import { ToastProvider } from './components/ToastProvider';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { parseExcelFile, mapDataToPallets } from './utils/excel';
import { PalletData, ContainerGroup } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { PackageCheck, AlertCircle, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [masterData, setMasterData] = useState<PalletData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugData, setDebugData] = useState<any[] | null>(null);
  const [searchIds, setSearchIds] = useState<string[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem('pallet_master_data');
    const storedSearch = localStorage.getItem('pallet_search_ids');

    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (data.length > 0) {
          setMasterData(data);
          toast.success('Datos restaurados desde la última sesión');
        }
      } catch (e) {
        console.error('Error restaurando datos:', e);
      }
    }

    if (storedSearch) {
      try {
        const search = JSON.parse(storedSearch);
        if (search.length > 0) {
          setSearchIds(search);
        }
      } catch (e) {
        console.error('Error restaurando búsqueda:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (masterData.length > 0) {
      localStorage.setItem('pallet_master_data', JSON.stringify(masterData));
    }
  }, [masterData]);

  useEffect(() => {
    localStorage.setItem('pallet_search_ids', JSON.stringify(searchIds));
  }, [searchIds]);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setDebugData(null);
    try {
      const rawData = await parseExcelFile(file);
      
      // Store raw data for debug view if needed
      setDebugData(rawData.slice(0, 10)); // Keep first 10 rows for debug

      const pallets = mapDataToPallets(rawData);
      
      if (pallets.length === 0) {
        setError('No se encontraron datos válidos. Revisa la "Vista Previa de Datos" abajo para ver qué está leyendo el sistema.');
      } else {
        setMasterData(pallets);
      }
    } catch (err: any) {
      console.error(err);
      setError(`Error: ${err.message || 'Error desconocido al procesar el archivo.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (ids: string[]) => {
    setSearchIds(ids);
  };

  const handleClearSearch = () => {
    setSearchIds([]);
  };

  const { groups, notFoundIds } = useMemo(() => {
    if (searchIds.length === 0) return { groups: [], notFoundIds: [] };

    const notFound: string[] = [];
    const foundContainerIds = new Set<string>();

    // 1. Identify containers that have the searched pallets
    searchIds.forEach(id => {
      const cleanId = id.trim();
      const pallet = masterData.find(p => p.palletId === cleanId);
      
      if (pallet) {
        foundContainerIds.add(pallet.containerId);
      } else {
        notFound.push(cleanId);
      }
    });

    // 2. Get ALL pallets for those containers (not just the searched ones)
    const relevantPallets = masterData.filter(p => foundContainerIds.has(p.containerId));

    // 3. Group by container
    const grouped = relevantPallets.reduce((acc, pallet) => {
      if (!acc[pallet.containerId]) {
        acc[pallet.containerId] = {
          containerId: pallet.containerId,
          pallets: [],
          totalQuantity: 0,
          totalBoxes: 0,
          totalWeight: 0,
        };
      }
      acc[pallet.containerId].pallets.push(pallet);
      acc[pallet.containerId].totalQuantity += pallet.quantity;
      acc[pallet.containerId].totalBoxes += pallet.boxes;
      acc[pallet.containerId].totalWeight += pallet.weight;
      return acc;
    }, {} as Record<string, ContainerGroup>);

    return {
      groups: Object.values(grouped),
      notFoundIds: notFound
    };
  }, [masterData, searchIds]);

  const grandTotals = useMemo(() => {
    return groups.reduce(
      (acc, group) => {
        group.pallets.forEach((pallet) => {
          if (searchIds.includes(pallet.palletId)) {
            acc.pallets += 1;
            acc.boxes += pallet.boxes;
            acc.weight += pallet.weight;
          }
        });
        return acc;
      },
      { pallets: 0, boxes: 0, weight: 0 }
    );
  }, [groups, searchIds]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans selection:bg-green-100 selection:text-green-900 pb-20 transition-colors">

      <ProgressBar current={searchIds.length} total={masterData.length} show={masterData.length > 0 && searchIds.length > 0} />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <PackageCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Gestor de Carga
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
            {masterData.length > 0 && (
              <>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full hidden sm:block">
                  {masterData.length} Pallets Cargados
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres cargar un nuevo archivo? Se perderá la búsqueda actual.')) {
                      setMasterData([]);
                      setSearchIds([]);
                      localStorage.removeItem('pallet_master_data');
                      localStorage.removeItem('pallet_search_ids');
                      toast.success('Datos borrados correctamente');
                    }
                  }}
                  className="text-sm text-green-600 dark:text-green-400 font-medium hover:text-green-800 dark:hover:text-green-300 transition-colors"
                >
                  Cambiar Archivo
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <AnimatePresence mode="wait">
          {masterData.length === 0 ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Comencemos a organizar tu carga
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                  Sube tu planilla maestra de Excel para comenzar a buscar y agrupar pallets por contenedor automáticamente.
                </p>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 max-w-lg mx-auto text-left shadow-sm">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-green-600" />
                    Formato esperado (basado en tu nueva captura):
                  </h3>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
                    <li>Columna C: Contenedor (ej: FMLU 854344-)</li>
                    <li>Columna D: Pallets/Cantidad</li>
                    <li>Columna E: Cajas</li>
                    <li>Columna F: Kilos</li>
                    <li>Columna G: Contenido</li>
                    <li>Columna H: Nro Lote / Pallet ID (ej: 278293)</li>
                  </ul>
                </div>
              </div>
              
              <FileUpload onFileUpload={handleFileUpload} />
              
              {loading && (
                <div className="mt-8 flex items-center text-indigo-600 font-medium animate-pulse">
                  Procesando archivo...
                </div>
              )}
              
              {error && (
                <div className="mt-8 w-full max-w-2xl mx-auto">
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="font-medium">{error}</span>
                    </div>
                    <p className="text-sm text-red-500 ml-7">
                      Verifica que el archivo no esté protegido con contraseña y sea un Excel válido (.xlsx o .xls).
                    </p>
                  </div>

                  {debugData && (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm overflow-hidden">
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">Vista Previa de Datos (Primeras 10 filas)</h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Esto es lo que el sistema está leyendo de tu archivo. Verifica si los datos se ven correctos.
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr>
                              <th className="border border-slate-200 p-1 bg-slate-50">#</th>
                              {debugData[0]?.map((_: any, i: number) => (
                                <th key={i} className="border border-slate-200 p-1 bg-slate-50">Col {String.fromCharCode(65 + i)}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {debugData.map((row, i) => (
                              <tr key={i}>
                                <td className="border border-slate-200 p-1 font-mono text-slate-400">{i + 1}</td>
                                {row.map((cell: any, j: number) => (
                                  <td key={j} className="border border-slate-200 p-1 truncate max-w-[150px]">
                                    {cell === null || cell === undefined ? <span className="text-slate-300">vacío</span> : String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-center">
                <PalletSearch
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  currentIds={searchIds}
                  validIds={masterData.map(p => p.palletId)}
                />
              </div>

              {groups.length > 0 && (
                <Dashboard
                  groups={groups}
                  searchIds={searchIds}
                  totalPallets={grandTotals.pallets}
                  totalBoxes={grandTotals.boxes}
                  totalWeight={grandTotals.weight}
                />
              )}

              <div id="results-section">
                <LoadingPlan
                  groups={groups}
                  notFoundIds={notFoundIds}
                  searchIds={searchIds}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 mt-auto transition-colors print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Gestor de Carga de Pallets. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider />
      <AppContent />
    </ThemeProvider>
  );
}
