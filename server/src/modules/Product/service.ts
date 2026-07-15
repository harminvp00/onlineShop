import prisma from "../../config/prisma.js";

// Helper function to capitalize category name
const formatCategoryName = (name: string) => {
  if (!name) return "General";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

export const getProducts = async (filters: { search?: string; category?: string }) => {
  const whereClause: any = {};

  if (filters.search) {
    whereClause.OR = [
      { productName: { contains: filters.search, mode: "insensitive" } },
      { productDescription: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.category) {
    const formattedCatName = formatCategoryName(filters.category);
    whereClause.category = {
      categoryName: formattedCatName,
    };
  }

  return prisma.product.findMany({
    where: whereClause,
    include: {
      category: true,
    },
    orderBy: {
      productId: "desc",
    },
  });
};

export const createProduct = async (data: {
  productName: string;
  productDescription: string;
  originalPrice: number;
  sellingPrice?: number | null;
  imageUrl: string;
  stock: number;
  categoryName: string;
}) => {
  const formattedCatName = formatCategoryName(data.categoryName);

  // Find or create category
  let category = await prisma.category.findUnique({
    where: { categoryName: formattedCatName },
  });

  if (!category) {
    category = await prisma.category.create({
      data: { categoryName: formattedCatName },
    });
  }

  return prisma.product.create({
    data: {
      productName: data.productName,
      productDescription: data.productDescription,
      originalPrice: data.originalPrice,
      sellingPrice: data.sellingPrice || null,
      imageUrl: data.imageUrl,
      stock: data.stock,
      categoryId: category.categoryId,
    },
    include: {
      category: true,
    },
  });
};

export const updateProduct = async (
  productId: number,
  data: {
    productName?: string;
    productDescription?: string;
    originalPrice?: number;
    sellingPrice?: number | null;
    imageUrl?: string;
    stock?: number;
    categoryName?: string;
  }
) => {
  let categoryId: number | undefined;

  if (data.categoryName) {
    const formattedCatName = formatCategoryName(data.categoryName);
    let category = await prisma.category.findUnique({
      where: { categoryName: formattedCatName },
    });

    if (!category) {
      category = await prisma.category.create({
        data: { categoryName: formattedCatName },
      });
    }
    categoryId = category.categoryId;
  }

  return prisma.product.update({
    where: { productId },
    data: {
      productName: data.productName,
      productDescription: data.productDescription,
      originalPrice: data.originalPrice,
      sellingPrice: data.sellingPrice,
      imageUrl: data.imageUrl,
      stock: data.stock,
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      category: true,
    },
  });
};

export const deleteProduct = async (productId: number) => {
  return prisma.product.delete({
    where: { productId },
  });
};

export const syncDummyProducts = async () => {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=50");
    if (!response.ok) {
      throw new Error(`Failed to fetch dummy products: ${response.statusText}`);
    }

    const result = await response.json();
    const dummyProducts = result.products || [];

    const syncedProducts = [];

    for (const item of dummyProducts) {
      const formattedCatName = formatCategoryName(item.category);

      // 1. Find or create category
      let category = await prisma.category.findUnique({
        where: { categoryName: formattedCatName },
      });

      if (!category) {
        category = await prisma.category.create({
          data: { categoryName: formattedCatName },
        });
      }

      // 2. Check if product already exists by title
      const existingProduct = await prisma.product.findFirst({
        where: { productName: item.title },
      });

      const originalPrice = parseFloat(item.price);
      const discount = parseFloat(item.discountPercentage || 0);
      const sellingPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;

      if (existingProduct) {
        // Update product
        const updated = await prisma.product.update({
          where: { productId: existingProduct.productId },
          data: {
            productDescription: item.description || existingProduct.productDescription,
            originalPrice: originalPrice,
            sellingPrice: parseFloat(sellingPrice.toFixed(2)),
            imageUrl: item.thumbnail || item.images[0] || existingProduct.imageUrl,
            stock: item.stock || existingProduct.stock,
            categoryId: category.categoryId,
          },
        });
        syncedProducts.push(updated);
      } else {
        // Create product
        const created = await prisma.product.create({
          data: {
            productName: item.title,
            productDescription: item.description,
            originalPrice: originalPrice,
            sellingPrice: parseFloat(sellingPrice.toFixed(2)),
            imageUrl: item.thumbnail || item.images[0] || "https://placehold.co/300x300?text=No+Image",
            stock: item.stock || 10,
            categoryId: category.categoryId,
          },
        });
        syncedProducts.push(created);
      }
    }

    return syncedProducts;
  } catch (error) {
    console.error("Error in syncDummyProducts service:", error);
    throw error;
  }
};
