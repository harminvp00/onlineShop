import prisma from "../../config/prisma.js";

export const getCategories = async () => {
  return prisma.category.findMany({
    orderBy: { categoryName: "asc" },
  });
};
