//seed with real data from the design library, sampled on 2-7-24.

import { prisma } from "../prisma/client";
import { getSourceJson } from "../utility/spreadsheet";

const data = getSourceJson("./seed/Design Data 2-7-24.xlsx");

async function erase() {
  await prisma.design.deleteMany();
  await prisma.designSubcategory.deleteMany();
  await prisma.designCategory.deleteMany();
  await prisma.designTag.deleteMany();
  await prisma.color.deleteMany();
  await prisma.image.deleteMany();
}

async function createImages() {
  if (!data) return;

  const screenPrintDesigns = data["Screen Print Designs"];
  const embroideryDesigns = data["Embroidery Designs"];
  const allUrls = screenPrintDesigns
    .map((design) => design["Image URL"] || "")
    .concat(embroideryDesigns.map((design) => design["Image URL"] || ""));
  for (const url of allUrls) {
    await prisma.image.create({
      data: {
        url,
      },
    });
  }
}
async function createColors() {
  if (!data) return;

  const colorTable = data["Colors"];
  for (const colorRow of colorTable) {
    const split = `${colorRow.Color}`.split(" - ");
    const hexCode = split[0].replace("#", "");
    const name = split[1];
    if (!name || !hexCode) continue;
    await prisma.color.create({
      data: {
        name,
        hexCode,
      },
    });
  }
}
async function createTags() {
  if (!data) return;

  const tags = data["Tags"];
  for (const tag of tags) {
    if (!tag.Name) continue;
    await prisma.designTag.create({
      data: {
        name: tag.Name,
      },
    });
  }
}
async function createDesignCategories() {
  if (!data) return;

  const categories = data["Categories"];
  for (const cat of categories) {
    if (!cat.Name || !cat["Design Type"]) continue;
    await prisma.designCategory.create({
      data: {
        name: cat.Name,
        designType: {
          connect: {
            name: cat["Design Type"],
          },
        },
      },
    });
  }
}
async function createDesignSubcategories() {
  if (!data) return;

  const subcategories = data["Subcategories"];
  for (const subcat of subcategories) {
    if (!subcat.Name || !subcat["Parent Category"]) continue;
    try {
      await prisma.designSubcategory.create({
        data: {
          name: subcat.Name,
          designCategory: {
            connect: {
              name: subcat["Parent Category"],
            },
          },
        },
      });
    } catch (error) {
      console.error(
        `Failed to create subcategory ${subcat.Name} with parent category ${subcat["Parent Category"]}`,
        error
      );
      continue;
    }
  }
}
async function createDesigns() {
  if (!data) return;

  const screenPrintDesigns = data["Screen Print Designs"];
  for (const design of screenPrintDesigns) {
    if (!design["Design Number"]) continue;
    try {
      await createDesign("Screen Print", design);
    } catch (error) {
      console.error(
        `Failed to create design ${design["Design Number"]}`,
        error
      );
    }
  }

  const embroideryDesigns = data["Embroidery Designs"];
  for (const design of embroideryDesigns) {
    if (!design["Design Number"]) continue;
    try {
      await createDesign("Embroidery", design);
    } catch (error) {
      console.error(
        `Failed to create design ${design["Design Number"]}`,
        error
      );
    }
  }

  async function createDesign(designType: string, designRow: any) {
    const designNumber = +`${designRow["Design Number"]}`.replace(/[^\d]/g, "");
    const date = new Date(designRow.Date);
    const url = `${designRow["Image URL"]}`;
    const status = designRow.Status;
    if (status === "Draft") return;

    const foundImage = await prisma.image.findFirst({ where: { url } });
    if (!foundImage) {
      throw new Error(
        `Couldn't create design ${designNumber} due to image url`
      );
    }
    const featured = `${designRow.Featured}` === "Yes" ? true : false;
    const colorSplit = `${designRow["Default Background Color"]}`.split(" - ");
    const colorName = colorSplit[1];
    const subcategoryHierarchies = [
      designRow["Subcategory1 - Union"],
      designRow["Subcategory2 - Holiday/Event"],
      designRow["Subcategory3"],
      designRow["Subcategory4"],
      designRow["Subcategory5"],
    ];
    const subcategoryIds = [];
    for (const hierarchy of subcategoryHierarchies) {
      const split = `${hierarchy}`.split(" > ");
      const parent = split[0];
      const subcat = split[1];
      const foundSubcat = await prisma.designSubcategory.findFirst({
        where: {
          designCategory: {
            name: parent,
          },
          name: subcat,
        },
      });
      if (foundSubcat) subcategoryIds.push(foundSubcat.id);
    }
    const tags = [
      designRow["Tag1"],
      designRow["Tag2"],
      designRow["Tag3"],
      designRow["Tag4"],
      designRow["Tag5"],
      designRow["Tag6"],
      designRow["Tag7"],
      designRow["Tag8"],
      designRow["Tag9"],
      designRow["Tag10"],
      designRow["Tag11"],
      designRow["Tag12"],
      designRow["Tag13"],
      designRow["Tag14"],
      designRow["Tag15"],
    ].filter((tag) => tag !== undefined);
    const tagIds = [];
    for (const tag of tags) {
      const foundTag = await prisma.designTag.findUnique({
        where: { name: tag },
      });
      if (foundTag) tagIds.push(foundTag.id);
    }

    await prisma.design.create({
      data: {
        designNumber,
        date,
        defaultBackgroundColor: {
          connect: {
            name: colorName,
          },
        },
        image: {
          connect: {
            id: foundImage?.id,
          },
        },
        description: designRow.Description,
        name: designRow.Name,
        status: designRow.Status,
        designType: {
          connect: {
            name: designType,
          },
        },
        featured,
        designSubcategories: {
          connect: subcategoryIds.map((id) => ({ id })),
        },
        designTags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
    });
  }
}

async function seed() {
  await createImages();
  await createColors();
  await createTags();
  await createDesignCategories();
  await createDesignSubcategories();
  await createDesigns();
}

erase().then(() => seed());
