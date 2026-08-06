export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  /** Legacy — kept for older saved profiles; not shown in UI. */
  upiId?: string;
  panNumber?: string;
}

export function hasBankDetails(details?: BankDetails | null | Record<string, unknown>) {
  return Boolean(details && typeof details === 'object' && 'accountNumber' in details && details.accountNumber);
}
