import React, { useState } from 'react';
import { Bill } from '../types';
import { generateFinancialInsights } from '../services/geminiService';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Normally I'd import, but since I can't guarantee packages, I'll render text simply or assume standard text rendering for this prototype. 
// Actually, simple whitespace-pre-wrap works well for markdown-like text if not using a parser.

interface GeminiInsightsProps {
  bills: Bill[];
}

export const GeminiInsights: React.FC<GeminiInsightsProps> = ({ bills }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateFinancialInsights(bills);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Sparkles className="text-yellow-300" />
              AI Financial Analyst
            </h2>
            <p className="text-indigo-100 max-w-xl text-lg">
              Get an instant executive summary of your organization's expenses, cash flow risks, and optimization opportunities powered by Gemini.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`px-6 py-3 rounded-xl font-semibold bg-white text-indigo-600 shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Analyzing...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {insight && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 animate-fade-in">
          <div className="prose prose-slate max-w-none">
             <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans">
               {insight}
             </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-2">
            <AlertCircle size={14} />
            AI-generated content. Verify important financial data manually.
          </div>
        </div>
      )}
      
      {!insight && !loading && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
           <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
           <p>Click "Generate Report" to analyze {bills.length} bills.</p>
        </div>
      )}
    </div>
  );
};