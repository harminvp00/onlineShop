import { z } from 'zod';
const nameValidation = z
    .string()
    .max(40, "")
    .min(3, "name require min 3 laters")
    .trim()
    .lowercase();
const emailValidation = z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase());
const passwordValidation = z
    .string()
    .trim()
    .min(6, 'password is to weak, use atleast 6 latters')
    .max(20, 'password can not be more longer than 20 latters');
const phoneNumber = z
    .string()
    .trim()
    .regex(/\d{10}/, 'only degits are allowed')
    .length(10, 'ten digit are required for phone number');
export const registerValidation = z.object({
    username: nameValidation,
    email: emailValidation,
    phoneNumber: phoneNumber,
    password: passwordValidation
});
export const loginValidation = z.object({
    email: emailValidation,
    password: passwordValidation
});
