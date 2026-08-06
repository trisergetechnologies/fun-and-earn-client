import { BankDetails } from '@/types/bank';

export type BankFormErrors = Partial<Record<keyof BankDetails, string>>;

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export function maskAccountNumber(accountNumber: string) {
  const digits = accountNumber.replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  return `•••• •••• ${digits.slice(-4)}`;
}

export function validateBankForm(data: BankDetails, _isAdd: boolean): BankFormErrors {
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

  const pan = (data.panNumber || '').trim().toUpperCase();
  if (pan && !PAN_REGEX.test(pan)) {
    errors.panNumber = 'Enter a valid PAN (e.g. ABCDE1234F)';
  }

  return errors;
}
