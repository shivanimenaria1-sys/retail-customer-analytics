import React, { useState, useEffect } from 'react';
import { dashboardService, customerService } from '../services/api';
import { CardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { AlertCircle } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

const Segments = () => {
  const [clusters, setClusters] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(localStorage.getItem('theme') || 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setLoading(true);
    // Fetch cluster profiles and customer coordinates concurrently
    Promise.all([
      dashboardService.getClusters(),
      customerService.getCustomers({ limit: 500 }) // Load 500 samples for PCA scatter
    ])
      .then(([clusterData, customerData]) => {
        setClusters(clusterData);
        setCustomers(customerData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Segments data load error", err);
        setError("Could not load segment analysis. Please verify backend connections.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Customer Segments</h1>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
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

  const isDark = theme === 'dark';
  const fontColor = isDark ? '#f1f5f9' : '#0f172a';
  const gridColor = isDark ? '#334155' : '#f1f5f9';

  const defaultLayout = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: fontColor, family: 'Inter, sans-serif' },
    margin: { t: 45, b: 40, l: 45, r: 25 },
    xaxis: { gridcolor: gridColor, zerolinecolor: gridColor },
    yaxis: { gridcolor: gridColor, zerolinecolor: gridColor }
  };

  // 1. Group PCA Coordinates by Cluster
  const pcaColors = ['#4B7BEC', '#20BF6B', '#EB3B5A', '#A5B1C2'];
  const pcaTraces = clusters.map(c => {
    const clusterPoints = customers.filter(cust => cust.segment?.cluster === c.cluster);
    return {
      x: clusterPoints.map(p => p.segment?.pc1),
      y: clusterPoints.map(p => p.segment?.pc2),
      mode: 'markers',
      type: 'scatter',
      name: c.cohort_name.split(' (')[0], // Short name
      marker: { size: 6, color: pcaColors[c.cluster], opacity: 0.7 }
    };
  });

  // 2. Build Radar Chart (Normalized Metrics)
  const metrics = [
    { key: 'average_income', label: 'Average Income' },
    { key: 'average_spending', label: 'Average Spend' },
    { key: 'average_purchases', label: 'Average Purchases' },
    { key: 'average_age', label: 'Average Age' }
  ];

  // Calculate maximum values for client-side scaling
  const maxValues = {};
  metrics.forEach(m => {
    maxValues[m.key] = Math.max(...clusters.map(c => c[m.key])) || 1.0;
  });

  const radarTraces = clusters.map(c => {
    // Scaling metrics to 0-100% relative to maximum values
    const scaledValues = metrics.map(m => {
      return (c[m.key] / maxValues[m.key]) * 100;
    });

    // Close polar loop
    const rValues = [...scaledValues, scaledValues[0]];
    const thetaValues = [...metrics.map(m => m.label), metrics[0].label];

    return {
      type: 'scatterpolar',
      r: rValues,
      theta: thetaValues,
      fill: 'toself',
      name: c.cohort_name.split(' (')[0],
      line: { color: pcaColors[c.cluster] }
    };
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Segments</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Profile overview and multidimensional clustering charts.</p>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* PCA Projection */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold mb-1">PCA 2D Cluster Visualisation</h3>
          <p className="text-xs text-slate-400 mb-4">Principal component projections capturing variance in customer behavior.</p>
          <Plot
            data={pcaTraces}
            layout={{
              ...defaultLayout,
              xaxis: { ...defaultLayout.xaxis, title: 'Principal Component 1' },
              yaxis: { ...defaultLayout.yaxis, title: 'Principal Component 2' },
              showlegend: true,
              legend: { orientation: 'h', y: -0.25 }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '340px' }}
          />
        </div>

        {/* Radar Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold mb-1">Cohort Attribute Comparison</h3>
          <p className="text-xs text-slate-400 mb-4">Standardized Comparison of average metrics across segments (0-100% scale).</p>
          <Plot
            data={radarTraces}
            layout={{
              ...defaultLayout,
              polar: {
                radialaxis: { visible: true, range: [0, 110], gridcolor: gridColor },
                angularaxis: { gridcolor: gridColor }
              },
              showlegend: true,
              legend: { orientation: 'h', y: -0.25 }
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '340px' }}
          />
        </div>

      </div>

      {/* Segment Cluster Cards */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold border-b border-slate-100 dark:border-slate-800 pb-2">Cluster Profiles</h3>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {clusters.map((c) => (
            <div 
              key={c.cluster} 
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{c.cohort_name}</h4>
                  <span className="text-xs text-slate-400">Assigned Cluster Label: {c.cluster}</span>
                </div>
                <span className={`inline-flex items-center rounded-xl px-3 py-1 text-sm font-bold ${
                  c.cluster === 0 ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                  c.cluster === 1 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                  c.cluster === 2 ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350'
                }`}>
                  {c.customer_count} Customers
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl">
                  <span className="text-xs text-slate-400">Avg Income</span>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">${c.average_income.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl">
                  <span className="text-xs text-slate-400">Avg Spending</span>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">${c.average_spending.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl">
                  <span className="text-xs text-slate-400">Avg Purchases</span>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{c.average_purchases} transactions</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl">
                  <span className="text-xs text-slate-400">Campaign Response</span>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{c.campaign_response_rate}%</p>
                </div>
              </div>

              {/* Characteristics */}
              <div className="space-y-1.5 text-sm">
                <span className="font-bold text-slate-500 dark:text-slate-450 uppercase text-[10px] tracking-wider">Business Characteristics</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{c.business_characteristics}</p>
              </div>

              {/* Recommendations */}
              <div className="space-y-2 text-sm pt-2">
                <span className="font-bold text-slate-500 dark:text-slate-450 uppercase text-[10px] tracking-wider block">Strategic Recommendations</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                  {c.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Segments;
