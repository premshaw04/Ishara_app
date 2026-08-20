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
  otp: yup.string().length(6, 'OTP must be exactly 6 digits').required('OTP is required'),
});

export const resetPasswordSchema = yup.object().shape({
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

export const editProfileSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  bio: yup.string().max(160, 'Bio must be at most 160 characters'),
  phoneNumber: yup.string().matches(/^[0-9+]*$/, 'Phone number must only contain numbers and +').max(15, 'Phone number is too long'),
});
