"use server";

import {
  dataToSheetBuffer,
  getSheetFromBuffer,
  sheetToJson,
} from "@/utility/spreadsheet";
import { prisma } from "../../../prisma/client";
import { sendEmail } from "@/utility/mail";
import { DesignDataInterchangeRow } from "@/types/schema/designs";
import { validateDesignDataInput } from "@/types/validations/designs";
import { DesignSubcategory, DesignTag } from "@prisma/client";

export async function exportAndSend(email: string) {
  const designs = await prisma.design.findMany({
    include: {
      defaultBackgroundColor: true,
      designSubcategories: {
        include: {
          designCategory: true,
        },
      },
      designTags: true,
      designType: true,
      variations: {
        include: {
          color: true,
          designSubcategories: true,
          designTags: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  const rows: DesignDataInterchangeRow[] = [];

  for (const design of designs) {
    rows.push({
      ID: design.id,
      Name: design.name,
      Description: design.description,
      DesignNumber: design.designNumber,
      ImageUrl: design.imageUrl,
      DesignType: design.designType.name,
      DefaultBackgroundColorName: design.defaultBackgroundColor.name,
      DefaultBackgroundColorHexCode: design.defaultBackgroundColor.hexCode,
      Featured: design.featured,
      Status: design.status,
      Subcategories: design.designSubcategories
        .map((sub) => sub.name)
        .join(" | "),
      SubcategoryIds: design.designSubcategories
        .map((sub) => sub.id)
        .join(" | "),
      Tags: design.designTags.map((tag) => tag.name).join(" | "),
      TagIds: design.designTags.map((tag) => tag.id).join(" | "),
      Date: design.date.toLocaleString(),
      Priority: design.priority,
    });

    for (const variation of design.variations) {
      rows.push({
        ID: variation.id,
        ParentID: design.id,
        ParentDesignNumber: design.designNumber,
        DesignNumber: design.designNumber,
        ImageUrl: variation.imageUrl,
        DefaultBackgroundColorName: variation.color.name,
        DefaultBackgroundColorHexCode: variation.color.hexCode,
        Subcategories: variation.designSubcategories
          .map((sub) => sub.name)
          .join(" | "),
        SubcategoryIds: variation.designSubcategories
          .map((sub) => sub.id)
          .join(" | "),
        Tags: variation.designTags.map((tag) => tag.name).join(" | "),
        TagIds: variation.designTags.map((tag) => tag.id).join(" | "),
      });
    }
  }

  const sheet = dataToSheetBuffer(rows, "Designs");
  await sendEmail(email, "Design Library Export", "Design Library Export", [
    { content: sheet, filename: "design-library-export.xlsx" },
  ]);
}

export async function importDesigns(formData: FormData) {
  const input = formData.get("sheet");
  if (!(input instanceof Blob)) throw new Error("Invalid file");

  const arrayBuffer = await input.arrayBuffer();
  const sheet = getSheetFromBuffer(Buffer.from(arrayBuffer), "Designs");
  const json = sheetToJson(sheet);
  const parsed = validateDesignDataInput(json);
  const screenPrint = (await prisma.designType.findFirst({
    where: {
      name: "Screen Print",
    },
  }))!;
  const embroidery = (await prisma.designType.findFirst({
    where: {
      name: "Embroidery",
    },
  }))!;
  const subcategoryCache: { [key: string]: DesignSubcategory } = {};
  const tagCache: { [key: string]: DesignTag } = {};

  async function getSubcategory(name: string) {
    const fromCache = subcategoryCache[name];
    if (fromCache) return fromCache;

    const fromDb = await prisma.designSubcategory.findFirst({
      where: {
        name,
      },
    });
    if (!fromDb) throw new Error(`Subcategory ${name} not found.`);
    subcategoryCache[name] = fromDb;
    return fromDb;
  }

  async function getTag(name: string) {
    const fromCache = tagCache[name];
    if (fromCache) return fromCache;

    const fromDb = await prisma.designTag.findFirst({
      where: {
        name,
      },
    });
    if (!fromDb) throw new Error(`Tag ${name} not found.`);
    tagCache[name] = fromDb;
    return fromDb;
  }

  for (const item of parsed) {
    const {
      DefaultBackgroundColorName,
      DesignNumber,
      ImageUrl,
      Date: DateStr,
      Description,
      DesignType,
      Featured,
      Name,
      ParentDesignNumber,
      Priority,
      Status,
      Subcategories,
      Tags,
    } = item;
    const isVariation = item.ParentDesignNumber !== undefined;
    try {
      const color = await prisma.color.findUnique({
        where: {
          name: DefaultBackgroundColorName,
        },
      });
      if (!color)
        throw new Error(
          `Background color ${DefaultBackgroundColorName} not found.`
        );
      const subcategoriesSplit = Subcategories?.split(/\s*\|\s*/g) || [];
      const tagsSplit = Tags?.split(/\s*\|\s*/g) || [];
      const subcategories = await Promise.all(
        subcategoriesSplit.map(async (name) => getSubcategory(name))
      );
      const tags = await Promise.all(
        tagsSplit.map(async (name) => getTag(name))
      );

      if (!isVariation) {
        await prisma.design.create({
          data: {
            name: Name,
            description: Description,
            designNumber: DesignNumber,
            imageUrl: ImageUrl,
            designTypeId:
              DesignType === "Screen Print" ? screenPrint.id : embroidery.id,
            defaultBackgroundColorId: color.id,
            featured: Featured,
            status: Status,
            date: DateStr ? new Date(DateStr) : undefined,
            priority: Priority,
            designSubcategories: {
              connect: subcategories.map((sub) => ({ id: sub.id })),
            },
            designTags: {
              connect: tags.map((tag) => ({ id: tag.id })),
            },
          },
        });
        console.log(`Imported design number ${DesignNumber}`);
      } else {
        const parentDesign = await prisma.design.findFirst({
          where: {
            designNumber: ParentDesignNumber,
          },
        });
        if (!parentDesign)
          throw new Error("The parent of the variation could not be found.");

        await prisma.designVariation.create({
          data: {
            colorId: color.id,
            parentDesignId: parentDesign.id,
            imageUrl: ImageUrl,
            designSubcategories: {
              connect: subcategories.map((sub) => ({ id: sub.id })),
            },
            designTags: {
              connect: tags.map((tag) => ({ id: tag.id })),
            },
          },
        });
        console.log(`Imported variation of design number ${DesignNumber}`);
      }
    } catch (error) {
      console.error(
        `Failed to create design or variation with design number ${DesignNumber}. The following error was thrown: `,
        error
      );
    }
  }
}
