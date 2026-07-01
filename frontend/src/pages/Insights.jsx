import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Lightbulb, TrendingUp, CheckSquare, Target, AlertCircle } from 'lucide-react';

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardService.getInsights()
      .then(data => {
        setInsights(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Insights fetch error", err);
        setError("Could not retrieve business insights. Check your server connections.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Business Insights</h1>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 dark:border-red-950/40 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex gap-3 items-start">
        <AlertCircle className="h-6 w-6 shrink-0" />
        <div>
          <h3 className="font-bold text-lg">Incomplete Connection</h3>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const icons = [Target, TrendingUp, CheckSquare, Lightbulb, Lightbulb];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Insights</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Data-driven marketing recommendations and revenue analyses.</p>
      </div>

      {/* Insights Cards List */}
      <div className="space-y-6">
        {insights.map((ins, index) => {
          const Icon = icons[index % icons.length];
          return (
            <div 
              key={ins.title} 
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex gap-5 items-start"
            >
              <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-2xl shrink-0">
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{ins.title}</h3>
                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {ins.metric}
                </span>
                <p className="text-sm text-slate-650 dark:text-slate-405 leading-relaxed pt-1">
                  {ins.insight}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Performance Box */}
      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/60">
        <h3 className="text-lg font-bold mb-2">Campaign Performance Audit</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Based on historical conversion rates, **Campaign 2** was a significant outlier with less than 2% acceptance. We recommend auditing the channel mix, copy, and price incentives used in Campaign 2 to avoid replicating these weaknesses in future campaigns.
        </p>
        <span className="text-xs font-bold text-blue-600 dark:text-blue-500 hover:underline cursor-pointer">
          Read full marketing retrospective report &rarr;
        </span>
      </div>

    </div>
  );
};

export default Insights;
