export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
}

export function hasBankDetails(details?: BankDetails | null | Record<string, unknown>) {
  return Boolean(details && typeof details === 'object' && 'accountNumber' in details && details.accountNumber);
}
