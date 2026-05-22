// export interface ValidationInfo {
//   isValid: boolean;
//   hostCount: number;
//   firstHost: string;
//   lastHost: string;
//   error?: {
//     octetIndex: number;
//     suggestion: {
//       lower: number;
//       upper: number;
//     };
//   };
// }

type ValidationSuccess = {
  isValid: true;
  hostCount: number;
  firstHost: string;
  lastHost: string;
};

type ValidationError = {
  isValid: false;
  error: {
    octetIndex: number;
    suggestion: {
      lower: number;
      upper: number;
    };
  };
};

export type ValidationResult = ValidationSuccess | ValidationError;
