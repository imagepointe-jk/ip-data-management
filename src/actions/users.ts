"use server";

import { validateUserFormData } from "@/validations";
import { prisma } from "../../prisma/client";
import { hashPassword } from "../../utility/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function updateUser(formData: FormData) {
  const parsed = validateUserFormData(formData);
  if (!parsed.existingUserId)
    throw new Error("No existing user id provided. This is a bug.");

  const hashedPassword = parsed.password
    ? await hashPassword(parsed.password)
    : undefined;

  await prisma.user.update({
    where: {
      id: parsed.existingUserId,
    },
    data: {
      name: parsed.name,
      email: parsed.email,
      passwordHash: hashedPassword,
    },
  });

  revalidatePath("/users");
  redirect("/users");
}
