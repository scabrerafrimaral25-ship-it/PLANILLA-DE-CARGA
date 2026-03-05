import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ContainerGroup } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, Package, Scale } from 'lucide-react';

interface DashboardProps {
  groups: ContainerGroup[];
  searchIds: string[];
  totalPallets: number;
  totalBoxes: number;
  totalWeight: number;
}

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface DashboardProps {
  groups: ContainerGroup[];
  searchIds: string[];
  totalPallets: number;
  totalBoxes: number;
  totalWeight: number;
  masterDataLength?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  groups,
  searchIds,
  totalPallets,
  totalBoxes,
  totalWeight,
  masterDataLength = 0,
}) => {
  const containerData = groups.map((group, index) => ({
    name: group.containerId.substring(0, 12) + '...',
    pallets: group.pallets.length,
    weight: group.totalWeight,
    boxes: group.totalBoxes,
    color: COLORS[index % COLORS.length],
  }));

  const pieData = groups.map((group, index) => ({
    name: group.containerId.substring(0, 12) + '...',
    value: group.totalWeight,
    color: COLORS[index % COLORS.length],
  }));

  const scannedCount = searchIds.length;
  const progressPercentage = masterDataLength > 0 ? Math.round((scannedCount / masterDataLength) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-900 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-80">Progreso</span>
          </div>
          <div className="text-4xl font-bold mb-1">{progressPercentage}%</div>
          <div className="text-sm opacity-80">{scannedCount} de {masterDataLength} pallets</div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 dark:from-green-600 dark:to-green-900 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-80">Total Bultos</span>
          </div>
          <div className="text-4xl font-bold mb-1">{totalBoxes.toLocaleString()}</div>
          <div className="text-sm opacity-80">Cajas totales</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-700 dark:from-orange-600 dark:to-orange-900 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Scale className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-80">Peso Total</span>
          </div>
          <div className="text-4xl font-bold mb-1">{totalWeight.toLocaleString()}</div>
          <div className="text-sm opacity-80">Kilogramos</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Pallets por Contenedor
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={containerData}>
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="pallets" radius={[8, 8, 0, 0]}>
                {containerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-orange-600" />
            Distribución de Peso
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};
