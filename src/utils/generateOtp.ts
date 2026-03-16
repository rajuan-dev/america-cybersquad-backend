// generate 6-digit OTP
export const generateOtp = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return otp.toString();
};