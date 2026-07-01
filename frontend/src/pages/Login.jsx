import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@analytics.com');
  const [password, setPassword] = useState('password');

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950 transition-colors duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 p-8 shadow-xl border border-slate-800 text-white">
        
        {/* Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 dark:bg-blue-500">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-400">Sign in to your customer segmentation portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input w-full rounded-xl border border-slate-800 bg-slate-950 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none caret-white transition-all focus:border-blue-500 focus:bg-slate-950 focus:ring-0 focus:outline-hidden"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input w-full rounded-xl border border-slate-800 bg-slate-950 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none caret-white transition-all focus:border-blue-500 focus:bg-slate-950 focus:ring-0 focus:outline-hidden"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-450 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0" defaultChecked />
              Remember me
            </label>
            <a href="#" className="font-medium text-blue-400 hover:text-blue-300">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 text-sm font-semibold text-white transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Demo Credentials Footer */}
        <div className="mt-8 rounded-2xl bg-slate-950/60 p-4 border border-slate-800 text-center text-xs text-slate-400">
          <span className="font-semibold text-slate-200">Demo Account</span>: demo@analytics.com / password
        </div>

      </div>
    </div>
  );
};

export default Login;
