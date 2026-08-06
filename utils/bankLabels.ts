import { BankDetails } from '@/types/bank';

export type BankFormErrors = Partial<Record<keyof BankDetails, string>>;

export function maskAccountNumber(accountNumber: string) {
  const digits = accountNumber.replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  return `•••• •••• ${digits.slice(-4)}`;
}

export function validateBankForm(data: BankDetails, isAdd: boolean): BankFormErrors {
  const errors: BankFormErrors = {};

  if (!data.accountHolderName.trim() || data.accountHolderName.trim().length < 2) {
    errors.accountHolderName = 'Enter the account holder name';
  }

  const accountDigits = data.accountNumber.replace(/\D/g, '');
  if (!/^\d{9,18}$/.test(accountDigits)) {
    errors.accountNumber = 'Enter a valid account number';
  }

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(data.ifscCode.trim())) {
    errors.ifscCode = 'Enter a valid IFSC code';
  }

  if (isAdd && !data.upiId.trim()) {
    errors.upiId = 'UPI ID is required';
  } else if (data.upiId.trim() && !/^[\w.-]+@[\w.-]+$/.test(data.upiId.trim())) {
    errors.upiId = 'Enter a valid UPI ID';
  }

  return errors;
}
