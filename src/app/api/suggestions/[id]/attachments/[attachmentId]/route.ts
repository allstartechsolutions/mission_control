import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteSuggestionAttachment } from "@/lib/suggestion-attachment-storage";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, attachmentId } = await context.params;

  const attachment = await prisma.suggestionAttachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment || attachment.suggestionId !== id) {
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  await deleteSuggestionAttachment(attachment.filePath);
  await prisma.suggestionAttachment.delete({ where: { id: attachmentId } });

  revalidatePath(`/suggestions/${id}`);
  return NextResponse.json({ success: true });
}
