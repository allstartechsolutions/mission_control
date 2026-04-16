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

export async function PATCH(request: Request, context: { params: Promise<{ id: string; accountId: string }> }) {
  try {
    const { id: clientId, accountId } = await context.params;
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!name || !username || !password) {
      return NextResponse.json({ error: "Account name, username, and password are required." }, { status: 400 });
    }

    const existing = await prisma.clientAccount.findFirst({
      where: { id: accountId, clientId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const account = await prisma.clientAccount.update({
      where: { id: accountId },
      data: {
        name,
        description: toNullableString(body?.description),
        usernameEncrypted: encryptAccountSecret(username),
        passwordEncrypted: encryptAccountSecret(password),
      },
    });

    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/accounts`);
    revalidatePath(`/clients/${clientId}/accounts/${accountId}/edit`);

    return NextResponse.json({ account });
  } catch (error) {
    console.error("Unable to update client account", error);
    return NextResponse.json({ error: "Unable to update account." }, { status: 500 });
  }
}
