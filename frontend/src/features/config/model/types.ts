export interface ValidationInfo {
  isValid: boolean;
  hostCount: number;
  firstHost: string;
  lastHost: string;
  error?: {
    octetIndex: number;
    suggestion: {
      lower: number;
      upper: number;
    };
  };
}