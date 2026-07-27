import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function ResultsPage({ data, onReset }) {
    const analysis = data.analysis_result.document_analysis;
    const summary = analysis.ai_generated_knowledge.policy_summary;
    const criticalIssues = analysis.risk_assessment.critical_issues;
    const importantNotes = analysis.risk_assessment.important_notes || [];
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsx("div", { className: "border-b border-border", children: _jsxs("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8", children: [_jsx("h1", { className: "text-4xl sm:text-5xl font-bold text-text mb-2", children: "Your Insurance Explained" }), _jsx("p", { className: "text-text-muted", children: "Based on your uploaded policy" })] }) }), _jsxs("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12", children: [_jsxs(Section, { icon: "\uD83D\uDCCB", title: "Coverage Summary", children: [_jsx("p", { className: "text-lg leading-relaxed text-text-light mb-6", children: summary.what_is_covered }), summary.key_points && summary.key_points.length > 0 && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6", children: [_jsx("p", { className: "font-semibold text-text mb-3", children: "Key Points:" }), _jsx("ul", { className: "space-y-2", children: summary.key_points.map((point, idx) => (_jsxs("li", { className: "flex gap-3 text-text", children: [_jsx("span", { className: "text-primary font-bold min-w-fit", children: "\u2713" }), _jsx("span", { children: point })] }, idx))) })] }))] }), _jsxs(Section, { icon: "\u26D4", title: "What's NOT Covered", children: [_jsx("p", { className: "text-base leading-relaxed text-text-light mb-6", children: summary.what_is_not_covered }), analysis.extracted_facts.exclusions && analysis.extracted_facts.exclusions.length > 0 && (_jsx("div", { className: "space-y-3", children: analysis.extracted_facts.exclusions.map((exc, idx) => (_jsxs("div", { className: "border-l-4 border-orange-400 bg-orange-50 p-4 rounded", children: [_jsx("p", { className: "font-semibold text-orange-900", children: exc.exclusion }), _jsx("p", { className: "text-orange-800 text-sm mt-1", children: exc.details })] }, idx))) }))] }), criticalIssues && criticalIssues.length > 0 && (_jsx(Section, { icon: "\u26A0\uFE0F", title: "Critical Issues", highlight: "red", children: _jsx("div", { className: "space-y-3", children: criticalIssues.map((issue, idx) => (_jsxs("div", { className: "border-l-4 border-red-500 bg-red-50 p-4 rounded", children: [_jsx("p", { className: "font-bold text-red-900", children: issue.issue }), _jsx("p", { className: "text-red-800 text-sm mt-2", children: issue.explanation }), issue.action_required && (_jsxs("p", { className: "text-red-700 font-semibold text-sm mt-2", children: ["\u2192 ", issue.action_required] }))] }, idx))) }) })), importantNotes && importantNotes.length > 0 && (_jsx(Section, { icon: "\u2139\uFE0F", title: "Important Notes", children: _jsx("div", { className: "space-y-3", children: importantNotes.map((note, idx) => (_jsxs("div", { className: "border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded", children: [_jsx("p", { className: "font-semibold text-yellow-900", children: note.issue }), _jsx("p", { className: "text-yellow-800 text-sm mt-1", children: note.explanation })] }, idx))) }) })), _jsx(Section, { icon: "\uD83D\uDCC4", title: "Policy Details", children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: Object.entries(analysis.extracted_facts.policy_information).map(([key, value]) => (_jsx(FactCard, { label: key, value: value }, key))) }) }), data.metadata.prescription_provided && analysis.treatment_specific_summary && (_jsxs(Section, { icon: "\uD83D\uDC8A", title: "Your Treatment Coverage", highlight: "blue", children: [_jsx("p", { className: "text-lg leading-relaxed text-text-light mb-6", children: analysis.treatment_specific_summary.coverage_explanation }), _jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6 mb-6", children: [_jsx("p", { className: "text-sm text-text-muted mb-2", children: "Your Out-of-Pocket Cost" }), _jsx("p", { className: "text-3xl font-bold text-primary", children: analysis.treatment_specific_summary.potential_financial_responsibility })] }), analysis.treatment_specific_summary.important_treatment_notes &&
                                analysis.treatment_specific_summary.important_treatment_notes.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-text mb-3", children: "Important Notes:" }), _jsx("ul", { className: "space-y-2", children: analysis.treatment_specific_summary.important_treatment_notes.map((note, idx) => (_jsxs("li", { className: "flex gap-3 text-text-light", children: [_jsx("span", { className: "text-primary font-bold min-w-fit", children: "\u2022" }), _jsx("span", { children: note })] }, idx))) })] }))] })), _jsx(ChatWidget, { documentId: data.document_id }), _jsx("div", { className: "mt-12 pt-8 border-t border-border", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("button", { onClick: onReset, className: "flex-1 bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition text-center", children: "Analyze Another Policy" }), _jsx("button", { onClick: () => window.print(), className: "flex-1 border-2 border-primary text-primary font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition text-center", children: "Print Report" })] }) }), _jsxs("div", { className: "mt-8 p-4 bg-background-alt rounded text-xs text-text-muted text-center", children: [_jsxs("p", { children: ["Document ID: ", data.document_id] }), _jsxs("p", { children: ["Analysis completed in ", (data.metadata.processing_time_ms / 1000).toFixed(1), "s"] })] })] })] }));
}
function Section({ icon, title, highlight, children }) {
    return (_jsxs("div", { className: "mb-10 sm:mb-14", children: [_jsxs("div", { className: "flex items-center gap-3 mb-5", children: [icon && _jsx("span", { className: "text-2xl", children: icon }), _jsx("h2", { className: `text-2xl sm:text-3xl font-bold ${highlight === 'red' ? 'text-red-900' : highlight === 'blue' ? 'text-blue-900' : 'text-text'}`, children: title })] }), _jsx("div", { className: highlight ? (highlight === 'red' ? 'bg-red-50/50' : 'bg-blue-50/50') : '', children: _jsx("div", { className: highlight ? (highlight === 'red' ? 'p-6' : 'p-6') : '', children: children }) })] }));
}
function FactCard({ label, value }) {
    const val = value.value || value;
    const confidence = value.confidence;
    return (_jsxs("div", { className: "border border-border rounded-lg p-4 hover:shadow-md transition", children: [_jsx("p", { className: "text-xs font-semibold text-text-muted uppercase tracking-wide", children: label.replace(/_/g, ' ') }), _jsx("p", { className: "text-xl font-bold text-primary mt-2 break-words", children: val }), confidence && (_jsx("div", { className: "mt-3 flex items-center gap-2", children: _jsx("span", { className: `text-xs font-semibold px-2 py-1 rounded ${confidence === 'high'
                        ? 'bg-green-100 text-green-700'
                        : confidence === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-orange-100 text-orange-700'}`, children: confidence === 'high' ? '✓ Confirmed' : confidence === 'medium' ? '⚠ Uncertain' : 'Low confidence' }) }))] }));
}
function ChatWidget({ documentId }) {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const handleAsk = async (e) => {
        e.preventDefault();
        const trimmed = question.trim();
        if (!trimmed || loading)
            return;
        setLoading(true);
        setQuestion('');
        setMessages(prev => [...prev, { question: trimmed }]);
        try {
            const response = await fetch(`/api/v1/chat/${documentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: trimmed })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error?.message || 'Something went wrong. Please try again.');
            }
            setMessages(prev => prev.map((m, idx) => (idx === prev.length - 1 ? { ...m, answer: data.answer } : m)));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
            setMessages(prev => prev.map((m, idx) => (idx === prev.length - 1 ? { ...m, error: errorMessage } : m)));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "mt-12 pt-8 border-t border-border", children: [_jsxs("div", { className: "flex items-center gap-3 mb-5", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCAC" }), _jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-text", children: "Ask CarePolicy AI" })] }), _jsx("p", { className: "text-text-muted mb-6", children: "Ask a question about this policy \u2014 e.g. \"Is knee surgery covered?\" or \"What's my waiting period?\"" }), messages.length > 0 && (_jsx("div", { className: "space-y-4 mb-6", children: messages.map((m, idx) => (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "flex justify-end", children: _jsx("div", { className: "bg-primary text-white rounded-lg px-4 py-3 max-w-[85%] sm:max-w-[70%]", children: m.question }) }), _jsx("div", { className: "flex justify-start", children: m.answer ? (_jsx("div", { className: "bg-background-alt border border-border rounded-lg px-4 py-3 max-w-[85%] sm:max-w-[70%] text-text-light", children: m.answer })) : m.error ? (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-[85%] sm:max-w-[70%] text-red-800", children: m.error })) : (_jsx("div", { className: "bg-background-alt border border-border rounded-lg px-4 py-3 text-text-muted italic", children: "Thinking..." })) })] }, idx))) })), _jsxs("form", { onSubmit: handleAsk, className: "flex flex-col sm:flex-row gap-3", children: [_jsx("input", { type: "text", value: question, onChange: e => setQuestion(e.target.value), placeholder: "Type your question...", disabled: loading, className: "flex-1 border border-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" }), _jsx("button", { type: "submit", disabled: loading || !question.trim(), className: `px-6 py-3 rounded-lg font-semibold text-white transition ${loading || !question.trim()
                            ? 'bg-text-muted cursor-not-allowed opacity-50'
                            : 'bg-primary hover:bg-blue-700 cursor-pointer'}`, children: loading ? 'Asking...' : 'Ask' })] })] }));
}
