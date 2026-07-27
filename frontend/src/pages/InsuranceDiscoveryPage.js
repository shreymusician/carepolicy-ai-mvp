import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const POLICY_TYPES = [
    { value: '', label: 'All Types' },
    { value: 'individual', label: 'Individual' },
    { value: 'family_floater', label: 'Family Floater' },
    { value: 'senior_citizen', label: 'Senior Citizen' },
    { value: 'top_up', label: 'Top-Up' },
    { value: 'critical_illness', label: 'Critical Illness' }
];
export function InsuranceDiscoveryPage({ onSelectPolicy, onSkip }) {
    const [companies, setCompanies] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedType, setSelectedType] = useState('');
    useEffect(() => {
        fetch('/api/v1/insurance/companies')
            .then(r => r.json())
            .then(d => setCompanies(d.companies || []))
            .catch(() => setCompanies([]));
    }, []);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(true);
            const params = new URLSearchParams();
            if (query.trim())
                params.set('q', query.trim());
            if (selectedCompany)
                params.set('company', selectedCompany);
            if (selectedType)
                params.set('policyType', selectedType);
            const endpoint = query.trim() ? '/api/v1/insurance/search' : '/api/v1/insurance/policies';
            fetch(`${endpoint}?${params.toString()}`)
                .then(r => r.json())
                .then(d => setPolicies(d.policies || []))
                .catch(() => setPolicies([]))
                .finally(() => setLoading(false));
        }, 250);
        return () => clearTimeout(timeout);
    }, [query, selectedCompany, selectedType]);
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsx("div", { className: "border-b border-border", children: _jsxs("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10", children: [_jsx("h1", { className: "text-4xl sm:text-5xl font-bold text-text mb-2", children: "Find Your Insurance Policy" }), _jsx("p", { className: "text-text-muted text-lg", children: "Search and select a policy to understand its coverage" })] }) }), _jsxs("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 py-8", children: [_jsx("div", { className: "mb-6", children: _jsx("input", { type: "text", value: query, onChange: e => setQuery(e.target.value), placeholder: "Search by company or policy name (e.g. Star Health, Care Supreme)...", className: "w-full border border-border rounded-lg px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary" }) }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mb-8", children: [_jsx("select", { value: selectedType, onChange: e => setSelectedType(e.target.value), className: "border border-border rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary", children: POLICY_TYPES.map(t => (_jsx("option", { value: t.value, children: t.label }, t.value))) }), _jsxs("select", { value: selectedCompany, onChange: e => setSelectedCompany(e.target.value), className: "border border-border rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Companies" }), companies.map(c => (_jsx("option", { value: c.name, children: c.name }, c._id)))] }), (selectedType || selectedCompany || query) && (_jsx("button", { onClick: () => { setSelectedType(''); setSelectedCompany(''); setQuery(''); }, className: "text-sm text-primary hover:underline px-2", children: "Clear filters" }))] }), loading ? (_jsx("p", { className: "text-text-muted text-center py-12", children: "Loading policies..." })) : policies.length === 0 ? (_jsx("p", { className: "text-text-muted text-center py-12", children: "No policies match your search." })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: policies.map(policy => (_jsxs("button", { onClick: () => onSelectPolicy({ id: policy._id, name: policy.policy_name, companyName: policy.company_name }), className: "text-left border border-border rounded-xl p-5 hover:border-primary hover:shadow-md transition bg-white", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("img", { src: policy.company_logo_url, alt: policy.company_name, className: "w-10 h-10 rounded object-cover border border-border" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-text", children: policy.company_name }), _jsx("span", { className: "inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 mt-1", children: POLICY_TYPES.find(t => t.value === policy.policy_type)?.label || policy.policy_type })] })] }), _jsx("p", { className: "text-lg font-bold text-text mb-2", children: policy.policy_name }), policy.description && (_jsx("p", { className: "text-sm text-text-light mb-2 line-clamp-2", children: policy.description })), policy.coverage_summary && (_jsx("p", { className: "text-sm text-text-muted line-clamp-2 mb-2", children: policy.coverage_summary })), policy.waiting_period && (_jsxs("p", { className: "text-xs text-text-muted line-clamp-2", children: [_jsx("span", { className: "font-semibold", children: "Waiting period:" }), " ", policy.waiting_period] })), _jsx("div", { className: "mt-3 pt-3 border-t border-border", children: policy.verification_status === 'verified' ? (_jsx("span", { className: "text-xs font-semibold text-green-700", children: "\u2713 Verified from official insurer document" })) : (_jsx("span", { className: "text-xs font-semibold text-orange-700", children: "\u26A0 Details not yet verified \u2014 refer to the insurer's official policy document" })) })] }, policy._id))) })), _jsx("div", { className: "text-center mt-10 pt-8 border-t border-border", children: _jsx("button", { onClick: onSkip, className: "text-primary font-semibold hover:underline", children: "Skip \u2014 Upload a policy document directly \u2192" }) })] })] }));
}
