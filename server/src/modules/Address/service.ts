import prisma from "../../config/prisma.js";

export const getAddressesByCustomer = async (customerId: number) => {
  return prisma.address.findMany({
    where: { customerId },
    orderBy: { id: "asc" },
  });
};

export const createAddress = async (
  customerId: number,
  data: {
    addressLine: string;
    city: string;
    state: string;
    country?: string;
    addressType: string;
    postalCode?: string | null;
  }
) => {
  return prisma.address.create({
    data: {
      customerId,
      addressLine: data.addressLine,
      city: data.city,
      state: data.state,
      country: data.country || "INDIA",
      addressType: data.addressType,
      postalCode: data.postalCode || null,
    },
  });
};

export const updateAddress = async (
  addressId: number,
  customerId: number,
  data: {
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    addressType?: string;
    postalCode?: string | null;
  }
) => {
  // Verify ownership before updating
  const address = await prisma.address.findFirst({
    where: { id: addressId, customerId },
  });

  if (!address) {
    throw new Error("Address not found or unauthorized");
  }

  return prisma.address.update({
    where: { id: addressId },
    data: {
      addressLine: data.addressLine !== undefined ? data.addressLine : address.addressLine,
      city: data.city !== undefined ? data.city : address.city,
      state: data.state !== undefined ? data.state : address.state,
      country: data.country !== undefined ? data.country : address.country,
      addressType: data.addressType !== undefined ? data.addressType : address.addressType,
      postalCode: data.postalCode !== undefined ? data.postalCode : address.postalCode,
    },
  });
};

export const deleteAddress = async (addressId: number, customerId: number) => {
  // Verify ownership before deleting
  const address = await prisma.address.findFirst({
    where: { id: addressId, customerId },
  });

  if (!address) {
    throw new Error("Address not found or unauthorized");
  }

  return prisma.address.delete({
    where: { id: addressId },
  });
};
