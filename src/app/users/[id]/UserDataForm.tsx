"use client";

import { createUser, updateUser } from "@/actions/users";
import { User } from "@prisma/client";
import { FormEvent, useState } from "react";

type UserDataFormProps = {
  existingUser: User | null;
};
export function UserDataForm({ existingUser }: UserDataFormProps) {
  const [error, setError] = useState(null as string | null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const password = formData.get("password");
    const passwordConfirm = formData.get("password-confirm");
    const passwordsMatch = password === passwordConfirm;
    if (!passwordsMatch) {
      setError("The passwords must match.");
      return;
    }

    if (existingUser) updateUser(formData);
    else createUser(formData);
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={existingUser ? existingUser.name : ""}
          required={!existingUser}
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          id="email"
          defaultValue={existingUser ? existingUser.email : ""}
          required={!existingUser}
        />
      </div>
      <div>
        <label htmlFor="password">
          {existingUser ? "Change Password:" : "Password:"}
        </label>
        <input
          type="password"
          name="password"
          id="password"
          required={!existingUser}
        />
      </div>
      <div>
        <label htmlFor="password-confirm">Confirm Password:</label>
        <input
          type="password"
          name="password-confirm"
          id="password-confirm"
          required={!existingUser}
        />
      </div>
      <input
        type="hidden"
        name="existingUserId"
        value={existingUser ? existingUser.id : undefined}
      />
      {error && <div className="danger">The passwords must match.</div>}
      <button type="submit">
        {existingUser ? "Save Changes" : "Create User"}
      </button>
    </form>
  );
}
