//seed with real data from the design library, sampled on 7-8-24.

import { getSourceJson } from "@/utility/spreadsheet/serverOnly";
import { prisma } from "../prisma/client";

const data = getSourceJson("./seed/Design Data 7-8-24.xlsx");

async function erase() {
  await prisma.customProductDecorationLocation.deleteMany();
  await prisma.customProductView.deleteMany();
  await prisma.customProductSettingsVariation.deleteMany();
  await prisma.customProductSettings.deleteMany();

  await prisma.designVariation.deleteMany();
  await prisma.design.deleteMany();
  await prisma.designSubcategory.deleteMany();
  await prisma.designCategory.deleteMany();
  await prisma.designTag.deleteMany();

  await prisma.color.deleteMany();
}

async function createColors() {
  if (!data) return;

  const colorTable = data["Colors"]!;
  for (const colorRow of colorTable) {
    const split = `${colorRow.Color}`.split(" - ");
    const hexCode = split[0]!.replace("#", "");
    const name = split[1];
    if (!name || !hexCode) continue;
    try {
      await prisma.color.create({
        data: {
          name,
          hexCode,
        },
      });
    } catch (error) {
      console.error(`Did not create color ${name}`);
    }
  }
}
async function createTags() {
  if (!data) return;

  const tags = data["Tags"]!;
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

  const categories = data["Categories"]!;
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

  const subcategories = data["Subcategories"]!;
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
        error,
      );
      continue;
    }
  }
}
async function createDesigns() {
  if (!data) return;
  const usedDesignNumbersWithIds: { [key: string]: number } = {};

  const screenPrintDesigns = data["Screen Print Designs"]!;
  for (const design of screenPrintDesigns) {
    if (!design["Design Number"]) continue;
    try {
      const existingId = usedDesignNumbersWithIds[design["Design Number"]];
      if (existingId !== undefined) {
        createDesignVariation(existingId, design);
      } else {
        const created = await createDesign("Screen Print", design);
        usedDesignNumbersWithIds[created.designNumber] = created.id;
      }
    } catch (error) {
      console.error(
        `Failed to create design ${design["Design Number"]} with background color ${design["Default Background Color"]}`,
        error,
      );
    }
  }

  const embroideryDesigns = data["Embroidery Designs"]!;
  for (const design of embroideryDesigns) {
    if (!design["Design Number"]) continue;
    try {
      const existingId = usedDesignNumbersWithIds[design["Design Number"]];
      if (existingId !== undefined) {
        createDesignVariation(existingId, design);
      } else {
        const created = await createDesign("Embroidery", design);
        usedDesignNumbersWithIds[created.designNumber] = created.id;
      }
    } catch (error) {
      console.error(
        `Failed to create design ${design["Design Number"]} with background color ${design["Default Background Color"]}`,
        error,
      );
    }
  }

  async function createDesign(designType: string, designRow: any) {
    const designNumber = `${designRow["Design Number"]}`;
    const date = new Date(designRow.Date);
    const url = `${designRow["Image URL"]}`;

    const featured = `${designRow.Featured}` === "Yes" ? true : false;
    const priority = isNaN(+`${designRow["Priority"]}`)
      ? 0
      : +`${designRow["Priority"]}`;
    const colorSplit = `${designRow["Default Background Color"]}`.split(" - ");
    const colorName = colorSplit[1];
    const tagIds = await getDesignRowTagIds(designRow);
    const subcategoryIds = await getDesignRowSubcategoryIds(designRow);

    return prisma.design.create({
      data: {
        designNumber,
        date,
        defaultBackgroundColor: {
          connect: {
            name: colorName,
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
        imageUrl: url,
        priority,
      },
    });
  }

  async function getDesignRowTagIds(row: any) {
    const tags = [
      row["Tag1"],
      row["Tag2"],
      row["Tag3"],
      row["Tag4"],
      row["Tag5"],
      row["Tag6"],
      row["Tag7"],
      row["Tag8"],
      row["Tag9"],
      row["Tag10"],
      row["Tag11"],
      row["Tag12"],
      row["Tag13"],
      row["Tag14"],
      row["Tag15"],
    ].filter((tag) => tag !== undefined);
    const tagIds = [];
    for (const tag of tags) {
      const foundTag = await prisma.designTag.findUnique({
        where: { name: tag },
      });
      if (foundTag) tagIds.push(foundTag.id);
    }
    return tagIds;
  }

  async function getDesignRowSubcategoryIds(row: any) {
    const subcategoryHierarchies = [
      row["Subcategory1 - Union"],
      row["Subcategory2 - Holiday/Event"],
      row["Subcategory3"],
      row["Subcategory4"],
      row["Subcategory5"],
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
    return subcategoryIds;
  }

  async function createDesignVariation(designId: number, designRow: any) {
    const colorSplit = `${designRow["Default Background Color"]}`.split(" - ");
    const colorName = colorSplit[1];
    const color = await prisma.color.findUnique({
      where: {
        name: colorName,
      },
    });
    if (!color) {
      console.error("Couldn't find color", colorName);
      return;
    }
    const tagIds = await getDesignRowTagIds(designRow);
    const subcategoryIds = await getDesignRowSubcategoryIds(designRow);
    await prisma.designVariation.create({
      data: {
        parentDesignId: designId,
        imageUrl: `${designRow["Image URL"]}`,
        colorId: color.id,
        designTags: {
          connect: tagIds.map((id) => ({ id })),
        },
        designSubcategories: {
          connect: subcategoryIds.map((id) => ({ id })),
        },
      },
    });
  }
}

async function seed() {
  await createColors();
  await createTags();
  await createDesignCategories();
  await createDesignSubcategories();
  await createDesigns();
}

erase().then(() => seed());
