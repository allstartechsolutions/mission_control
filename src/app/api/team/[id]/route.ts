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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const name = normalizeString(body.name);
    const email = normalizeString(body.email)?.toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const role = normalizeString(body.role)?.toLowerCase() === "admin" ? "admin" : "user";

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const data: {
      name: string;
      email: string;
      role: string;
      phone: string | null;
      mobile: string | null;
      whatsapp: string | null;
      password?: string;
    } = {
      name,
      email,
      role,
      phone: normalizeString(body.phone),
      mobile: normalizeString(body.mobile),
      whatsapp: normalizeString(body.whatsapp),
    };

    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
      }
      data.password = await bcrypt.hash(password, 12);
    }

    const member = await prisma.user.update({ where: { id }, data });

    revalidatePath("/team");
    revalidatePath(`/team/${id}/edit`);

    return NextResponse.json({ member });
  } catch {
    return NextResponse.json({ error: "Unable to update team member." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    if (session.user.id === id) {
      return NextResponse.json({ error: "You cannot delete the currently signed-in user." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath("/team");
    revalidatePath(`/team/${id}/edit`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete team member." }, { status: 500 });
  }
}
