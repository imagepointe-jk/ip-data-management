import { designFormDataSchema, userFormDataSchema } from "./schema";

export function validateUserFormData(formData: FormData) {
  const existingUserId = formData.get("existingUserId");
  const existingUserIdNum = existingUserId ? +existingUserId : undefined;

  return userFormDataSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    existingUserId: existingUserIdNum,
  });
}

export function validateDesignFormData(formData: FormData) {
  const existingDesignId = formData.get("existingDesignId");
  const existingDesignIdNum = existingDesignId ? +existingDesignId : undefined;

  return designFormDataSchema.parse({
    designNumber: formData.get("design-number"),
    description: formData.get("description"),
    featured: !!formData.get("featured"),
    date: new Date(`${formData.get("date")}`),
    status: formData.get("status"),
    subcategoryIds: formData.getAll("subcategories"),
    tagIds: formData.getAll("tags"),
    designTypeId: formData.get("design-type"),
    defaultBackgroundColorId: formData.get("bg-color"),
    imageUrl: formData.get("image-url"),
    existingDesignId: existingDesignIdNum,
  });
}
