import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
export function LandingPage({ onSubmit }) {
    const fileInputRef = useRef(null);
    const prescriptionInputRef = useRef(null);
    const policyDragRef = useRef(null);
    const prescriptionDragRef = useRef(null);
    const [policyFile, setPolicyFile] = useState(null);
    const [prescriptionFile, setPrescriptionFile] = useState(null);
    const [policyDragActive, setPolicyDragActive] = useState(false);
    const [prescriptionDragActive, setPrescriptionDragActive] = useState(false);
    const handlePolicyChange = (file) => {
        if (file && file.type === 'application/pdf') {
            setPolicyFile(file);
        }
        else if (file) {
            alert('Policy must be a PDF file');
        }
    };
    const handlePrescriptionChange = (file) => {
        if (file && ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
            setPrescriptionFile(file);
        }
        else if (file) {
            alert('Prescription must be a PDF or image (PNG/JPG)');
        }
    };
    const handlePolicyDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setPolicyDragActive(true);
        }
        else if (e.type === 'dragleave') {
            setPolicyDragActive(false);
        }
    };
    const handlePolicyDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setPolicyDragActive(false);
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handlePolicyChange(files[0]);
        }
    };
    const handlePrescriptionDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setPrescriptionDragActive(true);
        }
        else if (e.type === 'dragleave') {
            setPrescriptionDragActive(false);
        }
    };
    const handlePrescriptionDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setPrescriptionDragActive(false);
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handlePrescriptionChange(files[0]);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!policyFile) {
            alert('Please upload an insurance policy');
            return;
        }
        const formData = new FormData();
        formData.append('policy', policyFile);
        if (prescriptionFile) {
            formData.append('prescription', prescriptionFile);
        }
        onSubmit(formData);
    };
    return (_jsx("div", { className: "min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12", children: _jsxs("div", { className: "max-w-2xl w-full", children: [_jsxs("div", { className: "mb-12 text-center", children: [_jsx("h1", { className: "text-5xl font-bold mb-3 text-text", children: "CarePolicy AI" }), _jsx("p", { className: "text-2xl text-text-light font-light", children: "Making Health Insurance Understandable" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "w-full", children: [_jsxs("div", { className: "mb-10", children: [_jsxs("label", { className: "block text-lg font-semibold mb-3 text-text", children: ["Insurance Policy ", _jsx("span", { className: "text-primary", children: "*" })] }), _jsx("p", { className: "text-sm text-text-muted mb-4", children: "Upload your policy PDF (up to 10MB)" }), _jsxs("div", { ref: policyDragRef, onDragEnter: handlePolicyDrag, onDragLeave: handlePolicyDrag, onDragOver: handlePolicyDrag, onDrop: handlePolicyDrop, onClick: () => fileInputRef.current?.click(), className: `border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${policyDragActive
                                        ? 'border-primary bg-blue-50'
                                        : policyFile
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-border hover:border-primary hover:bg-background-alt'}`, children: [policyFile ? (_jsxs("div", { children: [_jsx("div", { className: "text-3xl mb-2", children: "\u2713" }), _jsx("p", { className: "font-semibold text-text text-lg", children: policyFile.name }), _jsxs("p", { className: "text-sm text-text-muted mt-1", children: [(policyFile.size / 1024 / 1024).toFixed(1), "MB"] })] })) : (_jsxs("div", { children: [_jsx("div", { className: "text-4xl mb-3 text-text-muted", children: "\uD83D\uDCC4" }), _jsx("p", { className: "text-lg text-text font-medium", children: "Click to upload or drag and drop" }), _jsx("p", { className: "text-sm text-text-muted mt-1", children: "PDF file only" })] })), _jsx("input", { ref: fileInputRef, type: "file", accept: ".pdf", onChange: (e) => handlePolicyChange(e.target.files?.[0] || null), className: "hidden" })] }), policyFile && (_jsx("button", { type: "button", onClick: () => setPolicyFile(null), className: "text-sm text-primary hover:underline mt-2", children: "Remove file" }))] }), _jsxs("div", { className: "mb-12", children: [_jsxs("label", { className: "block text-lg font-semibold mb-3 text-text", children: ["Doctor's Prescription ", _jsx("span", { className: "text-text-muted font-normal", children: "(Optional)" })] }), _jsx("p", { className: "text-sm text-text-muted mb-4", children: "Upload prescription PDF or image to help AI understand your specific treatment (up to 10MB)" }), _jsxs("div", { ref: prescriptionDragRef, onDragEnter: handlePrescriptionDrag, onDragLeave: handlePrescriptionDrag, onDragOver: handlePrescriptionDrag, onDrop: handlePrescriptionDrop, onClick: () => prescriptionInputRef.current?.click(), className: `border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${prescriptionDragActive
                                        ? 'border-primary bg-blue-50'
                                        : prescriptionFile
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-border hover:border-primary hover:bg-background-alt'}`, children: [prescriptionFile ? (_jsxs("div", { children: [_jsx("div", { className: "text-3xl mb-2", children: "\u2713" }), _jsx("p", { className: "font-semibold text-text text-lg", children: prescriptionFile.name }), _jsxs("p", { className: "text-sm text-text-muted mt-1", children: [(prescriptionFile.size / 1024 / 1024).toFixed(1), "MB"] })] })) : (_jsxs("div", { children: [_jsx("div", { className: "text-4xl mb-3 text-text-muted", children: "\uD83D\uDCCB" }), _jsx("p", { className: "text-lg text-text font-medium", children: "Click to upload or drag and drop" }), _jsx("p", { className: "text-sm text-text-muted mt-1", children: "PDF or image (PNG/JPG)" })] })), _jsx("input", { ref: prescriptionInputRef, type: "file", accept: ".pdf,.png,.jpg,.jpeg", onChange: (e) => handlePrescriptionChange(e.target.files?.[0] || null), className: "hidden" })] }), prescriptionFile && (_jsx("button", { type: "button", onClick: () => setPrescriptionFile(null), className: "text-sm text-primary hover:underline mt-2", children: "Remove file" }))] }), _jsx("button", { type: "submit", disabled: !policyFile, className: `w-full py-4 px-6 rounded-lg font-bold text-lg text-white transition ${policyFile
                                ? 'bg-primary hover:bg-blue-700 cursor-pointer'
                                : 'bg-text-muted cursor-not-allowed opacity-50'}`, children: policyFile ? 'Analyze My Insurance' : 'Upload a Policy to Begin' })] }), _jsx("p", { className: "text-center text-text-muted text-sm mt-10", children: "Your documents are analyzed securely using AI. We process your data only to generate your report." })] }) }));
}
