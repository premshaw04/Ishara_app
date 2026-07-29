import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const registerSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
});

export const otpSchema = yup.object().shape({
  otp: yup.string().length(4, 'OTP must be exactly 4 digits').required('OTP is required'),
});

export const resetPasswordSchema = yup.object().shape({
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});
