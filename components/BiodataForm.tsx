import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Upload, Save, CheckCircle, AlertCircle, FileJson, Share2 } from 'lucide-react';
import { Input, Select } from './ui/Input';
import { EmployeeData, EmploymentType, DEPARTMENTS } from '../types';
import { fileToBase64, saveEmployee, downloadEmployeeJSON } from '../services/storageService';
import { generateBiodataPDF } from '../services/pdfService';

const SectionTitle: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <h3 className="text-xl font-serif text-ox-gold border-b border-ox-gold/30 pb-2 mb-6 mt-8">
    {children}
  </h3>
);

interface BiodataFormProps {
  initialData?: EmployeeData;
  onSuccess?: (data: EmployeeData) => void;
  isEditMode?: boolean;
}

export const BiodataForm: React.FC<BiodataFormProps> = ({ initialData, onSuccess, isEditMode = false }) => {
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors, isSubmitting } } = useForm<EmployeeData>({
    defaultValues: initialData
  });
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<EmployeeData | null>(null);

  const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setValue('passportPhoto', base64);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const validateStep = async (currentStep: number) => {
    let isValid = false;
    if (currentStep === 1) {
      // Validate Personal Info
      isValid = await trigger([
        'fullName', 'gender', 'dob', 'nationality', 
        'phone', 'email', 'address', 
        'nokName', 'nokPhone'
      ]);
    } else if (currentStep === 2) {
      // Validate Employment Info
      isValid = await trigger(['position', 'department', 'employmentType']);
    } else {
      isValid = true;
    }
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const onSubmit: SubmitHandler<EmployeeData> = async (data) => {
    try {
      const finalData = {
        ...data,
        id: initialData?.id || `OX-${Date.now().toString().slice(-6)}`,
        submissionDate: initialData?.submissionDate || new Date().toISOString()
      };
      
      // Save to "Database" (Local Storage)
      saveEmployee(finalData);
      setSubmittedData(finalData);
      
      if (isEditMode && onSuccess) {
        onSuccess(finalData);
        return;
      }
      
      // Generate PDF
      generateBiodataPDF(finalData);
      
      setSuccess(true);
      window.scrollTo(0,0);
    } catch (error: any) {
      console.error("Submission Error:", error);
      alert(`Error generating PDF or saving data: ${error.message}`);
    }
  };

  const onError = (errors: any) => {
    console.log("Validation Errors:", errors);
    alert("Please check the form. Some required fields are missing or invalid.");
  };

  const handleDownloadRecord = () => {
    if (submittedData) {
      downloadEmployeeJSON(submittedData);
    }
  };

  if (success && submittedData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-6 bg-ox-card border border-ox-gold/30 rounded-xl mt-10 shadow-2xl">
        <div className="mb-8">
           <CheckCircle className="w-24 h-24 text-ox-gold mx-auto mb-6 animate-pulse" />
           <h2 className="text-4xl font-serif text-white mb-2">Form Submitted!</h2>
           <p className="text-gray-400">Your Biodata PDF has been generated successfully.</p>
        </div>

        <div className="bg-gradient-to-br from-ox-input to-black p-8 rounded-xl border border-ox-gold/40 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-ox-gold/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <h3 className="text-ox-gold font-bold text-xl mb-4 flex items-center gap-3">
            <Share2 size={24} /> IMPORTANT: Send Data to Admin
          </h3>
          
          <p className="text-gray-300 text-base mb-6 leading-relaxed">
            To complete your employment process, you must send the <strong>Digital Record File</strong> to the Admin. 
            <br/><br/>
            <span className="text-red-400 font-bold block bg-red-900/20 p-2 rounded border-l-4 border-red-500">
               ⚠️ DO NOT send the PDF. The Admin system only reads the Digital Record File (.json).
            </span>
          </p>

          <button 
            onClick={handleDownloadRecord}
            className="w-full bg-white text-ox-black hover:bg-ox-gold px-6 py-4 rounded font-bold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg"
          >
            <FileJson size={24} />
            DOWNLOAD DIGITAL RECORD (.json)
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            Click above to download, then share the file via WhatsApp/Email.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
            <button 
              onClick={() => window.location.reload()}
              className="text-gray-500 hover:text-white transition underline text-sm"
            >
              Start New Form
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif text-ox-gold mb-2">
          {isEditMode ? 'Edit Staff Record' : 'Employee Biodata'}
        </h2>
        <p className="text-gray-500 uppercase tracking-widest text-sm">
          {isEditMode ? `Editing: ${initialData?.fullName}` : 'Official Record Form'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="bg-ox-card p-8 rounded-xl border border-ox-gold/20 shadow-2xl">
        
        {/* Step 1: Personal */}
        <div className={step === 1 ? 'block' : 'hidden'}>
          <SectionTitle>Personal Information</SectionTitle>
          <div className="grid md:grid-cols-2 gap-6">
             {/* Photo Upload Area */}
            <div className="md:col-span-2 flex justify-center mb-6">
              <div className="text-center">
                <div className="w-32 h-32 bg-ox-input border-2 border-dashed border-ox-gold rounded-full flex items-center justify-center overflow-hidden mx-auto mb-3">
                  {watch('passportPhoto') ? (
                    <img src={watch('passportPhoto')} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="text-gray-500" />
                  )}
                </div>
                <label className="cursor-pointer text-ox-gold text-sm font-bold hover:underline">
                  Upload Passport
                  <input type="file" accept="image/*" className="hidden" onChange={handlePassportUpload} />
                </label>
              </div>
            </div>

            <Input label="Full Name" {...register("fullName", { required: "Required" })} error={errors.fullName?.message} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Gender" options={["Male", "Female"]} {...register("gender", { required: true })} error={errors.gender ? "Required" : undefined} />
              <Input label="Date of Birth" type="date" {...register("dob", { required: true })} error={errors.dob ? "Required" : undefined} />
            </div>
            <Input label="Nationality" {...register("nationality", { required: true })} error={errors.nationality ? "Required" : undefined} />
            <div className="grid grid-cols-2 gap-4">
               <Input label="State of Origin" {...register("stateOfOrigin")} />
               <Input label="LGA" {...register("lga")} />
            </div>
            <Select label="Marital Status" options={["Single", "Married", "Divorced"]} {...register("maritalStatus")} />
            <Input label="Phone Number" {...register("phone", { required: true })} error={errors.phone ? "Required" : undefined} />
            <Input label="Email Address" type="email" {...register("email", { required: true })} error={errors.email ? "Required" : undefined} />
            <Input label="Home Address" className="md:col-span-2" {...register("address", { required: true })} error={errors.address ? "Required" : undefined} />
          </div>

          <SectionTitle>Next of Kin</SectionTitle>
          <div className="grid md:grid-cols-2 gap-6">
             <Input label="Full Name" {...register("nokName", { required: true })} error={errors.nokName ? "Required" : undefined} />
             <Select label="Relationship" options={["Spouse", "Parent", "Sibling", "Child", "Relative"]} {...register("nokRelationship")} />
             <Input label="Phone Number" {...register("nokPhone", { required: true })} error={errors.nokPhone ? "Required" : undefined} />
             <Input label="Address" {...register("nokAddress")} />
          </div>

          <div className="mt-8 flex justify-end">
            <button type="button" onClick={handleNext} className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200 transition">Next Step</button>
          </div>
        </div>

        {/* Step 2: Employment */}
        <div className={step === 2 ? 'block' : 'hidden'}>
          <SectionTitle>Employment Information</SectionTitle>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Position Applying For" {...register("position", { required: true })} error={errors.position ? "Required" : undefined} />
            <Select label="Department" options={DEPARTMENTS} {...register("department", { required: true })} error={errors.department ? "Required" : undefined} />
            <Select label="Employment Type" options={Object.values(EmploymentType)} {...register("employmentType", { required: true })} error={errors.employmentType ? "Required" : undefined} />
            <Input label="Start Date" type="date" {...register("startDate")} />
            <Input label="Monthly Salary Expectations" {...register("salary")} />
          </div>

          <SectionTitle>References</SectionTitle>
          <div className="grid md:grid-cols-2 gap-6">
             <Input label="Referee Name" {...register("refereeName")} />
             <Input label="Referee Phone" {...register("refereePhone")} />
             <Input label="Guarantor Name" {...register("guarantorName")} />
             <Input label="Guarantor Phone" {...register("guarantorPhone")} />
             <Input label="Guarantor Occupation" {...register("guarantorOccupation")} />
          </div>

          <div className="mt-8 flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-white transition">Back</button>
            <button type="button" onClick={handleNext} className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200 transition">Next Step</button>
          </div>
        </div>

        {/* Step 3: Legal & Submit */}
        <div className={step === 3 ? 'block' : 'hidden'}>
           <SectionTitle>Identification & Legal</SectionTitle>
           <div className="grid md:grid-cols-2 gap-6">
              <Input label="BVN" {...register("bvn")} />
              <Input label="NIN" {...register("nin")} />
              <Input label="Bank Name" {...register("bankName")} />
              <Input label="Account Number" {...register("accountNumber")} />
           </div>

           <div className="mt-6 space-y-4">
              <div className="p-4 bg-ox-input rounded">
                 <label className="text-sm font-bold text-gray-300 mb-2 block">Previous Employer?</label>
                 <div className="flex gap-4 mb-3">
                   <label className="flex items-center gap-2"><input type="radio" value="Yes" {...register("hasPreviousEmployer")} /> Yes</label>
                   <label className="flex items-center gap-2"><input type="radio" value="No" {...register("hasPreviousEmployer")} /> No</label>
                 </div>
                 {watch("hasPreviousEmployer") === "Yes" && (
                    <div className="grid gap-3">
                       <Input label="Employer Name" {...register("previousEmployerName")} />
                       <Input label="Reason for Leaving" {...register("reasonForLeaving")} />
                    </div>
                 )}
              </div>

              <div className="p-4 bg-ox-input rounded">
                 <label className="text-sm font-bold text-gray-300 mb-2 block">Criminal Record?</label>
                 <div className="flex gap-4 mb-3">
                   <label className="flex items-center gap-2"><input type="radio" value="Yes" {...register("hasCriminalRecord")} /> Yes</label>
                   <label className="flex items-center gap-2"><input type="radio" value="No" {...register("hasCriminalRecord")} /> No</label>
                 </div>
                 {watch("hasCriminalRecord") === "Yes" && (
                    <Input label="Please Explain" {...register("criminalExplanation")} />
                 )}
              </div>
           </div>

           <div className="mt-8 pt-8 border-t border-gray-800 flex justify-between items-center">
            <button type="button" onClick={() => setStep(2)} className="text-gray-400 hover:text-white transition">Back</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-ox-gold text-ox-black px-8 py-3 rounded font-bold hover:bg-yellow-500 transition shadow-lg shadow-ox-gold/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : <><Save size={18} /> {isEditMode ? 'Save Changes' : 'Submit & Download PDF'}</>}
            </button>
          </div>
          
          {/* Error summary for visual feedback */}
          {Object.keys(errors).length > 0 && (
             <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm flex items-center gap-2 justify-center">
               <AlertCircle size={16} /> There are errors in the form. Please check previous steps.
             </div>
          )}
        </div>

      </form>
    </div>
  );
};
