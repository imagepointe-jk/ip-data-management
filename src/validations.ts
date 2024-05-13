import { userFormDataSchema } from "./schema";

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
