import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    let detailedInfo = null;
    try {
      // Check if error message is our FirestoreErrorInfo JSON
      const parsed = JSON.parse(error.message);
      if (parsed.error && parsed.operationType) {
        detailedInfo = JSON.stringify(parsed, null, 2);
      }
    } catch (e) {
      // Not a JSON error
    }

    this.setState({
      errorInfo: detailedInfo
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isFirestoreError = this.state.errorInfo !== null;

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl ${isFirestoreError ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                  {isFirestoreError ? <ShieldAlert size={32} /> : <AlertCircle size={32} />}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {isFirestoreError ? 'Database Access Restricted' : 'Something went wrong'}
                  </h1>
                  <p className="text-slate-500">
                    {isFirestoreError 
                      ? 'The application encountered a permission issue while accessing the database.'
                      : 'An unexpected error occurred in the application.'}
                  </p>
                </div>
              </div>

              {this.state.error && !isFirestoreError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm font-mono text-red-700 break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              {isFirestoreError && (
                <div className="mb-6">
                  <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-xs font-mono text-emerald-400">
                      {this.state.errorInfo}
                    </pre>
                  </div>
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <h3 className="text-sm font-semibold text-amber-900 mb-2">How to fix this:</h3>
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                      <li>Ensure your Firebase Security Rules are deployed.</li>
                      <li>Check if you have the necessary permissions for this action.</li>
                      <li>Verify that the Cloud Firestore API is enabled in your Google Cloud project.</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                >
                  <RefreshCcw size={18} />
                  Reload Application
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                HydroFlow System Monitor • Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
