export enum EmploymentType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
  INTERNSHIP = 'Internship'
}

export interface EmployeeData {
  id: string;
  submissionDate: string;
  
  // Personal
  fullName: string;
  gender: string;
  dob: string;
  stateOfOrigin: string;
  lga: string;
  nationality: string;
  maritalStatus: string;
  phone: string;
  email: string;
  address: string;
  
  // Next of Kin
  nokName: string;
  nokRelationship: string;
  nokPhone: string;
  nokAddress: string;

  // Employment
  position: string;
  department: string;
  employmentType: EmploymentType;
  startDate: string;
  salary: string;
  
  // Referees & Guarantors
  refereeName: string;
  refereePhone: string;
  refereeAddress: string;
  guarantorName: string;
  guarantorPhone: string;
  guarantorOccupation: string;
  guarantorAddress: string;

  // Identification
  bvn: string;
  nin: string;
  bankName: string;
  accountNumber: string;
  
  // History
  hasPreviousEmployer: 'Yes' | 'No';
  previousEmployerName?: string;
  reasonForLeaving?: string;
  hasCriminalRecord: 'Yes' | 'No';
  criminalExplanation?: string;

  // Documents (Base64 strings for demo storage)
  passportPhoto?: string;
}

export const DEPARTMENTS = [
  'Management',
  'Bar & Service',
  'Kitchen / Culinary',
  'Security',
  'Logistics',
  'Cleaning & Maintenance',
  'Marketing'
];