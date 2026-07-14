import prisma from "../../config/prisma.js";

interface CreateUserDto {
  username: string;
  email: string;
  phoneNumber?: string | null;
  password?: string;
}

export const createUser = async (data: CreateUserDto) => {
  const response = await prisma.customer.create({
    data: {
      name: data.username,
      emailAddress: data.email,
      phoneNumber: data.phoneNumber,
      passwordHash: data.password || "",
    },
  });

  console.log(response);

  return response;
};