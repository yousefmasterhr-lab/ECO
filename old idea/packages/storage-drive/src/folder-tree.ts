export interface DriveFolderDescriptor {
  name: string;
  departmentCode: '01_Legal' | '02_Engineering' | '03_Insurance' | '04_ATS' | '05_CTS';
  description: string;
}

export const STANDARD_DEPARTMENT_FOLDERS: DriveFolderDescriptor[] = [
  { name: '01_Legal', departmentCode: '01_Legal', description: 'Litigation, Hearings, Contracts & Official Powers of Attorney' },
  { name: '02_Engineering', departmentCode: '02_Engineering', description: 'Shop Drawings, Site Permits, BOQ & RFI Submittals' },
  { name: '03_Insurance', departmentCode: '03_Insurance', description: 'Social Insurance Forms (1, 2, 6) & Employee Files' },
  { name: '04_ATS', departmentCode: '04_ATS', description: 'Candidate Resumes, Evaluation Files & Offer Letters' },
  { name: '05_CTS', departmentCode: '05_CTS', description: 'Official Inbound & Outbound Correspondence Scans' }
];

export class DriveFolderTreeBuilder {
  public static getSubfolderPath(companyName: string, departmentCode: string, subPath?: string): string {
    const cleanCompany = companyName.replace(/[\/\\:*?"<>|]/g, '_');
    return subPath 
      ? `ERP_ROOT_VAULT/${cleanCompany}/${departmentCode}/${subPath}`
      : `ERP_ROOT_VAULT/${cleanCompany}/${departmentCode}`;
  }
}
