import prisma from "../../config/prisma.js";
export const createUser = async (data) => {
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
