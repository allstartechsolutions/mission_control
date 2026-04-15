import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { status } = await request.json();

    const allowedStatuses = new Set(["active", "inactive"]);
    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/team");
    revalidatePath(`/team/${id}`);

    return NextResponse.json({ user: { id: user.id, status: user.status } });
  } catch {
    return NextResponse.json({ error: "Unable to update status." }, { status: 500 });
  }
}
