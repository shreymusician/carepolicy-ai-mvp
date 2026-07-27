import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { InsuranceDiscoveryPage } from './pages/InsuranceDiscoveryPage';
import { LandingPage } from './pages/LandingPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ResultsPage } from './pages/ResultsPage';
import './index.css';
export default function App() {
    const [state, setState] = useState('discovery');
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);
    const handleSelectPolicy = (policy) => {
        setSelectedPolicy(policy);
        setState('landing');
    };
    const handleAnalysisStart = async (formData) => {
        setState('processing');
        setError(null);
        try {
            const response = await fetch('/api/v1/analyze', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message ||
                    (response.status === 413 ? 'File too large (max 10MB)' : 'Analysis failed'));
            }
            const data = await response.json();
            setAnalysis(data);
            setState('results');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Analysis error:', error);
            setError({
                title: 'Analysis Failed',
                message: errorMessage,
                retry: () => handleAnalysisStart(formData)
            });
            setState('error');
        }
    };
    const handleReset = () => {
        setState('discovery');
        setSelectedPolicy(null);
        setAnalysis(null);
        setError(null);
    };
    const handleRetry = () => {
        if (error?.retry) {
            error.retry();
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-white text-black", children: [state === 'discovery' && (_jsx(InsuranceDiscoveryPage, { onSelectPolicy: handleSelectPolicy, onSkip: () => setState('landing') })), state === 'landing' && (_jsx(LandingPage, { onSubmit: handleAnalysisStart, selectedPolicy: selectedPolicy, onChangePolicy: () => setState('discovery') })), state === 'processing' && _jsx(ProcessingPage, {}), state === 'results' && analysis && _jsx(ResultsPage, { data: analysis, onReset: handleReset }), state === 'error' && (_jsx("div", { className: "min-h-screen bg-white flex items-center justify-center px-4 py-12", children: _jsx("div", { className: "max-w-md w-full", children: _jsxs("div", { className: "bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center", children: [_jsx("div", { className: "text-5xl mb-4", children: "\u274C" }), _jsx("h2", { className: "text-2xl font-bold text-red-900 mb-3", children: error?.title }), _jsx("p", { className: "text-red-800 mb-6", children: error?.message }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("button", { onClick: handleRetry, className: "bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition", children: "Try Again" }), _jsx("button", { onClick: handleReset, className: "border-2 border-primary text-primary font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition", children: "Start Over" })] })] }) }) }))] }));
}
