"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/zod";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const validated = signupSchema.safeParse({ email, password });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { email: validatedEmail, password: validatedPassword } = validated.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedEmail },
    });
    
    if (existingUser) {
      return { error: "User already exists with this email address." };
    }

    const passwordHash = await bcrypt.hash(validatedPassword, 10);
    await prisma.user.create({
      data: {
        email: validatedEmail,
        passwordHash,
      },
    });

    return { success: true };
  } catch (err: any) {
    console.error("Signup error:", err);
    return { error: "An unexpected error occurred during signup." };
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error; // Re-throw redirect errors so Next.js can handle redirects properly
  }
}
