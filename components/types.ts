// types.ts

export interface RecruitmentData {
  candidate: {
    name: string;
    furigana: string;
  };
  employment: {
    joiningDate: string;
    department: string;
    position: string;
    employmentType: string;
    probationPeriod: string;
    workLocation: string;
    workHours: string;
  };
  salary: {
    probation: SalaryBreakdown;
    official: SalaryBreakdown;
    bonusStats: string;
    annualIncome: number;
  };
  approvalRequest: {
    applicationDate: string;
    applicantName: string;
    recruitmentRoute: string;
    interviewers: string[];
    recruitmentFee: number;
    notes: string;
  };
  notification: {
    issueDate: string;
    companyRep: string;
  };
}

export interface SalaryBreakdown {
  basic: number;
  allowances: {
    name: string;
    amount: number;
  }[];
  totalMonthly: number;
  commutingAllowance: string;
}