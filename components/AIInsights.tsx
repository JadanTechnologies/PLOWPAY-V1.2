import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './icons/index.tsx';

// Simple markdown to HTML converter for basic formatting
const markdownToHtml = (text: string) => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italics

    // Handle lists
    html = html.replace(/^\s*-\s+(.*)/gm, '<li>$1</li>');
    html = html.replace(/(\<li\>.*?\<\/li\>)/gs, '<ul>$1</ul>');
    html = html.replace(/\<\/ul\>\s*\<ul\>/g, ''); // Fix adjacent lists

    html = html.replace(/\n/g, '<br />'); // Newlines
    
    return html;
};

const AIInsights: React.FC = () => {
    const { generateInsights } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [insights, setInsights] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setInsights(null);
        setError(null);
        try {
            const result = await generateInsights();
            setInsights(result);
        } catch (e) {
            console.error(e);
            setError('Failed to generate insights. Please try again later.');
        }
        setIsLoading(false);
    };

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <Icon name="sparkles" className="w-6 h-6 mr-3 text-cyan-400" />
                    AI-Powered Sales Insights
                </h3>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold px-4 py-2 rounded-md hover:from-cyan-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center w-full sm:w-auto justify-center"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : (
                        "Generate Insights"
                    )}
                </button>
            </div>
            <div className="min-h-[150px] bg-slate-100 dark:bg-slate-900/50 rounded-md p-4 flex items-center justify-center">
                {isLoading && (
                    <p className="text-slate-500 dark:text-slate-400 text-center animate-pulse">The AI is analyzing your recent sales data...</p>
                )}
                {error && (
                    <p className="text-red-500 dark:text-red-400">{error}</p>
                )}
                {!isLoading && !error && !insights && (
                    <p className="text-slate-500 dark:text-slate-400 text-center">Click "Generate Insights" to get an AI-powered summary of your sales performance over the last 30 days.</p>
                )}
                {insights && (
                    <div
                        className="prose prose-sm prose-slate dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(insights) }}
                    />
                )}
            </div>
        </div>
    );
};

export default AIInsights;
