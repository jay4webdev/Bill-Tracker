import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Bill, PaymentStatus } from '../types';
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle, Download, X } from 'lucide-react';

interface BulkUploadProps {
  onBulkSubmit: (bills: Bill[]) => void;
  onCancel: () => void;
  categories: { name: string, subcategories: string[] }[];
  companies: string[];
}

export const BulkUpload: React.FC<BulkUploadProps> = ({ onBulkSubmit, onCancel, categories, companies }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [previewData, setPreviewData] = useState<Bill[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    // Define the headers and a sample row
    const headers = [
      "Company Name", 
      "Staff Name", 
      "Description", 
      "Amount", 
      "Currency (USD/MVR)", 
      "Bill Date (YYYY-MM-DD)", 
      "Due Date (YYYY-MM-DD)", 
      "Category", 
      "Subcategory"
    ];

    const sampleData = [
      headers,
      [
        "Acme Corp", 
        "John Doe", 
        "Monthly Server Cost", 
        150.00, 
        "USD", 
        "2024-05-01", 
        "2024-05-15", 
        "Software Subscription", 
        "Cloud Infrastructure"
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "BillTrackr_Template.xlsx");
  };

  const parseDate = (value: any): string => {
    if (!value) return new Date().toISOString().split('T')[0];
    // Handle Excel serial date
    if (typeof value === 'number') {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      return date.toISOString().split('T')[0];
    }
    // Handle string date
    return String(value).trim();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Skip header row
        const rows = data.slice(1) as any[];
        
        const parsedBills: Bill[] = [];
        let rowErrors: string[] = [];

        rows.forEach((row, index) => {
          // Skip empty rows
          if (row.length === 0 || !row[0]) return;

          // Mapping based on template order
          // 0: Company, 1: Staff, 2: Desc, 3: Amount, 4: Currency, 5: BillDate, 6: DueDate, 7: Cat, 8: Sub
          
          const companyName = row[0];
          const staffName = row[1];
          const amount = parseFloat(row[3]);
          const dueDate = parseDate(row[6]);

          if (!companyName || !staffName || isNaN(amount) || !dueDate) {
            rowErrors.push(`Row ${index + 2}: Missing required fields (Company, Staff, Amount, or Due Date)`);
            return;
          }

          const bill: Bill = {
            id: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            companyName: String(companyName).trim(),
            staffName: String(staffName).trim(),
            description: row[2] ? String(row[2]) : '',
            amount: amount,
            currency: String(row[4]).toUpperCase() === 'MVR' ? 'MVR' : 'USD',
            billDate: parseDate(row[5]),
            dueDate: dueDate,
            status: PaymentStatus.PENDING, // Default to pending, App.tsx will recalc if overdue
            category: row[7] ? String(row[7]) : 'Other',
            subcategory: row[8] ? String(row[8]) : ''
          };

          parsedBills.push(bill);
        });

        if (rowErrors.length > 0) {
          setError(`Found errors in ${rowErrors.length} rows. First error: ${rowErrors[0]}`);
          setPreviewData([]);
        } else if (parsedBills.length === 0) {
          setError("No valid data found in file.");
          setPreviewData([]);
        } else {
          setPreviewData(parsedBills);
          setSuccessMsg(`Successfully parsed ${parsedBills.length} bills. Ready to upload.`);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to parse Excel file. Please ensure it matches the template.");
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleUpload = () => {
    if (previewData.length > 0) {
      onBulkSubmit(previewData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Bills</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Step 1: Template */}
        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
          <Download className="text-blue-600 mt-1 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900">Step 1: Download Template</h3>
            <p className="text-sm text-blue-700 mb-2">Use our standardized Excel format to ensure your data is imported correctly.</p>
            <button 
              onClick={handleDownloadTemplate}
              className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <FileSpreadsheet size={14} /> Download .xlsx
            </button>
          </div>
        </div>

        {/* Step 2: Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center">
            <UploadCloud size={48} className="text-gray-400 mb-2" />
            <p className="text-lg font-medium text-gray-700">
              {file ? file.name : "Drop your Excel file here"}
            </p>
            <p className="text-sm text-gray-500">
              {file ? "Click to change file" : "or click to browse"}
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm">
            <CheckCircle size={16} />
            {successMsg}
          </div>
        )}

        {/* Preview Summary */}
        {previewData.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
              Preview (First 3 entries)
            </div>
            <div className="divide-y divide-gray-100">
              {previewData.slice(0, 3).map((bill, idx) => (
                <div key={idx} className="px-4 py-2 text-sm flex justify-between">
                  <span>{bill.staffName} ({bill.companyName})</span>
                  <span className="font-mono">{bill.currency === 'USD' ? '$' : 'MVR'} {bill.amount}</span>
                </div>
              ))}
              {previewData.length > 3 && (
                <div className="px-4 py-2 text-xs text-gray-400 italic text-center">
                  + {previewData.length - 3} more items...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={previewData.length === 0}
            className={`px-6 py-2.5 font-medium rounded-lg shadow-sm transition-all flex items-center gap-2 ${
              previewData.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Upload {previewData.length > 0 ? `${previewData.length} Bills` : ''}
          </button>
        </div>

      </div>
    </div>
  );
};
