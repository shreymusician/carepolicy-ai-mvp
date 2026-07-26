import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export function ProcessingPage() {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const messages = [
        'Uploading your documents...',
        'Detecting document type...',
        'Extracting text from PDF...',
        'Analyzing policy details...',
        'Finding coverage information...',
        'Understanding your treatment...',
        'Generating your report...'
    ];
    const messageIndex = Math.min(Math.floor(elapsedSeconds / 2), messages.length - 1);
    return (_jsx("div", { className: "min-h-screen bg-white flex items-center justify-center px-4 py-12", children: _jsxs("div", { className: "max-w-md w-full text-center", children: [_jsx("h2", { className: "text-4xl font-bold mb-8 text-text", children: "Analyzing Your Insurance" }), _jsx("div", { className: "mb-12", children: _jsx("div", { className: "w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" }) }), _jsx("p", { className: "text-xl text-text-light mb-8 h-8", children: messages[messageIndex] }), _jsx("div", { className: "w-full bg-border rounded-full h-2 mb-6", children: _jsx("div", { className: "bg-primary h-2 rounded-full transition-all duration-300", style: { width: `${Math.min((elapsedSeconds / 15) * 100, 95)}%` } }) }), _jsxs("p", { className: "text-lg font-mono text-primary", children: [elapsedSeconds, "s"] }), _jsx("p", { className: "text-sm text-text-muted mt-2", children: "This usually takes 10-15 seconds" })] }) }));
}
