import { findAllFormValues } from "@/utility/misc";
import {
  designDataImportRowSchema,
  designFormDataSchema,
  quoteRequestSchema,
} from "../schema/designs";
import { z } from "zod";

function extractDesignVariationFormData(formData: FormData) {
  const variationColorFields = findAllFormValues(formData, (name) =>
    name.includes("bg-color-variation")
  );
  const variationUrlFields = findAllFormValues(formData, (name) =>
    name.includes("image-url-variation")
  );
  const variationCategoryFields = findAllFormValues(formData, (name) =>
    name.includes("subcategories-variation")
  );
  const variationTagFields = findAllFormValues(formData, (name) =>
    name.includes("tags-variation")
  );
  //assume that the number of color fields and url fields accurately reflects the number of variations on the design
  if (variationColorFields.length !== variationUrlFields.length)
    throw new Error(
      "Unequal lengths of design variation fields. This is a bug."
    );

  const extracted: {
    id: number;
    imageUrl: string;
    colorId: number;
    subcategoryIds: number[];
    tagIds: number[];
  }[] = [];
  const totalVariations = variationColorFields.length;

  for (let i = 0; i < totalVariations; i++) {
    const colorField = variationColorFields[i];
    if (colorField === undefined) break;

    const variationId = +`${colorField.fieldName.match(/\d+$/)}`;
    if (isNaN(variationId)) break;

    const matchingUrlField = variationUrlFields.find((field) => {
      const variationIdHere = +`${field.fieldName.match(/\d+$/)}`;
      return !isNaN(variationIdHere) && variationIdHere === variationId;
    });
    const matchingCategoryFields = variationCategoryFields.filter((field) => {
      const variationIdHere = +`${field.fieldName.match(/\d+$/)}`;
      return !isNaN(variationIdHere) && variationIdHere === variationId;
    });
    const matchingTagFields = variationTagFields.filter((field) => {
      const variationIdHere = +`${field.fieldName.match(/\d+$/)}`;
      return !isNaN(variationIdHere) && variationIdHere === variationId;
    });
    extracted.push({
      id: variationId,
      colorId: +colorField.fieldValue,
      imageUrl: matchingUrlField ? `${matchingUrlField.fieldValue}` : "",
      subcategoryIds: matchingCategoryFields.map((field) => +field.fieldValue),
      tagIds: matchingTagFields.map((field) => +field.fieldValue),
    });
  }

  return extracted;
}

export function validateDesignFormData(formData: FormData) {
  const existingDesignId = formData.get("existingDesignId");
  const existingDesignIdNum = existingDesignId ? +existingDesignId : undefined;
  const date = new Date(`${formData.get("date")}`);
  const priority = +`${formData.get("priority")}`;
  const variationData = existingDesignId
    ? extractDesignVariationFormData(formData)
    : [];

  return designFormDataSchema.parse({
    designNumber: formData.get("design-number"),
    description: formData.get("description"),
    featured: !!formData.get("featured"),
    date: isNaN(date.getTime()) ? new Date() : date,
    status: formData.get("status"),
    subcategoryIds: formData.getAll("subcategories"),
    tagIds: formData.getAll("tags"),
    designTypeId: formData.get("design-type"),
    defaultBackgroundColorId: formData.get("bg-color"),
    imageUrl: formData.get("image-url"),
    existingDesignId: existingDesignIdNum,
    priority: !isNaN(priority) ? priority : undefined,
    variationData,
  });
}

export function validateQuoteRequest(json: any) {
  return quoteRequestSchema.parse(json);
}
export function validateDesignDataImportSheet(data: any) {
  if (!Array.isArray(data)) throw new Error("Input was not an array");
  const prevalidated = data.map((row) => ({
    ...row,
    "Design Number": `${row["Design Number"]}`,
  }));

  return z.array(designDataImportRowSchema).parse(prevalidated);
}
