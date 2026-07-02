import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { 
  FileText, 
  Settings, 
  Download, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  TrendingUp, 
  DollarSign, 
  User, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Activity,
  FileCheck
} from 'lucide-react';

const Reports = () => {
  const [title, setTitle] = useState("Executive Customer Analytics Report");
  const [companyName, setCompanyName] = useState("Global Retail Corp");
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch report data for preview on mount or when title/company changes
  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getPreview(title, companyName);
      setPreviewData(data);
    } catch (err) {
      console.error("Failed to load report preview", err);
      setError("Unable to load report preview. Make sure backend FastAPI server and database are online.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  const handleRefreshPreview = () => {
    fetchPreview();
  };

  const handleExportPDF = async () => {
    setExporting(true);
    setSuccessMessage(null);
    setError(null);
    try {
      // Build the backend export URL (ReportLab generates the PDF server-side)
      const url = reportService.exportPDFUrl(title, companyName);

      // Fetch the PDF as a binary Blob — responseType:'blob' prevents
      // axios/fetch from trying to parse the binary as text/JSON
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Server error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Verify the server returned an actual PDF
      if (!blob.type.includes('pdf')) {
        throw new Error(`Unexpected content type: ${blob.type}. Expected application/pdf.`);
      }

      // Parse filename from Content-Disposition header if available,
      // otherwise fall back to the known fixed filename.
      const disposition = response.headers.get('content-disposition') || '';
      const filenameMatch = disposition.match(/filename[^;=\n]*=(['"]?)([^'"\n;]+)\1/);
      const filename = (filenameMatch && filenameMatch[2])
        ? filenameMatch[2].trim()
        : 'Executive_Customer_Analytics_Report.pdf';

      // Create an object URL, trigger a hidden anchor click, then clean up
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href     = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);

      setExporting(false);
      setSuccessMessage('Executive PDF Report downloaded successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('PDF download failed', err);
      setError(`PDF download failed: ${err.message || String(err)}`);
      setExporting(false);
    }
  };

  // Helper colors for cluster labels
  const getClusterColor = (cluster) => {
    switch (cluster) {
      case 0: return 'bg-blue-500 text-white';
      case 1: return 'bg-emerald-500 text-white';
      case 2: return 'bg-purple-500 text-white';
      case 3: return 'bg-amber-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  if (loading && !previewData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
            Executive Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Assembling business analytics metrics...</p>
        </div>
        <div className="h-60 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300 flex items-center gap-2.5">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Executive Report Generator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure, preview, and generate dynamic PDF analytics documents for executive stakeholders.
          </p>
        </div>
        <button
          onClick={handleRefreshPreview}
          className="self-start sm:self-center px-4 py-2.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-850 dark:hover:bg-slate-800/60 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Config Form Block (Glassmorphism layout) */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Report Custom Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
            placeholder="e.g. Executive Performance Report"
          />
        </div>

        <div className="md:col-span-4 space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-400"
            placeholder="e.g. Global Retail Corp"
          />
        </div>

        <div className="md:col-span-4">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white rounded-xl py-3.5 text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {exporting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Compiling PDF Report...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export Report to PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications Banners */}
      {successMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-950/30 dark:text-emerald-400 flex items-center gap-3 shadow-2xs animate-fadeIn">
          <FileCheck className="h-5 w-5 text-emerald-500 shrink-0" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-red-650 dark:bg-red-950/20 dark:border-red-950/30 dark:text-red-400 flex items-center gap-3 shadow-2xs animate-fadeIn">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Interactive Report Draft Preview Box */}
      {previewData && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Interactive Report Document Preview
          </h3>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950 shadow-lg min-h-[800px] space-y-8 text-slate-800 dark:text-slate-300 font-sans transition-colors">
            
            {/* Document Cover Header */}
            <div className="border-b border-slate-200 dark:border-slate-850 pb-6 space-y-1">
              <span className="text-2xs font-extrabold text-blue-650 dark:text-blue-400 uppercase tracking-widest block">
                {companyName || "COMPANY NAME"}
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {title || "Report Title"}
              </h2>
              <span className="text-xs text-slate-405 dark:text-slate-500 block">
                Generated Date: {previewData.metadata.date} | Business Intelligence Section
              </span>
            </div>

            {/* Section 1: Executive Summary */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-blue-800 dark:text-blue-400 tracking-wider">
                I. Executive Summary
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {previewData.executive_summary}
              </p>
            </div>

            {/* Section 2: KPIs Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-blue-800 dark:text-blue-400 tracking-wider">
                II. Core Key Performance Indicators (KPIs)
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* KPI 1 */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1 text-center md:text-left">
                  <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Customers</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-slate-150 block">{previewData.kpis.total_customers.toLocaleString()}</span>
                </div>
                {/* KPI 2 */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1 text-center md:text-left">
                  <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Avg Income</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-slate-150 block">${previewData.kpis.average_income.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                {/* KPI 3 */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1 text-center md:text-left">
                  <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Avg Spending</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-slate-150 block">${previewData.kpis.average_spending.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                {/* KPI 4 */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1 text-center md:text-left">
                  <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Campaign Accept</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-slate-150 block">{previewData.kpis.campaign_response_rate}%</span>
                </div>
                {/* KPI 5 */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1 text-center md:text-left col-span-2 md:col-span-1">
                  <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Clusters</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-slate-150 block">{previewData.kpis.cluster_count} ML Groups</span>
                </div>
              </div>
            </div>

            {/* Section 3: Segments Distribution & Revenue Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {/* Left Column: Segments */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-blue-800 dark:text-blue-400 tracking-wider">
                  III. Mapped Customer Segments
                </h4>
                <div className="space-y-3">
                  {previewData.segments_distribution.map((seg) => (
                    <div key={seg.cluster} className="space-y-1.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-850">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-350">{seg.cohort_name}</span>
                        <span className="text-slate-400">{seg.count} ({seg.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getClusterColor(seg.cluster)}`} 
                          style={{ width: `${seg.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Department Revenue */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-blue-800 dark:text-blue-400 tracking-wider">
                  IV. Department Revenue Spending
                </h4>
                
                <div className="space-y-3">
                  {previewData.revenue_analysis.map((dept, index) => (
                    <div key={index} className="space-y-1.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-850">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-350">{dept.category}</span>
                        <span className="text-slate-450">${dept.total_spend.toLocaleString()} ({dept.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-indigo-500" 
                          style={{ width: `${dept.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: AI Recommendations opportunities */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-blue-800 dark:text-blue-400 tracking-wider">
                  V. AI Recommendations & Strategic Value Opportunities
                </h4>
                <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  Est. revenue lift: ${previewData.estimated_revenue_opportunity.toLocaleString()}
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-slate-550 border-b border-slate-200 dark:border-slate-800 font-bold">
                      <th className="p-3 text-left">Strategic Initiative</th>
                      <th className="p-3 text-left">Priority</th>
                      <th className="p-3 text-left">Target Segment</th>
                      <th className="p-3 text-right">Est. Opportunity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.ai_recommendations.map((rec, index) => (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-850 last:border-b-0 hover:bg-slate-50/20 dark:hover:bg-slate-900/20">
                        <td className="p-3">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block">{rec.title}</span>
                          <span className="text-slate-400 block mt-0.5">{rec.recommendation}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase ${
                            rec.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/30 dark:text-red-400' : 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400'
                          }`}>
                            {rec.priority}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{rec.business_impact.split(" (")[0]}</td>
                        <td className="p-3 text-right font-extrabold text-slate-700 dark:text-slate-350">${rec.estimated_revenue_opportunity.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5: Strategic action plan roadmap */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-150 dark:border-slate-850/60">
              {/* Opportunities */}
              <div className="space-y-2">
                <h5 className="text-2xs font-extrabold uppercase text-emerald-600 tracking-wider">Top Growth Opportunities</h5>
                <ul className="space-y-1.5 text-2xs text-slate-600 dark:text-slate-405 list-disc pl-4">
                  {previewData.top_opportunities.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div className="space-y-2">
                <h5 className="text-2xs font-extrabold uppercase text-rose-600 tracking-wider">Identified Risk Safeguards</h5>
                <ul className="space-y-1.5 text-2xs text-slate-600 dark:text-slate-405 list-disc pl-4">
                  {previewData.risks.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <h5 className="text-2xs font-extrabold uppercase text-amber-600 tracking-wider">Growth Suggestions</h5>
                <ul className="space-y-1.5 text-2xs text-slate-600 dark:text-slate-405 list-disc pl-4">
                  {previewData.growth_suggestions.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Retro retrospective / info footer callout */}
      <div className="rounded-3xl border border-blue-100/60 bg-gradient-to-tr from-blue-50/20 to-indigo-50/10 p-6 dark:border-slate-800 dark:bg-slate-900/40 relative overflow-hidden group">
        <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          Corporate Grade Compilation
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          The PDF generation uses standard corporate layout grids with crisp Page Numbers, Section Blocks, and clean Page Break margins. Temporary Matplotlib charts are rendered as vector images in memory, inserted inside the PDF body, and deleted immediately to preserve disk security.
        </p>
      </div>
    </div>
  );
};

export default Reports;
