import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Target, 
  ShieldAlert, 
  CheckCircle, 
  ArrowRight,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';

const AIInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await dashboardService.getAIRecommendations();
      setData(res);
    } catch (err) {
      console.error("AI recommendations fetch error", err);
      setError("Could not retrieve AI business insights. Verify that the FastAPI backend is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
            AI Business Insights
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Generating dynamic strategic actions from customer metrics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
            AI Business Insights
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time data-driven marketing recommendations.</p>
        </div>
        <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-6 dark:border-rose-950/40 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex gap-4 items-start shadow-sm backdrop-blur-md">
          <ShieldAlert className="h-6 w-6 shrink-0 text-rose-500" />
          <div className="flex-1">
            <h3 className="font-bold text-lg">Failed to Retrieve Recommendations</h3>
            <p className="mt-1 text-sm text-rose-650 dark:text-rose-400/80 leading-relaxed">{error}</p>
            <button 
              onClick={() => fetchRecommendations()}
              className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-rose-250 cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { total_recommendations, high_priority_actions, estimated_revenue_opportunity, recommendations } = data;

  // Category mapper for icons and color theme configurations
  const getCategoryStyles = (category) => {
    switch (category) {
      case 'opportunity':
        return {
          borderClass: 'border-l-4 border-emerald-500 dark:border-emerald-500',
          bgClass: 'bg-emerald-50/30 dark:bg-emerald-950/15',
          textClass: 'text-emerald-600 dark:text-emerald-400',
          iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
          icon: Target,
          label: 'Opportunity'
        };
      case 'warning':
        return {
          borderClass: 'border-l-4 border-amber-500 dark:border-amber-500',
          bgClass: 'bg-amber-50/30 dark:bg-amber-950/15',
          textClass: 'text-amber-600 dark:text-amber-400',
          iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
          icon: AlertTriangle,
          label: 'Warning'
        };
      case 'optimization':
        return {
          borderClass: 'border-l-4 border-blue-500 dark:border-blue-500',
          bgClass: 'bg-blue-50/30 dark:bg-blue-950/15',
          textClass: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
          icon: Zap,
          label: 'Optimization'
        };
      case 'risk':
        return {
          borderClass: 'border-l-4 border-rose-500 dark:border-rose-500',
          bgClass: 'bg-rose-50/30 dark:bg-rose-950/15',
          textClass: 'text-rose-600 dark:text-rose-400',
          iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
          icon: ShieldAlert,
          label: 'Risk'
        };
      default:
        return {
          borderClass: 'border-l-4 border-slate-500 dark:border-slate-500',
          bgClass: 'bg-slate-50/30 dark:bg-slate-950/15',
          textClass: 'text-slate-600 dark:text-slate-400',
          iconBg: 'bg-slate-50 text-slate-600 dark:bg-slate-950/40 dark:text-slate-400',
          icon: Info,
          label: 'General'
        };
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-650 border border-red-100 dark:bg-red-950/35 dark:text-red-400 dark:border-red-900/40';
      case 'Medium':
        return 'bg-amber-50 text-amber-650 border border-amber-100 dark:bg-amber-950/35 dark:text-amber-400 dark:border-amber-900/40';
      default:
        return 'bg-slate-50 text-slate-650 border border-slate-100 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800/40';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300 flex items-center gap-2.5">
            <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            AI Business Insights
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time, dynamically generated revenue-driving campaign suggestions from backend analytics.
          </p>
        </div>
        <button
          onClick={() => fetchRecommendations(true)}
          disabled={refreshing}
          className="self-start sm:self-center px-4 py-2.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-850 dark:hover:bg-slate-800/60 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
          <span>{refreshing ? 'Analyzing...' : 'Refresh Insights'}</span>
        </button>
      </div>

      {/* KPI Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Total Recommendations */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="h-24 w-24 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-blue-500 to-indigo-500 text-white rounded-2xl shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Recommendations</p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {total_recommendations}
              </h3>
            </div>
          </div>
        </div>

        {/* KPI 2: High Priority Actions */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300">
            <ShieldAlert className="h-24 w-24 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-rose-500 to-orange-500 text-white rounded-2xl shadow-sm">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">High Priority Actions</p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {high_priority_actions}
              </h3>
            </div>
          </div>
        </div>

        {/* KPI 3: Estimated Revenue Opportunity */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300">
            <DollarSign className="h-24 w-24 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-2xl shadow-sm">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Est. Revenue Opportunity</p>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                ${estimated_revenue_opportunity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main List of Insight Cards */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Actions for Strategic Growth
        </h2>
        {recommendations.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
            <Info className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Action Items Found</h3>
            <p className="text-slate-500 dark:text-slate-450 mt-1 max-w-sm mx-auto text-sm">
              Upload customer data or ensure the database has records to compute recommendations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {recommendations.map((rec) => {
              const styles = getCategoryStyles(rec.category);
              const Icon = styles.icon;
              return (
                <div
                  key={rec.id}
                  className={`rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 flex flex-col md:flex-row gap-5 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-300 hover:-translate-y-1 ${styles.borderClass}`}
                >
                  {/* Category Indicator Icon */}
                  <div className={`p-4 ${styles.iconBg} rounded-2xl shrink-0 self-start md:self-center flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Recommendations Fields Details */}
                  <div className="flex-1 space-y-3.5">
                    {/* Header: Title and Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                      <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-105 leading-snug">
                        {rec.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-2xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${styles.bgClass} ${styles.textClass}`}>
                          {styles.label}
                        </span>
                        <span className={`text-2xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getPriorityStyles(rec.priority)}`}>
                          {rec.priority} Priority
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-2xl border border-slate-100/50 dark:border-slate-850/40 leading-relaxed">
                        {rec.recommendation}
                      </p>
                    </div>

                    {/* Footer Row: Business Impact & Expected Outcome */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5 border-t border-slate-100 dark:border-slate-850/60">
                      {/* Business Impact Column */}
                      <div className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Business Impact</span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 mt-0.5 block leading-normal">
                            {rec.business_impact}
                          </span>
                        </div>
                      </div>

                      {/* Expected Outcome Column */}
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Expected Outcome</span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 mt-0.5 block leading-normal">
                            {rec.expected_outcome}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Retro retrospective / Action Plan Callout */}
      <div className="rounded-3xl border border-blue-100/60 bg-gradient-to-tr from-blue-50/20 to-indigo-50/10 p-6 dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 transform translate-x-4 -translate-y-4">
          <ArrowRight className="h-20 w-20 text-blue-600 dark:text-blue-455" />
        </div>
        <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          Interactive Campaign Deployments
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 max-w-3xl">
          These insights are directly connected to our database segments. You can view customers falling under these recommendations directly in the <a href="/customers" className="text-blue-600 dark:text-blue-450 hover:underline font-bold">Customer Explorer</a>, or create customized cohorts to trigger direct webhooks to mail providers.
        </p>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-500 hover:underline cursor-pointer group-hover:gap-2.5 transition-all">
          <span>Integrate Marketing Webhooks & API Integration</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
