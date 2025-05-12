"use server";

import { validateUserFormData } from "@/types/validations/users";
import { hashPassword } from "@/utility/auth";
import { prisma } from "../../../prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
  const parsed = validateUserFormData(formData);
  if (!parsed.password) throw new Error("Password is required.");

  const hashedPassword = await hashPassword(parsed.password);

  await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      passwordHash: hashedPassword,
    },
  });

  revalidatePath("/users");
  redirect("/users");
}
