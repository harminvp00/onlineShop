import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";

interface CreateUserDto {
  username: string;
  email: string;
  phoneNumber?: string | null;
  password?: string;
}

export const createUser = async (data: CreateUserDto) => {
  // Check if customer already exists
  const existingUser = await prisma.customer.findUnique({
    where: { emailAddress: data.email },
  });

  if (existingUser) {
    throw new Error("Email address is already registered");
  }

  // Hash password if provided
  let hashedPassword = null;
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 10);
  }

  const response = await prisma.customer.create({
    data: {
      name: data.username,
      emailAddress: data.email,
      phoneNumber: data.phoneNumber,
      passwordHash: hashedPassword,
    },
  });

  return response;
};

export const verifyUser = async (email: string, password?: string) => {
  if (!password) {
    throw new Error("Password is required");
  }

  const customer = await prisma.customer.findUnique({
    where: { emailAddress: email },
  });

  if (!customer) {
    throw new Error("Invalid email or password");
  }

  if (!customer.passwordHash) {
    throw new Error("This account is configured for Google sign-in. Please use Google Login.");
  }

  const isPasswordMatch = await bcrypt.compare(password, customer.passwordHash);
  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  return {
    id: customer.id,
    name: customer.name,
    emailAddress: customer.emailAddress,
    phoneNumber: customer.phoneNumber,
    avatarUrl: customer.avatarUrl,
  };
};

interface GoogleUserDto {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export const findOrCreateGoogleUser = async (data: GoogleUserDto) => {
  // 1. Try to find user by googleId
  let customer = await prisma.customer.findUnique({
    where: { googleId: data.googleId },
  });

  if (customer) {
    // Update avatar or name if changed
    if (customer.avatarUrl !== data.avatarUrl || customer.name !== data.name) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: data.name,
          avatarUrl: data.avatarUrl,
        },
      });
    }
    return customer;
  }

  // 2. Try to find user by email address (link accounts)
  customer = await prisma.customer.findUnique({
    where: { emailAddress: data.email },
  });

  if (customer) {
    // Link Google OAuth to existing account
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        googleId: data.googleId,
        avatarUrl: data.avatarUrl || customer.avatarUrl,
      },
    });
    return customer;
  }

  // 3. Create new user if not found
  customer = await prisma.customer.create({
    data: {
      name: data.name,
      emailAddress: data.email,
      googleId: data.googleId,
      avatarUrl: data.avatarUrl,
      passwordHash: null,
    },
  });

  return customer;
};

export const updateProfile = async (
  customerId: number,
  data: { name?: string; phoneNumber?: string | null }
) => {
  return prisma.customer.update({
    where: { id: customerId },
    data: {
      name: data.name,
      phoneNumber: data.phoneNumber,
    },
    select: {
      id: true,
      name: true,
      emailAddress: true,
      phoneNumber: true,
      avatarUrl: true,
    },
  });
};