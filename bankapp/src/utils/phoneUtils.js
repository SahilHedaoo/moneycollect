// bankapp/src/utils/phoneUtils.js
export const formatPhoneNumber = (dialCode, inputNumber) => {
  if (!inputNumber) return '';
  const cleaned = inputNumber.replace(/[^0-9]/g, '').replace(/^0+/, '');
  return `${dialCode} ${cleaned}`;
};

export const extractPhoneWithoutDialCode = (dial, fullPhone) => {
  if (!dial || !fullPhone) return '';
  const fullClean = fullPhone.replace(/[^0-9]/g, '');
  const dialDigits = dial.replace('+', '');
  let withoutDial = fullClean;

  if (fullClean.startsWith(dialDigits)) {
    withoutDial = fullClean.slice(dialDigits.length);
  }

  return withoutDial.replace(/^0+/, '');
};