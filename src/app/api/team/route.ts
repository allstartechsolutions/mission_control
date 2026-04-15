import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = normalizeString(body.name);
    const email = normalizeString(body.email)?.toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const role = normalizeString(body.role)?.toLowerCase() === "admin" ? "admin" : "user";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const member = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone: normalizeString(body.phone),
        mobile: normalizeString(body.mobile),
        whatsapp: normalizeString(body.whatsapp),
      },
    });

    revalidatePath("/team");
    revalidatePath(`/team/${member.id}/edit`);

    return NextResponse.json({ member }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create team member." }, { status: 500 });
  }
}
