import { prisma } from "../prisma/client";
import {
  colors,
  designCategories,
  designSubcategories,
  designTags,
  designs,
} from "./seedData";

export async function erase() {
  await prisma.design.deleteMany();
  await prisma.designSubcategory.deleteMany();
  await prisma.designCategory.deleteMany();
  await prisma.designTag.deleteMany();
  await prisma.color.deleteMany();
}

async function createColors() {
  for (const color of colors) {
    await prisma.color.create({
      data: {
        hexCode: color.hexCode,
        name: color.name,
      },
    });
  }
}

async function createTags() {
  for (const tag of designTags) {
    await prisma.designTag.create({
      data: {
        name: tag.name,
      },
    });
  }
}

async function createDesignCategories() {
  for (const cat of designCategories) {
    await prisma.designCategory.create({
      data: {
        name: cat.name,
        designType: {
          connect: {
            id: cat.designTypeId,
          },
        },
      },
    });
  }
}

async function createDesignSubcategories() {
  for (const subcat of designSubcategories) {
    await prisma.designSubcategory.create({
      data: {
        name: subcat.name,
        designCategory: {
          connect: {
            name: subcat.category,
          },
        },
      },
    });
  }
}

async function createDesigns() {
  for (const design of designs) {
    try {
      const subcategoryIds = [];
      for (const subcat of design.subcategories) {
        const foundSubcat = await prisma.designSubcategory.findFirst({
          where: { name: subcat },
        });
        if (foundSubcat) subcategoryIds.push(foundSubcat.id);
      }
      await prisma.design.create({
        data: {
          designNumber: design.designNumber,
          date: design.date,
          description: design.description,
          designSubcategories: {
            connect: subcategoryIds.map((id) => ({ id })),
          },
          designTags: {
            connect: design.tags.map((tag) => ({ name: tag })),
          },
          designType: {
            connect: {
              id: design.designTypeId,
            },
          },
          featured: design.featured,
          name: design.name,
          status: design.status,
          defaultBackgroundColor: {
            connect: {
              name: design.defaultBackgroundColor,
            },
          },
          imageUrl: design.imageUrl,
        },
      });
    } catch (error) {
      console.error(
        `Failed to seed design number ${design.designNumber}`,
        error
      );
    }
  }
}

export async function seed() {
  // await createImages();
  await createColors();
  await createTags();
  await createDesignCategories();
  await createDesignSubcategories();
  await createDesigns();
}
