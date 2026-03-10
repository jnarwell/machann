import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { safeValidate, validationErrorResponse } from "@/lib/validation";

// Signup validation schema
const signupSchema = z.object({
  name: z
    .string("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  email: z
    .string("Email is required")
    .email("Invalid email address"),
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),
  phone: z
    .string()
    .regex(/^[+]?[\d\s-]{7,20}$/, "Invalid phone number")
    .optional()
    .nullable(),
  location: z
    .string()
    .max(100, "Location too long")
    .optional()
    .nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = safeValidate(signupSchema, body);
    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { name, email, password, phone, location } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered", code: "EMAIL_EXISTS" },
        { status: 400 }
      );
    }

    // Check if phone is already used (if provided)
    if (phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone },
      });
      if (phoneExists) {
        return NextResponse.json(
          { success: false, error: "Phone number already registered", code: "PHONE_EXISTS" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate initials from name
    const nameParts = name.trim().split(/\s+/);
    const initials = nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();

    // Generate random avatar color
    const colors = ["#6B7C5E", "#8B6B5E", "#5E6B8B", "#8B5E7C", "#7C8B5E", "#5E8B7C"];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone ?? null,
        location: location ?? null,
        initials,
        avatarColor,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        initials: true,
        avatarColor: true,
      },
    });

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account", code: "SIGNUP_ERROR" },
      { status: 500 }
    );
  }
}
