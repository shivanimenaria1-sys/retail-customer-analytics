import React, { useState, useCallback } from 'react';
import { uploadService } from '../services/api';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

const UploadDataset = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.csv')) {
      setError("Invalid file format. Please upload a .csv file.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    uploadService.uploadCSV(file, (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setProgress(percentCompleted);
    })
      .then(data => {
        setResult(data);
        setUploading(false);
      })
      .catch(err => {
        console.error("Upload failed", err);
        setError("Database CSV upload failed. Check backend connections or CSV columns layout.");
        setUploading(false);
      });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Dataset</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Upload the customer CSV data sheet to refresh database clustering and segments.</p>
      </div>

      {/* Upload Box */}
      <div 
        onDragEnter={handleDrag} 
        onDragOver={handleDrag} 
        onDragLeave={handleDrag} 
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all bg-white dark:bg-slate-900 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50/20 dark:border-blue-400 dark:bg-blue-950/20' 
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        <input
          type="file"
          id="csv-file-upload"
          className="hidden"
          accept=".csv"
          onChange={handleChange}
          disabled={uploading}
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 mb-4">
          <Upload className="h-8 w-8" />
        </div>

        {file ? (
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {file.name}
            </p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              Drag and drop your customer CSV file here
            </p>
            <p className="text-sm text-slate-400">or click to browse local files</p>
          </div>
        )}

        <label 
          htmlFor="csv-file-upload" 
          className={`mt-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
            uploading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          Select File
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 dark:border-red-950/40 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Upload Controls / Progress */}
      {file && !result && !error && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          {uploading ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  Uploading and processing data...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleUpload}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors cursor-pointer text-sm shadow-md shadow-blue-500/10"
            >
              Start Ingestion Pipeline
            </button>
          )}
        </div>
      )}

      {/* Ingestion Results */}
      {result && (
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-950/40 dark:bg-slate-900 space-y-6">
          <div className="flex gap-3 items-start text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6 shrink-0" />
            <div>
              <h3 className="font-bold text-lg">Ingestion Pipeline Completed Successfully!</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Database records have been refactored and re-clustered.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 uppercase">Records Processed</span>
              <h4 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{result.total_records_processed}</h4>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 uppercase">Rows Imported</span>
              <h4 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{result.rows_imported}</h4>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 uppercase">VIP Cohort Size</span>
              <h4 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{result.clusters_distribution['1'] || 0}</h4>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 uppercase">Pipeline Status</span>
              <h4 className="text-lg font-bold mt-1.5 text-emerald-600 dark:text-emerald-400 capitalize">{result.status}</h4>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UploadDataset;
