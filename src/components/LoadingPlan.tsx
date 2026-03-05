import React, { useState } from 'react';
import { ContainerGroup, PalletData } from '../types';
import { motion } from 'motion/react';
import { Package, Truck, FileText, Download, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import XLSX from 'xlsx-js-style';

interface LoadingPlanProps {
  groups: ContainerGroup[];
  notFoundIds: string[];
  searchIds: string[];
}

export const LoadingPlan: React.FC<LoadingPlanProps> = ({ groups, notFoundIds, searchIds }) => {
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(
    new Set(groups.map(g => g.containerId))
  );

  const toggleContainer = (containerId: string) => {
    setExpandedContainers(prev => {
      const next = new Set(prev);
      if (next.has(containerId)) {
        next.delete(containerId);
      } else {
        next.add(containerId);
      }
      return next;
    });
  };
  
  // Calculate grand totals for SEARCHED items only
  const grandTotals = groups.reduce(
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

  // Extract unique COTE numbers for SEARCHED items
  const uniqueCotes = Array.from(new Set(
    groups.flatMap(group => 
      group.pallets
        .filter(p => searchIds.includes(p.palletId))
        .map(p => {
          // Look for "COTE Pxxxxx" pattern
          const match = p.description.match(/COTE\s+(P\d+)/i);
          return match ? match[1] : null;
        })
        .filter((c): c is string => c !== null)
    )
  )).sort();

  const handleExportExcel = () => {
    // Flatten data for export
    const exportData: any[] = [];
    const rowStyles: { [rowIndex: number]: { fill?: { fgColor: { rgb: string } } } } = {};
    
    // Title
    exportData.push(['PLANILLA DE CARGA']);
    exportData.push([]); // Empty row

    // Headers
    exportData.push(['Contenedor', 'Cant.', 'Bultos', 'Peso', 'Descripción', '', 'Pallet ID']);
    
    let currentRow = 3; // 0-indexed, starting after headers (row 4 in Excel)

    groups.forEach(group => {
      group.pallets.forEach(pallet => {
        const isMatch = searchIds.includes(pallet.palletId);
        
        exportData.push([
          pallet.containerId,
          pallet.quantity,
          pallet.boxes,
          pallet.weight,
          pallet.description,
          '', // Empty column F
          pallet.palletId,
        ]);

        if (isMatch) {
          // Apply highlighting if needed (Only for Pallet ID column - index 6)
          if (!rowStyles[currentRow]) rowStyles[currentRow] = {};
          rowStyles[currentRow].fill = { fgColor: { rgb: "FFFF00" } }; // Yellow background
        }
        currentRow++;
      });
      // Add an empty row between containers
      exportData.push([]);
      currentRow++;
    });

    // Add Grand Totals Section at the end
    exportData.push([]);
    currentRow++;
    
    exportData.push(['', '', '', '', 'RESUMEN TOTAL (SOLO BUSCADOS)']);
    currentRow++;
    
    exportData.push(['', '', '', '', 'TOTAL PALLETS', 'CAJAS', 'KG']);
    currentRow++;
    
    exportData.push([
      '', 
      '', 
      '', 
      '', 
      grandTotals.pallets, 
      grandTotals.boxes, 
      grandTotals.weight
    ]);
    currentRow++;

    // Add COTES Section
    if (uniqueCotes.length > 0) {
      exportData.push([]);
      currentRow++;
      exportData.push(['', '', '', '', 'COTES DE INGRESO (UNICOS)']);
      currentRow++;
      
      uniqueCotes.forEach(cote => {
        exportData.push(['', '', '', '', cote]);
        currentRow++;
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    // Define styles
    const borderStyle = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    };

    const headerStyle = {
      font: { bold: true },
      alignment: { horizontal: "center" },
      border: borderStyle,
      fill: { fgColor: { rgb: "E0E0E0" } }
    };

    // Apply styles to cells
    const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        // Default cell style
        let cellStyle: any = {
          border: borderStyle,
          alignment: { vertical: "center" }
        };

        // Title style (Row 0)
        if (R === 0) {
          cellStyle = {
            font: { bold: true, sz: 14 },
            alignment: { horizontal: "center" }
          };
        }
        // Header style (Row 2)
        else if (R === 2) {
          cellStyle = headerStyle;
        }
        // Data rows
        else {
          // Apply highlighting if needed (Only for Pallet ID column - index 6)
          if (rowStyles[R] && rowStyles[R].fill && C === 6) {
            cellStyle.fill = rowStyles[R].fill;
          }
        }

        ws[cellAddress].s = cellStyle;
      }
    }

    // Adjust column widths
    const wscols = [
      { wch: 20 }, // A: Contenedor
      { wch: 8 },  // B: Cant
      { wch: 8 },  // C: Bultos
      { wch: 12 }, // D: Peso
      { wch: 40 }, // E: Descripcion
      { wch: 2 },  // F: Spacer
      { wch: 15 }, // G: Pallet ID
    ];
    ws['!cols'] = wscols;

    // Merge title cells
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } } // Merge title across 7 columns
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plan de Carga");
    XLSX.writeFile(wb, "plan_de_carga.xlsx");
  };

  const handlePrint = () => {
    window.print();
  };

  if (groups.length === 0 && notFoundIds.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto space-y-8 pb-20"
    >
      {/* Grand Totals Card */}
      <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-lg print:border print:border-slate-300 print:bg-white print:text-black">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4 opacity-90 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Resumen de Orden de Embarque (Solo Buscados)
            </h3>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-indigo-200 text-sm font-medium uppercase tracking-wider print:text-slate-500">Total Pallets</div>
                <div className="text-4xl font-bold mt-1">{grandTotals.pallets}</div>
              </div>
              <div>
                <div className="text-indigo-200 text-sm font-medium uppercase tracking-wider print:text-slate-500">Total Bultos</div>
                <div className="text-4xl font-bold mt-1">{grandTotals.boxes}</div>
              </div>
              <div>
                <div className="text-indigo-200 text-sm font-medium uppercase tracking-wider print:text-slate-500">Total Peso</div>
                <div className="text-4xl font-bold mt-1">{grandTotals.weight.toLocaleString()} kg</div>
              </div>
            </div>
          </div>

          {uniqueCotes.length > 0 && (
            <div className="md:border-l md:border-indigo-700 md:pl-8 print:border-l print:border-slate-300">
              <h3 className="text-lg font-semibold mb-4 opacity-90">Cotes de Ingreso</h3>
              <div className="flex flex-wrap gap-2">
                {uniqueCotes.map(cote => (
                  <span key={cote} className="bg-indigo-800 px-3 py-1 rounded-full text-sm font-mono border border-indigo-600 print:bg-slate-100 print:text-black print:border-slate-300">
                    {cote}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-2xl font-bold text-slate-900">Planilla de Carga Generada</h2>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </button>
        </div>
      </div>

      {notFoundIds.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 print:border-red-200">
          <h3 className="text-red-800 font-semibold mb-2 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Pallets No Encontrados ({notFoundIds.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {notFoundIds.map((id) => (
              <span key={id} className="bg-white text-red-600 px-2 py-1 rounded border border-red-100 text-sm font-mono">
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-8 print:block print:gap-0">
        {groups.map((group) => {
          const isExpanded = expandedContainers.has(group.containerId);
          return (
            <div key={group.containerId} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print:shadow-none print:border-0 print:mb-8 print:break-inside-avoid">
              <div
                className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-100 dark:border-slate-600 flex justify-between items-center print:bg-slate-100 print:border-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors print:cursor-default"
                onClick={() => toggleContainer(group.containerId)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg print:hidden">
                    <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{group.containerId}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 print:hidden">Contenedor</p>
                  </div>
                  <button className="ml-2 print:hidden">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <span className="block text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">Pallets</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{group.pallets.length}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold">Peso Total</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{group.totalWeight.toLocaleString()} kg</span>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 bg-white">
                    <th className="px-6 py-3 font-medium w-32">Pallet ID</th>
                    <th className="px-6 py-3 font-medium">Descripción</th>
                    <th className="px-6 py-3 font-medium text-right w-24">Bultos</th>
                    <th className="px-6 py-3 font-medium text-right w-24">Cant.</th>
                    <th className="px-6 py-3 font-medium text-right w-24">Peso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {group.pallets.map((pallet) => {
                    const isMatch = searchIds.includes(pallet.palletId);
                    return (
                      <tr 
                        key={pallet.palletId} 
                        className={`transition-colors ${
                          isMatch 
                            ? 'bg-yellow-50 hover:bg-yellow-100 print:bg-slate-200' 
                            : 'hover:bg-slate-50 opacity-60 hover:opacity-100 print:opacity-100'
                        }`}
                      >
                        <td className="px-6 py-3 font-mono font-medium text-indigo-600 print:text-black relative">
                          {isMatch && (
                            <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-500 rounded-r print:bg-black"></span>
                          )}
                          {pallet.palletId}
                        </td>
                        <td className="px-6 py-3 text-slate-700 print:text-black">
                          {pallet.description}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-600 print:text-black">
                          {pallet.boxes}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-600 print:text-black">
                          {pallet.quantity}
                        </td>
                        <td className="px-6 py-3 text-right font-mono text-slate-600 print:text-black">
                          {pallet.weight}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 font-semibold text-slate-900 print:bg-white print:border-t-2 print:border-slate-300">
                  <tr>
                    <td className="px-6 py-3 text-right" colSpan={2}>Total Contenedor</td>
                    <td className="px-6 py-3 text-right">{group.totalBoxes}</td>
                    <td className="px-6 py-3 text-right">{group.totalQuantity}</td>
                    <td className="px-6 py-3 text-right">{group.totalWeight.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
