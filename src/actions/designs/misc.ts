"use server";

import {
  dataToSheetBuffer,
  getSheetFromBuffer,
  sheetToJson,
} from "@/utility/spreadsheet";
import { prisma } from "../../../prisma/client";
import { sendEmail } from "@/utility/mail";
import {
  DesignDataImportRow,
  DesignDataInterchangeRow,
} from "@/types/schema/designs";
import { validateDesignDataImportSheet } from "@/types/validations/designs";
import { DesignSubcategory, DesignTag, DesignType } from "@prisma/client";
import { IMAGE_NOT_FOUND_URL } from "@/constants";

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

  //parse the screen print sheet
  const arrayBuffer = await input.arrayBuffer();
  const screenPrintSheet = getSheetFromBuffer(
    Buffer.from(arrayBuffer),
    "Screen Print Designs"
  );
  const screenPrintJson = sheetToJson(screenPrintSheet);
  const screenPrintRowsParsed = validateDesignDataImportSheet(screenPrintJson);

  //parse the embroidery sheet
  const embroiderySheet = getSheetFromBuffer(
    Buffer.from(arrayBuffer),
    "Embroidery Designs"
  );
  const embroideryJson = sheetToJson(embroiderySheet);
  const embroideryRowsParsed = validateDesignDataImportSheet(embroideryJson);

  const { screenPrint, embroidery } = await findDesignTypes();
  const importedParentDesigns: { id: number; designNumber: string }[] = []; //keep track of unique design numbers that have been imported; if a duplicate design number is found, parent it to the existing one as a variation

  await importRows({
    rows: screenPrintRowsParsed,
    type: "Screen Print",
    screenPrintFromDb: screenPrint,
    embroideryFromDb: embroidery,
    importedParentDesigns,
  });

  await importRows({
    rows: embroideryRowsParsed,
    type: "Embroidery",
    screenPrintFromDb: screenPrint,
    embroideryFromDb: embroidery,
    importedParentDesigns,
  });
}

async function importRows(params: {
  rows: DesignDataImportRow[];
  type: "Screen Print" | "Embroidery";
  screenPrintFromDb: DesignType;
  embroideryFromDb: DesignType;
  importedParentDesigns: { id: number; designNumber: string }[];
}) {
  const {
    rows,
    type,
    screenPrintFromDb,
    embroideryFromDb,
    importedParentDesigns,
  } = params;

  for (const row of rows) {
    console.log(`Importing design number ${row["Design Number"]}`);
    try {
      const { createdParentId } = await importSingleRow({
        row,
        type,
        screenPrintFromDb,
        embroideryFromDb,
        existingParentDesigns: importedParentDesigns,
      });
      if (createdParentId)
        importedParentDesigns.push({
          id: createdParentId,
          designNumber: row["Design Number"],
        });
    } catch (error) {
      console.error(`Failed to import row ${row["Design Number"]}: `, error);
    }
  }
}

async function importSingleRow(params: {
  row: DesignDataImportRow;
  type: "Screen Print" | "Embroidery";
  screenPrintFromDb: DesignType;
  embroideryFromDb: DesignType;
  existingParentDesigns: { id: number; designNumber: string }[];
}) {
  const {
    row,
    type,
    screenPrintFromDb,
    embroideryFromDb,
    existingParentDesigns,
  } = params;
  const { hexCode, subcategories, tags } = postValidateRow(row);

  const subcategoriesFromDb = await findSubcategories(subcategories);
  const tagsFromDb = await findTags(tags);
  const colorFromDb = await findColor(hexCode);

  const existingParent = existingParentDesigns.find(
    (parent) => parent.designNumber === row["Design Number"]
  );

  if (!existingParent) {
    const createdDesign = await createRowAsDesign({
      row,
      type,
      bgColorId: colorFromDb.id,
      subcategoriesFromDb,
      tagsFromDb,
      screenPrintFromDb,
      embroideryFromDb,
    });
    console.log(`Created parent design ${createdDesign.designNumber}`);

    return {
      createdParentId: createdDesign.id,
    };
  } else {
    await createRowAsVariation({
      row,
      bgColorId: colorFromDb.id,
      parentDesignId: existingParent.id,
      subcategoriesFromDb,
      tagsFromDb,
    });
    console.log(`Created variation design for number ${row["Design Number"]}`);

    return {
      createdParentId: undefined,
    };
  }
}

async function createRowAsVariation(params: {
  row: DesignDataImportRow;
  bgColorId: number;
  subcategoriesFromDb: DesignSubcategory[];
  tagsFromDb: DesignTag[];
  parentDesignId: number;
}) {
  const { row, bgColorId, subcategoriesFromDb, tagsFromDb, parentDesignId } =
    params;

  return prisma.designVariation.create({
    data: {
      parentDesignId,
      colorId: bgColorId,
      designSubcategories: {
        connect: subcategoriesFromDb.map((sub) => ({ id: sub.id })),
      },
      designTags: {
        connect: tagsFromDb.map((tag) => ({ id: tag.id })),
      },
      imageUrl: row["Image URL"],
    },
  });
}

async function createRowAsDesign(params: {
  row: DesignDataImportRow;
  type: "Screen Print" | "Embroidery";
  bgColorId: number;
  subcategoriesFromDb: DesignSubcategory[];
  tagsFromDb: DesignTag[];
  screenPrintFromDb: DesignType;
  embroideryFromDb: DesignType;
}) {
  const {
    row,
    type,
    bgColorId,
    subcategoriesFromDb,
    tagsFromDb,
    screenPrintFromDb,
    embroideryFromDb,
  } = params;

  return prisma.design.create({
    data: {
      designNumber: row["Design Number"],
      date: new Date(`${row.Date}`),
      defaultBackgroundColorId: bgColorId,
      description: row.Description,
      designSubcategories: {
        connect: subcategoriesFromDb.map((sub) => ({ id: sub.id })),
      },
      designTags: {
        connect: tagsFromDb.map((tag) => ({ id: tag.id })),
      },
      designTypeId:
        type === "Screen Print" ? screenPrintFromDb.id : embroideryFromDb.id,
      featured: row.Featured === "Yes",
      imageUrl: row["Image URL"] || IMAGE_NOT_FOUND_URL,
      name: row.Name,
      priority: row.Priority,
      status: row.Status === "Published" ? "Published" : "Draft",
    },
  });
}

function postValidateRow(row: DesignDataImportRow) {
  const subcategories = [
    `${row["Subcategory1 - Union"]}`.split(" > ")[1] || "",
    `${row["Subcategory2 - Holiday/Event"]}`.split(" > ")[1] || "",
    `${row["Subcategory3"]}`.split(" > ")[1] || "",
    `${row["Subcategory4"]}`.split(" > ")[1] || "",
    `${row["Subcategory5"]}`.split(" > ")[1] || "",
  ].filter((str) => !!str);
  const hexCode =
    row["Default Background Color"]?.split(" - ")[0]?.replace("#", "") ||
    "ffffff";
  const tags = [
    row.Tag1,
    row.Tag2,
    row.Tag3,
    row.Tag4,
    row.Tag5,
    row.Tag6,
    row.Tag7,
    row.Tag8,
    row.Tag9,
    row.Tag10,
    row.Tag11,
    row.Tag12,
    row.Tag13,
    row.Tag14,
    row.Tag15,
  ]
    .filter((item) => !!item)
    .map((item) => `${item}`);

  return { subcategories, hexCode, tags };
}

async function findSubcategories(names: string[]) {
  const subs: DesignSubcategory[] = [];
  for (const name of names) {
    const sub = await prisma.designSubcategory.findFirst({ where: { name } });
    if (!sub) throw new Error(`Subcategory with name ${name} not found.`);
    subs.push(sub);
  }

  return subs;
}

async function findTags(names: string[]) {
  const tags: DesignTag[] = [];
  for (const name of names) {
    const tag = await prisma.designTag.findFirst({ where: { name } });
    if (!tag) throw new Error(`Tag with name ${name} not found.`);
    tags.push(tag);
  }

  return tags;
}

async function findColor(hexCode: string) {
  const color = await prisma.color.findUnique({ where: { hexCode } });
  if (!color) throw new Error(`Color with hexCode ${hexCode} not found.`);
  return color;
}

async function findDesignTypes() {
  const screenPrint = await prisma.designType.findFirst({
    where: {
      name: "Screen Print",
    },
  });
  if (!screenPrint) throw new Error("Screen print design type missing from db");

  const embroidery = await prisma.designType.findFirst({
    where: {
      name: "Embroidery",
    },
  });
  if (!embroidery) throw new Error("Embroidery design type missing from db");

  return { screenPrint, embroidery };
}
