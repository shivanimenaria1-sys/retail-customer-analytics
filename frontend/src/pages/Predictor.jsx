import React, { useState, useEffect } from 'react';
import { customerService, dashboardService } from '../services/api';
import { CardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { 
  Brain, 
  HelpCircle, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  User, 
  Calendar, 
  CheckCircle, 
  HelpCircle as InfoIcon,
  ShoppingBag,
  CreditCard,
  Target,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

const PRESET_TEMPLATES = [
  {
    name: "High-Value VIP",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-50/50 dark:bg-emerald-950/10",
    border: "border-emerald-100 dark:border-emerald-900/35",
    text: "text-emerald-600 dark:text-emerald-400",
    desc: "Younger professionals, very high income and spending.",
    values: {
      Income: 76000,
      Age: 40,
      Total_Spending: 1492,
      Total_Purchases: 22,
      Average_Spending_Per_Purchase: 68.0,
      Customer_Tenure: 400
    }
  },
  {
    name: "Mature Value Shopper",
    icon: Target,
    color: "from-blue-500 to-indigo-500",
    bgLight: "bg-blue-50/50 dark:bg-blue-950/10",
    border: "border-blue-100 dark:border-blue-900/35",
    text: "text-blue-600 dark:text-blue-400",
    desc: "Mature demographic with solid income and spending.",
    values: {
      Income: 65000,
      Age: 54,
      Total_Spending: 868,
      Total_Purchases: 18,
      Average_Spending_Per_Purchase: 48.0,
      Customer_Tenure: 350
    }
  },
  {
    name: "Frugal Loyalist",
    icon: ShoppingBag,
    color: "from-purple-500 to-pink-500",
    bgLight: "bg-purple-50/50 dark:bg-purple-950/10",
    border: "border-purple-100 dark:border-purple-900/35",
    text: "text-purple-600 dark:text-purple-400",
    desc: "Long tenure, lower income, highly responsive to discounts.",
    values: {
      Income: 33800,
      Age: 48,
      Total_Spending: 350,
      Total_Purchases: 12,
      Average_Spending_Per_Purchase: 29.0,
      Customer_Tenure: 526
    }
  },
  {
    name: "Unengaged Starter",
    icon: RefreshCw,
    color: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50/50 dark:bg-amber-950/10",
    border: "border-amber-100 dark:border-amber-900/35",
    text: "text-amber-600 dark:text-amber-400",
    desc: "Newer signups with low spending and engagement.",
    values: {
      Income: 37900,
      Age: 30,
      Total_Spending: 108,
      Total_Purchases: 4,
      Average_Spending_Per_Purchase: 27.0,
      Customer_Tenure: 173
    }
  }
];

const Predictor = () => {
  const [formData, setFormData] = useState({
    Income: 55000,
    Age: 42,
    Total_Spending: 600,
    Total_Purchases: 12,
    Average_Spending_Per_Purchase: 50.0,
    Customer_Tenure: 300
  });

  const [loading, setLoading] = useState(false);
  const [plotLoading, setPlotLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // MutationObserver to track theme modifications
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(localStorage.getItem('theme') || 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Fetch baseline dataset customers for PCA plotting context on mount
  useEffect(() => {
    setPlotLoading(true);
    customerService.getCustomers({ limit: 400 })
      .then(res => {
        setCustomers(res);
        setPlotLoading(false);
      })
      .catch(err => {
        console.error("Baseline PCA load failed", err);
        setPlotLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }));
  };

  const handleApplyPreset = (preset) => {
    setFormData(preset.values);
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.predictSegmentDetails(formData);
      setPrediction(response);
    } catch (err) {
      console.error("Predict endpoint error", err);
      setError("Failed to generate prediction. Make sure FastAPI server and model files are online.");
    } finally {
      setLoading(false);
    }
  };

  // Styles configuration per predicted cluster
  const getClusterStyles = (cluster) => {
    switch (cluster) {
      case 0:
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
          gradient: 'from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300',
          colorCode: '#4B7BEC',
          badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30'
        };
      case 1:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
          gradient: 'from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-350',
          colorCode: '#20BF6B',
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
        };
      case 2:
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400',
          gradient: 'from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300',
          colorCode: '#EB3B5A',
          badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30'
        };
      case 3:
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
          gradient: 'from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-300',
          colorCode: '#A5B1C2',
          badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400',
          gradient: 'from-slate-600 to-slate-500',
          colorCode: '#64748b',
          badge: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        };
    }
  };

  const isDark = theme === 'dark';
  const fontColor = isDark ? '#f1f5f9' : '#0f172a';
  const gridColor = isDark ? '#334155' : '#f1f5f9';

  const defaultLayout = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: fontColor, family: 'Inter, sans-serif' },
    margin: { t: 40, b: 40, l: 45, r: 25 },
    xaxis: { gridcolor: gridColor, zerolinecolor: gridColor },
    yaxis: { gridcolor: gridColor, zerolinecolor: gridColor }
  };

  // Compile PCA visual structures
  const pcaColors = ['#4B7BEC', '#20BF6B', '#EB3B5A', '#A5B1C2'];
  const baselineTraces = [0, 1, 2, 3].map(clusterId => {
    const clusterPoints = customers.filter(c => c.segment?.cluster === clusterId);
    return {
      x: clusterPoints.map(p => p.segment?.pc1),
      y: clusterPoints.map(p => p.segment?.pc2),
      mode: 'markers',
      type: 'scatter',
      name: `Cluster ${clusterId + 1}`,
      marker: { 
        size: 5, 
        color: pcaColors[clusterId], 
        opacity: 0.35 
      }
    };
  });

  // Inject predicted customer point as a pulsing neon target marker
  if (prediction) {
    baselineTraces.push({
      x: [prediction.pc1],
      y: [prediction.pc2],
      mode: 'markers',
      type: 'scatter',
      name: 'Simulated Target',
      marker: {
        size: 16,
        color: '#ff3f34',
        symbol: 'star',
        line: {
          color: isDark ? '#ffffff' : '#000000',
          width: 2
        }
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300 flex items-center gap-2.5">
          <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          AI Customer Segment Predictor
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Predict segment classification, confidence, and target strategies for prospects in real-time.
        </p>
      </div>

      {/* Preset Templates Row */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          Simulation Preset Templates
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_TEMPLATES.map((preset, index) => {
            const Icon = preset.icon;
            return (
              <button
                key={index}
                onClick={() => handleApplyPreset(preset)}
                className={`p-4 rounded-2xl border text-left bg-white dark:bg-slate-900 transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer group flex flex-col justify-between h-36 ${preset.border} hover:border-slate-350 dark:hover:border-slate-700`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-205 text-sm">{preset.name}</span>
                    <div className={`p-1.5 rounded-lg ${preset.bgLight} ${preset.text}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-2xs text-slate-450 dark:text-slate-500 leading-relaxed">
                    {preset.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-2xs font-extrabold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all mt-3">
                  <span>Load Template</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Input Section */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-850 dark:text-slate-200">Customer Metrics Form</h2>
            <p className="text-2xs text-slate-400 mt-0.5">Input demographic and spending behaviors of the target customer.</p>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Income Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                  Annual Income ($)
                </label>
                <input
                  type="number"
                  name="Income"
                  value={formData.Income}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                />
              </div>

              {/* Age Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Age (Years)
                </label>
                <input
                  type="number"
                  name="Age"
                  value={formData.Age}
                  onChange={handleInputChange}
                  required
                  min="18"
                  max="100"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Spending Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                  Total Spending ($)
                </label>
                <input
                  type="number"
                  name="Total_Spending"
                  value={formData.Total_Spending}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                />
              </div>

              {/* Purchases Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                  Total Purchases
                </label>
                <input
                  type="number"
                  name="Total_Purchases"
                  value={formData.Total_Purchases}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Average Spend Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                  Avg Spend / Purchase ($)
                </label>
                <input
                  type="number"
                  name="Average_Spending_Per_Purchase"
                  value={formData.Average_Spending_Per_Purchase}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                />
              </div>

              {/* Tenure Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Tenure (Days)
                </label>
                <input
                  type="number"
                  name="Customer_Tenure"
                  value={formData.Customer_Tenure}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-3.5 text-red-655 dark:bg-red-950/20 dark:text-red-400 text-xs flex gap-2 border border-red-100/50 dark:border-red-950/30">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3.5 text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Computing Prediction...</span>
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  <span>Calculate Segment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results and Visualizations Section */}
        <div className="lg:col-span-7 space-y-6">
          {prediction ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Cohort Name glowing header */}
              <div className={`p-6 rounded-3xl border ${getClusterStyles(prediction.cluster).bg} flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm`}>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">AI Forecast Results</span>
                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    {prediction.cohort_name}
                  </h2>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`text-2xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${getClusterStyles(prediction.cluster).badge}`}>
                    Cluster {prediction.cluster + 1}
                  </span>
                  <span className={`text-2xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    prediction.value_category === 'High' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    prediction.value_category === 'Medium' ? 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400' :
                    'bg-slate-50 text-slate-700 border border-slate-100 dark:bg-slate-800 dark:text-slate-350'
                  }`}>
                    {prediction.value_category} Value
                  </span>
                </div>
              </div>

              {/* KPI metrics board */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Confidence KPI */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-850 dark:bg-slate-900 shadow-2xs">
                  <span className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Confidence</span>
                  <p className="text-xl font-extrabold text-slate-805 dark:text-slate-150 mt-1">{(prediction.confidence * 100).toFixed(2)}%</p>
                </div>

                {/* Distance KPI */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-850 dark:bg-slate-900 shadow-2xs">
                  <span className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Centroid Dist</span>
                  <p className="text-xl font-extrabold text-slate-805 dark:text-slate-150 mt-1">{prediction.distance.toFixed(4)}</p>
                </div>

                {/* PC1 Coordinate */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-850 dark:bg-slate-900 shadow-2xs">
                  <span className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">PC1 Value</span>
                  <p className="text-xl font-extrabold text-slate-805 dark:text-slate-150 mt-1">{prediction.pc1.toFixed(4)}</p>
                </div>

                {/* PC2 Coordinate */}
                <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-850 dark:bg-slate-900 shadow-2xs">
                  <span className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">PC2 Value</span>
                  <p className="text-xl font-extrabold text-slate-805 dark:text-slate-150 mt-1">{prediction.pc2.toFixed(4)}</p>
                </div>
              </div>

              {/* Character Details & Strategies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Profile Card */}
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Business Characteristics</span>
                  <p className="text-xs text-slate-605 dark:text-slate-400 leading-relaxed">
                    {prediction.business_description}
                  </p>
                </div>

                {/* Strategies Action items checklist */}
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Strategic Next Steps</span>
                  <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-400">
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index} className="flex gap-2 items-start leading-normal">
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* PCA visual coordinate chart overlay */}
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900">
                <div className="mb-2">
                  <h3 className="text-md font-bold">2D PCA Cluster Map Position</h3>
                  <p className="text-2xs text-slate-400 mt-0.5">Where this simulated user maps relative to database customers.</p>
                </div>
                {plotLoading ? (
                  <ChartSkeleton />
                ) : (
                  <Plot
                    data={baselineTraces}
                    layout={{
                      ...defaultLayout,
                      showlegend: true,
                      legend: { orientation: 'h', y: -0.2 }
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '340px' }}
                  />
                )}
              </div>

            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 h-[600px] flex flex-col justify-center items-center">
              <Brain className="h-16 w-16 text-slate-300 dark:text-slate-700 animate-pulse mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-350">Run Customer Simulation</h3>
              <p className="text-slate-500 dark:text-slate-450 mt-1 max-w-sm text-xs leading-relaxed">
                Enter demographic and behavior data in the form, or select a template preset above, then click calculate to forecast customer placement.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Predictor;
