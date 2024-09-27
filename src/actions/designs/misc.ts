"use server";

import { dataToSheetBuffer } from "@/utility/spreadsheet";
import { prisma } from "../../../prisma/client";
import { sendEmail } from "@/utility/mail";

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
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  const rows: {
    ID: number;
    Name?: string | null;
    Description?: string | null;
    ParentID?: number;
    DesignNumber: string;
    ImageUrl: string;
    DesignType?: string;
    DefaultBackgroundColorName: string;
    DefaultBackgroundColorHexCode: string;
    Featured?: boolean;
    Status?: string;
    Tags?: string;
    TagIds?: string;
    Subcategories?: string;
    SubcategoryIds?: string;
    Date?: string;
    Priority?: number;
  }[] = [];

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
        DesignNumber: design.designNumber,
        ImageUrl: variation.imageUrl,
        DefaultBackgroundColorName: variation.color.name,
        DefaultBackgroundColorHexCode: variation.color.hexCode,
      });
    }
  }

  const sheet = dataToSheetBuffer(rows, "Designs");
  await sendEmail(email, "Design Library Export", "Design Library Export", [
    { content: sheet, filename: "design-library-export.xlsx" },
  ]);
}
