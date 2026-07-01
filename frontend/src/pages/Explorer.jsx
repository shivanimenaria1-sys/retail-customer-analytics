import React, { useState, useEffect, useRef } from 'react';
import { customerService } from '../services/api';
import { TableRowSkeleton } from '../components/LoadingSkeleton';
import { 
  Search, 
  X, 
  Calendar, 
  User, 
  DollarSign, 
  Activity, 
  AlertCircle,
  FolderLock,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  Briefcase
} from 'lucide-react';

const Explorer = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10); // default 10 matching mockup
  const [cluster, setCluster] = useState('');
  const [education, setEducation] = useState('');
  const [marital, setMarital] = useState('');
  const [search, setSearch] = useState('');

  // Custom Dropdowns open state
  const [clusterDropdownOpen, setClusterDropdownOpen] = useState(false);
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [maritalDropdownOpen, setMaritalDropdownOpen] = useState(false);

  // Refs for closing dropdowns on outside clicks
  const clusterRef = useRef(null);
  const educationRef = useRef(null);
  const maritalRef = useRef(null);

  // Sorting state (default: sorted by ID ascending)
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  const segmentOptions = [
    { value: '', label: 'All Segments', color: 'bg-blue-500' },
    { value: '0', label: 'Cluster 1', color: 'bg-emerald-500' },
    { value: '1', label: 'Cluster 2', color: 'bg-purple-500' },
    { value: '2', label: 'Cluster 3', color: 'bg-amber-500' },
    { value: '3', label: 'Cluster 4', color: 'bg-pink-500' },
  ];

  const educationOptions = [
    { value: '', label: 'All Education Levels' },
    { value: 'Graduation', label: 'Graduation' },
    { value: 'PhD', label: 'PhD' },
    { value: 'Master', label: 'Master' },
    { value: 'Basic', label: 'Basic' },
    { value: '2n Cycle', label: '2n Cycle' }
  ];

  const maritalOptions = [
    { value: '', label: 'All Marital Statuses' },
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Together', label: 'Together' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widow', label: 'Widow' }
  ];

  // Close custom dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clusterRef.current && !clusterRef.current.contains(event.target)) {
        setClusterDropdownOpen(false);
      }
      if (educationRef.current && !educationRef.current.contains(event.target)) {
        setEducationDropdownOpen(false);
      }
      if (maritalRef.current && !maritalRef.current.contains(event.target)) {
        setMaritalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trigger search filters across the entire database
  useEffect(() => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const cleanSearch = search.trim().toLowerCase();

    // 1. If search is numeric ID, query the direct customer lookup
    if (cleanSearch !== '' && !isNaN(cleanSearch)) {
      customerService.getCustomerById(parseInt(cleanSearch), controller.signal)
        .then(data => {
          setCustomers(data ? [data] : []);
          setLoading(false);
        })
        .catch(err => {
          if (err.name === 'CanceledError') return;
          if (err.response && err.response.status === 404) {
            setCustomers([]);
          } else {
            console.error(err);
            setError("Could not load customer ID. Check server status.");
          }
          setLoading(false);
        });
      return () => controller.abort();
    }

    // 2. Auto-detect if search is a category keyword to pass as database filter
    const knownEducations = ['graduation', 'phd', 'master', 'basic', '2n cycle'];
    const knownMaritals = ['single', 'married', 'together', 'divorced', 'widow'];

    let apiEducation = education;
    let apiMarital = marital;

    if (cleanSearch !== '') {
      if (knownEducations.includes(cleanSearch)) {
        apiEducation = cleanSearch;
      } else if (knownMaritals.includes(cleanSearch)) {
        apiMarital = cleanSearch;
      }
    }

    // 3. Trigger backend search, filters, and server-side sorting
    const params = {
      skip: page * limit,
      limit: limit,
      cluster: cluster !== '' ? parseInt(cluster) : undefined,
      education: apiEducation !== '' ? apiEducation : undefined,
      marital_status: apiMarital !== '' ? apiMarital : undefined,
      sort_by: sortField,
      sort_order: sortOrder
    };

    customerService.getCustomers(params, controller.signal)
      .then(data => {
        // Fallback: If user entered text that is not a known education/marital, do a soft in-memory filter
        let result = data;
        if (cleanSearch !== '' && !knownEducations.includes(cleanSearch) && !knownMaritals.includes(cleanSearch)) {
          result = data.filter(c => 
            c.education.toLowerCase().includes(cleanSearch) || 
            c.marital_status.toLowerCase().includes(cleanSearch)
          );
        }
        setCustomers(result);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'CanceledError') return;
        console.error("Customers list fetch error", err);
        setError("Failed to connect to database. Make sure PostgreSQL and FastAPI server are online.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [page, cluster, education, marital, search, sortField, sortOrder, retryTrigger, limit]);

  // Load single customer detail when modal opens
  useEffect(() => {
    if (selectedCustomerId === null) {
      setSelectedCustomer(null);
      return;
    }
    setModalLoading(true);
    const controller = new AbortController();
    customerService.getCustomerById(selectedCustomerId, controller.signal)
      .then(data => {
        setSelectedCustomer(data);
        setModalLoading(false);
      })
      .catch(err => {
        if (err.name === 'CanceledError') return;
        console.error("Customer detail load error", err);
        setModalLoading(false);
      });
    return () => controller.abort();
  }, [selectedCustomerId]);

  const handleNextPage = () => {
    if (customers.length === limit) setPage(p => p + 1);
  };
  const handlePrevPage = () => {
    if (page > 0) setPage(p => p - 1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return null;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-500" /> 
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />;
  };

  const handleClearFilters = () => {
    setSearch('');
    setCluster('');
    setEducation('');
    setMarital('');
    setPage(0);
  };

  const getSelectedSegmentLabel = () => {
    const found = segmentOptions.find(opt => opt.value === cluster);
    return found ? found.label : 'All Segments';
  };

  const getSelectedSegmentColor = () => {
    const found = segmentOptions.find(opt => opt.value === cluster);
    return found ? found.color : 'bg-blue-500';
  };

  const getSelectedEducationLabel = () => {
    const found = educationOptions.find(opt => opt.value === education);
    return found ? found.label : 'All Education Levels';
  };

  const getSelectedMaritalLabel = () => {
    const found = maritalOptions.find(opt => opt.value === marital);
    return found ? found.label : 'All Marital Statuses';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Customer Explorer</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1.5 text-sm">Examine and filter specific customer demographics and transactional spending profiles.</p>
      </div>

      {/* Error Alert with Retry */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 dark:border-red-950/30 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-start gap-4 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Database Sync Error</h4>
            <p className="text-xs mt-1 leading-relaxed opacity-90">{error}</p>
          </div>
          <button
            onClick={() => setRetryTrigger(prev => prev + 1)}
            className="flex items-center gap-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer select-none"
          >
            <RefreshCw className="h-3 w-3" /> Retry Connection
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 items-center select-none">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search ID or text..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-hidden transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {/* Custom Segments Dropdown */}
        <div className="relative" ref={clusterRef}>
          <button
            onClick={() => {
              setClusterDropdownOpen(!clusterDropdownOpen);
              setEducationDropdownOpen(false);
              setMaritalDropdownOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 cursor-pointer text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors focus:border-blue-500"
          >
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${getSelectedSegmentColor()}`}></span>
              <span>{getSelectedSegmentLabel()}</span>
            </div>
            <ChevronDown className="h-4.5 w-4.5 text-slate-400" />
          </button>

          {clusterDropdownOpen && (
            <div className="absolute left-0 right-0 z-30 mt-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
              {segmentOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setCluster(opt.value);
                    setClusterDropdownOpen(false);
                    setPage(0);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors text-left cursor-pointer hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/80 dark:hover:text-white ${
                    cluster === opt.value 
                      ? 'bg-blue-50/70 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-bold' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${opt.color}`}></span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Education Dropdown */}
        <div className="relative" ref={educationRef}>
          <button
            onClick={() => {
              setEducationDropdownOpen(!educationDropdownOpen);
              setClusterDropdownOpen(false);
              setMaritalDropdownOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 cursor-pointer text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors focus:border-blue-500"
          >
            <span>{getSelectedEducationLabel()}</span>
            <ChevronDown className="h-4.5 w-4.5 text-slate-400" />
          </button>

          {educationDropdownOpen && (
            <div className="absolute left-0 right-0 z-30 mt-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
              {educationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setEducation(opt.value);
                    setEducationDropdownOpen(false);
                    setPage(0);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors text-left cursor-pointer hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/80 dark:hover:text-white ${
                    education === opt.value 
                      ? 'bg-blue-50/70 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-bold' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Marital Dropdown */}
        <div className="relative" ref={maritalRef}>
          <button
            onClick={() => {
              setMaritalDropdownOpen(!maritalDropdownOpen);
              setClusterDropdownOpen(false);
              setEducationDropdownOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 cursor-pointer text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors focus:border-blue-500"
          >
            <span>{getSelectedMaritalLabel()}</span>
            <ChevronDown className="h-4.5 w-4.5 text-slate-400" />
          </button>

          {maritalDropdownOpen && (
            <div className="absolute left-0 right-0 z-30 mt-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
              {maritalOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setMarital(opt.value);
                    setMaritalDropdownOpen(false);
                    setPage(0);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors text-left cursor-pointer hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/80 dark:hover:text-white ${
                    marital === opt.value 
                      ? 'bg-blue-50/70 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-bold' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Filters Link */}
        <button
          onClick={handleClearFilters}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 py-2.5 px-4 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-805/50 cursor-pointer transition-colors text-blue-600 dark:text-blue-500"
        >
          <RefreshCw className="h-4 w-4" /> Reset Filters
        </button>

      </div>

      {/* Table Container */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-950/45 select-none">
                <th onClick={() => handleSort('id')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 group transition-colors">
                  <div className="flex items-center">ID {renderSortIcon('id')}</div>
                </th>
                <th onClick={() => handleSort('age')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 group transition-colors">
                  <div className="flex items-center">Age {renderSortIcon('age')}</div>
                </th>
                <th onClick={() => handleSort('education')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 group transition-colors">
                  <div className="flex items-center">Education {renderSortIcon('education')}</div>
                </th>
                <th onClick={() => handleSort('marital_status')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 group transition-colors">
                  <div className="flex items-center">Marital Status {renderSortIcon('marital_status')}</div>
                </th>
                <th onClick={() => handleSort('income')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 group transition-colors">
                  <div className="flex items-center">Income {renderSortIcon('income')}</div>
                </th>
                <th onClick={() => handleSort('total_spending')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 group transition-colors">
                  <div className="flex items-center">Spending {renderSortIcon('total_spending')}</div>
                </th>
                <th onClick={() => handleSort('total_purchases')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 group transition-colors">
                  <div className="flex items-center">Purchases {renderSortIcon('total_purchases')}</div>
                </th>
                <th onClick={() => handleSort('cluster')} className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 group transition-colors">
                  <div className="flex items-center">Segment {renderSortIcon('cluster')}</div>
                </th>
                <th className="px-6 py-4 text-slate-505 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                [...Array(6)].map((_, i) => <TableRowSkeleton key={i} />)
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <FolderLock className="h-10 w-10 text-slate-350 dark:text-slate-600" />
                      <p className="text-slate-850 dark:text-slate-200 font-bold text-lg">No Results Found</p>
                      <p className="text-slate-400 text-sm max-w-sm">No profiles match these filters. Try resetting the dashboard filters.</p>
                      <button 
                        onClick={handleClearFilters}
                        className="mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-md shadow-blue-500/10 transition-all cursor-pointer"
                      >
                        Clear Active Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const isSelected = selectedCustomerId === c.id;
                  
                  // Map DB cluster index to 1-based Cluster UI label and specific dot colors
                  const dbCluster = c.segment?.cluster;
                  let displaySegment = 'Unassigned';
                  let segmentBadgeClass = 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-355 dark:border-slate-700';
                  
                  if (dbCluster !== undefined) {
                    displaySegment = `Cluster ${dbCluster + 1}`;
                    if (dbCluster === 0) {
                      segmentBadgeClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40';
                    } else if (dbCluster === 1) {
                      segmentBadgeClass = 'bg-purple-500/10 text-purple-500 border-purple-500/20 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/40';
                    } else if (dbCluster === 2) {
                      segmentBadgeClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-955/45 dark:text-amber-400 dark:border-amber-900/40';
                    } else if (dbCluster === 3) {
                      segmentBadgeClass = 'bg-pink-500/10 text-pink-500 border-pink-500/20 dark:bg-pink-955/45 dark:text-pink-400 dark:border-pink-900/40';
                    }
                  }

                  return (
                    <tr 
                      key={c.id} 
                      onClick={() => setSelectedCustomerId(c.id)}
                      className={`cursor-pointer transition-all duration-150 ${
                        isSelected 
                          ? 'bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-955/30' 
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{c.id}</td>
                      <td className="px-6 py-4 text-slate-750 dark:text-slate-300">
                        {c.features?.age ?? (new Date().getFullYear() - c.year_birth)}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{c.education}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{c.marital_status || 'N/A'}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">
                        {c.income ? `$${c.income.toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {c.features?.total_spending ? `$${c.features.total_spending.toLocaleString()}` : '$0'}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-250">
                        {c.features?.total_purchases ?? 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold border ${segmentBadgeClass}`}>
                          {displaySegment}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerId(c.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {customers.length > 0 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 dark:border-slate-800 p-4 select-none">
            {/* Show info */}
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, 2236)} of 2,236 customers
            </span>

            {/* Controls */}
            <div className="flex items-center gap-6 self-end sm:self-auto">
              
              {/* Rows dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(0); }}
                  className="appearance-none rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent py-1 pl-2 pr-6 text-xs text-slate-705 dark:text-slate-300 outline-hidden cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>

              {/* Number navigation list */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 0 || loading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer text-sm"
                >
                  &lt;
                </button>
                
                {/* Dynamically display paginators matching mockups */}
                {[0, 1, 2, 3, 4].map(idx => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      page === idx 
                        ? 'bg-blue-600 text-white dark:bg-blue-500' 
                        : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                
                <span className="px-1.5 text-xs text-slate-400">...</span>
                
                <button
                  onClick={() => setPage(223)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    page === 223
                      ? 'bg-blue-600 text-white dark:bg-blue-500' 
                      : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-305'
                  }`}
                >
                  224
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={customers.length < limit || loading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer text-sm"
                >
                  &gt;
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Details Modal */}
      {selectedCustomerId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedCustomerId(null)}
              className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {modalLoading || !selectedCustomer ? (
              <div className="flex h-64 items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header info */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    Customer Profile Details (ID: {selectedCustomer.id})
                  </h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5" /> Enrolled on: {selectedCustomer.dt_customer}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  
                  {/* Demographics Card */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40 space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                      <User className="h-4 w-4 text-blue-600" /> Demographics
                    </h4>
                    <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                      <li className="flex justify-between"><span>Age:</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedCustomer.features?.age}</span></li>
                      <li className="flex justify-between"><span>Education:</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedCustomer.education}</span></li>
                      <li className="flex justify-between"><span>Marital Status:</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedCustomer.marital_status}</span></li>
                      <li className="flex justify-between"><span>Income:</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedCustomer.income ? `$${selectedCustomer.income.toLocaleString()}` : 'N/A'}</span></li>
                      <li className="flex justify-between"><span>Dependents:</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedCustomer.kidhome + selectedCustomer.teenhome}</span></li>
                    </ul>
                  </div>

                  {/* Spending Card */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40 space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-emerald-600" /> Expenditures
                    </h4>
                    <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                      <li className="flex justify-between"><span>Wines:</span> <span className="font-semibold text-slate-900 dark:text-white">${selectedCustomer.mnt_wines}</span></li>
                      <li className="flex justify-between"><span>Meats:</span> <span className="font-semibold text-slate-900 dark:text-white">${selectedCustomer.mnt_meat_products}</span></li>
                      <li className="flex justify-between"><span>Gold:</span> <span className="font-semibold text-slate-900 dark:text-white">${selectedCustomer.mnt_gold_prods}</span></li>
                      <li className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-bold text-blue-600 dark:text-blue-400">
                        <span>Total Spend:</span> <span>${selectedCustomer.features?.total_spending}</span>
                      </li>
                      <li className="flex justify-between text-slate-505">
                        <span>Avg Basket Size:</span> <span className="font-semibold">${selectedCustomer.features?.average_spending_per_purchase?.toFixed(2)}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Product breakdown categories footer */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40 space-y-3 col-span-1 sm:col-span-2">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-purple-600" /> Department Purchases
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex justify-between"><span>Fruits Spend:</span> <span className="font-semibold text-slate-900 dark:text-white">${selectedCustomer.mnt_fruits}</span></div>
                      <div className="flex justify-between"><span>Fish Spend:</span> <span className="font-semibold text-slate-900 dark:text-white">${selectedCustomer.mnt_fish_products}</span></div>
                      <div className="flex justify-between"><span>Sweets Spend:</span> <span className="font-semibold text-slate-900 dark:text-white">${selectedCustomer.mnt_sweet_products}</span></div>
                      <div className="flex justify-between"><span>Web Visits/Month:</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedCustomer.num_web_visits_month} visits</span></div>
                    </div>
                  </div>

                  {/* Engagement Card */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40 space-y-3 col-span-1 sm:col-span-2">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-amber-600" /> Marketing Campaign Conversions
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-center pt-1.5">
                      {['Cmp 1', 'Cmp 2', 'Cmp 3', 'Cmp 4', 'Cmp 5', 'Latest'].map((cmp, i) => {
                        const flags = [
                          selectedCustomer.accepted_cmp1,
                          selectedCustomer.accepted_cmp2,
                          selectedCustomer.accepted_cmp3,
                          selectedCustomer.accepted_cmp4,
                          selectedCustomer.accepted_cmp5,
                          selectedCustomer.response
                        ];
                        const isAccepted = flags[i] === 1;
                        return (
                          <div key={cmp} className={`p-2 rounded-xl border text-xs font-semibold ${
                            isAccepted 
                              ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-950/30 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'border-slate-200 bg-slate-100/50 text-slate-400 dark:border-slate-800 dark:bg-slate-950/30'
                          }`}>
                            <span>{cmp}</span>
                            <span className="block text-[10px] mt-0.5">{isAccepted ? 'Accepted' : 'Declined'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Explorer;
