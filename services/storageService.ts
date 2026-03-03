import { EmployeeData } from '../types';

const STORAGE_KEY = 'ox_lounge_db';

export const saveEmployee = (data: EmployeeData): void => {
  try {
    const existing = getEmployees();
    // Check if ID already exists to prevent duplicates on re-import
    const index = existing.findIndex(e => e.id === data.id);
    let updated;
    if (index >= 0) {
      updated = [...existing];
      updated[index] = data;
    } else {
      updated = [data, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Storage limit reached or error", error);
    alert("Storage limit reached. In a real app, this would upload to the cloud.");
  }
};

export const getEmployees = (): EmployeeData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const deleteEmployee = (id: string): void => {
  const existing = getEmployees();
  const updated = existing.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const downloadEmployeeJSON = (data: EmployeeData) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  // Official specific name to distinguish from PDF
  link.download = `OX_DIGITAL_RECORD_${data.fullName.replace(/\s+/g, "_")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};