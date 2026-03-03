import React, { useEffect, useState, useRef } from 'react';
import { Search, Download, Trash2, Printer, Lock, MessageCircle, UploadCloud, FileWarning, FileText } from 'lucide-react';
import { getEmployees, deleteEmployee, saveEmployee } from '../services/storageService';
import { generateBiodataPDF, generateOfferLetterPDF } from '../services/pdfService';
import { EmployeeData } from '../types';

export const AdminDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [search, setSearch] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setEmployees(getEmployees());
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '195387') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid Password');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      deleteEmployee(id);
      setEmployees(getEmployees());
    }
  };

  const handleWhatsAppOffer = (emp: EmployeeData) => {
    // 1. Generate and Download the PDF Letter
    generateOfferLetterPDF(emp);

    // 2. Prepare WhatsApp Message
    const letter = `Dear ${emp.fullName},\n\nCongratulations! We are pleased to offer you the position of *${emp.position}* at OX LOUNGE.\n\nPlease find attached your official Employment Offer Letter PDF.\n\nWelcome to the team!\n\nBest regards,\nManagement`;

    // 3. Open WhatsApp
    let phone = emp.phone.replace(/\D/g, ''); // Remove non-digits
    if (phone.startsWith('0')) {
      phone = '234' + phone.substring(1);
    }

    // Create WhatsApp Link
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(letter)}`;
    
    // Slight delay to ensure PDF download starts visibility before tab switch
    setTimeout(() => {
        window.open(url, '_blank');
    }, 500);
  };

  // Handle File Import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check for PDF and warn
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      alert("⚠️ INCORRECT FILE TYPE\n\nThe Admin Dashboard cannot read the PDF document directly.\n\nPlease import the 'DIGITAL RECORD FILE' (.json) that the staff downloaded.\n\nThis file contains the digital data needed to generate the employment letter.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json);
        
        if (data.id && data.fullName) {
            saveEmployee(data);
            setEmployees(getEmployees());
            alert(`✅ Successfully imported record for: ${data.fullName}`);
        } else {
            alert("Invalid file format: Missing ID or Name.");
        }
      } catch (err) {
        console.error(err);
        alert("Error parsing file. Please ensure you are uploading the valid JSON record file, not a PDF or Image.");
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const filtered = employees.filter(e => 
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    // Simple CSV export for demo
    const headers = "ID,Name,Position,Department,Phone,Email\n";
    const rows = filtered.map(e => `${e.id},"${e.fullName}",${e.position},${e.department},${e.phone},${e.email}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OX_STAFF_EXPORT_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <form onSubmit={handleLogin} className="bg-ox-card p-8 rounded-xl border border-ox-gold/30 text-center w-full max-w-sm">
          <div className="w-16 h-16 bg-ox-gold rounded-full flex items-center justify-center mx-auto mb-6 text-ox-black">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-serif text-white mb-6">Admin Access</h2>
          <input 
            type="password" 
            placeholder="Enter Admin Password" 
            className="w-full bg-ox-input border border-gray-700 rounded p-3 text-white mb-4 text-center tracking-widest"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-ox-gold text-ox-black font-bold py-3 rounded hover:bg-yellow-500 transition">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-serif text-white">Staff Records</h2>
           <p className="text-gray-500">Manage biodata submissions and offers.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json,application/json" 
            className="hidden" 
          />
          <button onClick={handleImportClick} className="flex items-center gap-2 bg-ox-gold text-ox-black font-bold px-4 py-2 rounded text-sm hover:bg-yellow-500 transition-colors shadow-lg shadow-ox-gold/20">
            <UploadCloud size={16} /> Import Record File
          </button>
          <button onClick={exportExcel} className="flex items-center gap-2 bg-ox-input border border-gray-700 hover:border-ox-gold px-4 py-2 rounded text-sm transition-colors">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-ox-input border border-gray-700 hover:border-ox-gold px-4 py-2 rounded text-sm transition-colors">
            <Printer size={16} /> Print List
          </button>
        </div>
      </div>

      <div className="bg-ox-card border border-ox-gold/10 rounded-xl overflow-hidden shadow-2xl">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-800 bg-ox-input/30">
           <div className="relative max-w-md">
             <Search className="absolute left-3 top-3 text-gray-500" size={18} />
             <input 
               type="text" 
               placeholder="Search by name or position..." 
               className="w-full bg-ox-input pl-10 pr-4 py-2 rounded text-white border-none focus:ring-1 focus:ring-ox-gold placeholder-gray-600"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-ox-dark text-ox-gold uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Staff ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Contact</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-4">
                            <UploadCloud size={48} className="text-gray-700" />
                            <p>No records found.</p>
                            <p className="text-xs max-w-md mx-auto">
                                To add a staff member, click <strong>"Import Record File"</strong> and select the <span className="font-mono text-ox-gold">.json</span> file sent by the staff member.<br/>
                                <span className="text-red-400 mt-2 block">Do not upload the PDF file.</span>
                            </p>
                        </div>
                    </td>
                </tr>
              ) : filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-ox-input/50 transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-500">{emp.id}</td>
                  <td className="p-4 text-white font-medium flex items-center gap-3">
                    {emp.passportPhoto ? (
                      <img src={emp.passportPhoto} className="w-10 h-10 rounded-full object-cover border border-ox-gold" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-ox-input border border-gray-700"></div>
                    )}
                    {emp.fullName}
                  </td>
                  <td className="p-4">
                    <span className="block text-gray-300 font-semibold">{emp.position}</span>
                    <span className="text-xs opacity-60 text-ox-gold">{emp.department}</span>
                  </td>
                  <td className="p-4 text-gray-400">{emp.phone}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleWhatsAppOffer(emp)}
                        className="p-2 text-green-500 bg-green-500/10 hover:bg-green-500/20 rounded transition-colors"
                        title="Generate Offer Letter PDF & Send to WhatsApp"
                      >
                        <MessageCircle size={18} />
                      </button>
                      
                      <button 
                        onClick={() => generateOfferLetterPDF(emp)}
                        className="p-2 text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 rounded transition-colors"
                        title="Download Offer Letter PDF Only"
                      >
                        <FileText size={18} />
                      </button>

                      <button 
                        onClick={() => generateBiodataPDF(emp)}
                        className="p-2 text-ox-gold bg-ox-gold/10 hover:bg-ox-gold/20 rounded transition-colors"
                        title="Download Biodata PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};