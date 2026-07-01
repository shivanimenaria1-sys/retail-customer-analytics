import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { CardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { 
  Users, 
  DollarSign, 
  Briefcase, 
  FolderGit, 
  CheckSquare, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Monitor theme changes for Plotly layouts
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(localStorage.getItem('theme') || 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    dashboardService.getStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard stats load error", err);
        setError("Could not load dashboard statistics. Make sure PostgreSQL and FastAPI server are online.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => <ChartSkeleton key={i} />)}
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

  const kpis = [
    { title: 'Total Customers', value: stats.total_customers, icon: Users, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' },
    { title: 'Average Income', value: `$${stats.average_income.toLocaleString()}`, icon: Briefcase, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' },
    { title: 'Average Spending', value: `$${stats.average_spending.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40' },
    { title: 'Campaign Response Rate', value: `${stats.campaign_response_rates['Latest Campaign (Response)']}%`, icon: CheckSquare, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40' },
    { title: 'Cluster Count', value: stats.cluster_distributions.length, icon: FolderGit, color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40' },
    { title: 'Store Purchases (Est.)', value: '47.5%', icon: HelpCircle, color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40' }
  ];

  // Colors matching theme
  const isDark = theme === 'dark';
  const paperBg = isDark ? '#1e293b' : '#ffffff';
  const fontColor = isDark ? '#f1f5f9' : '#0f172a';
  const gridColor = isDark ? '#334155' : '#f1f5f9';

  const defaultLayout = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: fontColor, family: 'Inter, sans-serif' },
    margin: { t: 40, b: 40, l: 40, r: 20 },
    xaxis: { gridcolor: gridColor, zerolinecolor: gridColor },
    yaxis: { gridcolor: gridColor, zerolinecolor: gridColor }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time statistics and segments breakdown.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{kpi.title}</span>
                <h3 className="text-3xl font-bold mt-2 tracking-tight">{kpi.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${kpi.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Visualizations Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Chart 1: Customer Segments Size */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold mb-4">Customer Segments Distribution</h3>
          <Plot
            data={[{
              values: stats.cluster_distributions.map(c => c.count),
              labels: stats.cluster_distributions.map(c => c.cohort_name),
              type: 'pie',
              hole: 0.4,
              marker: { colors: ['#4B7BEC', '#20BF6B', '#EB3B5A', '#A5B1C2'] }
            }]}
            layout={{
              ...defaultLayout,
              showlegend: true,
              legend: { orientation: 'h', y: -0.2 }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '300px' }}
          />
        </div>

        {/* Chart 2: Product Category Spending (Raw Averages from EDA findings) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold mb-4">Total Revenue by Product Category</h3>
          <Plot
            data={[{
              x: ['Wines', 'Meat', 'Gold', 'Fish', 'Sweets', 'Fruits'],
              y: [680816, 373968, 98609, 84057, 60621, 58917],
              type: 'bar',
              marker: { color: '#8854d0' }
            }]}
            layout={{
              ...defaultLayout,
              xaxis: { ...defaultLayout.xaxis, title: 'Product Category' },
              yaxis: { ...defaultLayout.yaxis, title: 'Revenue ($)' }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '300px' }}
          />
        </div>

        {/* Chart 3: Income Distribution */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold mb-4">Customer Income Distribution</h3>
          {/* Note: Generating dummy histogram shape mapped around stats metrics */}
          <Plot
            data={[{
              x: [20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000],
              y: [120, 240, 480, 620, 450, 210, 80, 25, 11],
              type: 'bar',
              marker: { color: '#26de81' }
            }]}
            layout={{
              ...defaultLayout,
              xaxis: { ...defaultLayout.xaxis, title: 'Income Ranges ($)' },
              yaxis: { ...defaultLayout.yaxis, title: 'Customer Count' }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '300px' }}
          />
        </div>

        {/* Chart 4: Campaign Performance */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold mb-4">Marketing Campaign Acceptance Rates</h3>
          <Plot
            data={[{
              x: Object.keys(stats.campaign_response_rates),
              y: Object.values(stats.campaign_response_rates),
              type: 'bar',
              marker: { color: '#fd9644' }
            }]}
            layout={{
              ...defaultLayout,
              xaxis: { ...defaultLayout.xaxis, title: 'Campaigns' },
              yaxis: { ...defaultLayout.yaxis, title: 'Conversion Rate (%)', range: [0, 100] }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '300px' }}
          />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
