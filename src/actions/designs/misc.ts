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
  //insert new logic here
}
