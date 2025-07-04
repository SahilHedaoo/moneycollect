// bankapp/src/utils/phoneUtils.js

/**
 * Removes any dial code prefix from a phone number.
 * @param {string} phone - Full phone number including dial code
 * @returns {string} - Phone number without any country code
 */
export const extractRawPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/^\+?\d{1,4}/, ''); // removes +91, +1, etc.
};
