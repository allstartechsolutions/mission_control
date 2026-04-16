import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { encryptAccountSecret } from "@/lib/account-crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toNullableString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: clientId } = await context.params;
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!name || !username || !password) {
      return NextResponse.json({ error: "Account name, username, and password are required." }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    const account = await prisma.clientAccount.create({
      data: {
        clientId,
        name,
        description: toNullableString(body?.description),
        usernameEncrypted: encryptAccountSecret(username),
        passwordEncrypted: encryptAccountSecret(password),
      },
    });

    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/accounts`);
    revalidatePath(`/clients/${clientId}/accounts/new`);

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error("Unable to create client account", error);
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
