import React from 'react';

export const CardSkeleton = () => (
  <div className="animate-pulse rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800 mb-3"></div>
    <div className="h-8 w-32 rounded bg-slate-300 dark:bg-slate-700"></div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="animate-pulse rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 h-80 flex flex-col justify-between">
    <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800 mb-4"></div>
    <div className="flex-1 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800">
    <td className="p-4"><div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800"></div></td>
    <td className="p-4"><div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800"></div></td>
    <td className="p-4"><div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800"></div></td>
    <td className="p-4"><div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800"></div></td>
    <td className="p-4"><div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800"></div></td>
    <td className="p-4"><div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800"></div></td>
  </tr>
);
