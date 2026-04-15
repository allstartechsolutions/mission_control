import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteAllSuggestionAttachments, saveSuggestionAttachment } from "@/lib/suggestion-attachment-storage";

export const dynamic = "force-dynamic";

function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

const ALLOWED_STATUSES = new Set(["new", "under_review", "planned", "accepted", "rejected", "implemented", "archived"]);

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const suggestion = await prisma.suggestion.findUnique({
    where: { id },
    include: {
      suggestedBy: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, companyName: true } },
      attachments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!suggestion) return NextResponse.json({ error: "Suggestion not found." }, { status: 404 });
  return NextResponse.json({ suggestion });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const existing = await prisma.suggestion.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Suggestion not found." }, { status: 404 });

  try {
    const formData = await request.formData();
    const title = typeof formData.get("title") === "string" ? formData.get("title")!.toString().trim() : "";
    const body = typeof formData.get("body") === "string" ? formData.get("body")!.toString().trim() : "";

    if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    if (!body) return NextResponse.json({ error: "Suggestion body is required." }, { status: 400 });

    const status = toNullableString(formData.get("status")) ?? existing.status;
    const clientId = toNullableString(formData.get("clientId"));

    const suggestion = await prisma.suggestion.update({
      where: { id },
      data: {
        title,
        body,
        category: toNullableString(formData.get("category")),
        area: toNullableString(formData.get("area")),
        impact: toNullableString(formData.get("impact")),
        effort: toNullableString(formData.get("effort")),
        whyItMatters: toNullableString(formData.get("whyItMatters")),
        expectedOutcome: toNullableString(formData.get("expectedOutcome")),
        linkedProject: toNullableString(formData.get("linkedProject")),
        decisionNotes: toNullableString(formData.get("decisionNotes")),
        status: ALLOWED_STATUSES.has(status) ? status : existing.status,
        clientId: clientId || null,
      },
    });

    const files = formData.getAll("attachments");
    for (const file of files) {
      if (file instanceof File && file.size > 0) {
        const attachment = await saveSuggestionAttachment(suggestion.id, file);
        await prisma.suggestionAttachment.create({
          data: {
            suggestionId: suggestion.id,
            filePath: attachment.filePath,
            fileName: attachment.fileName,
            storedName: attachment.storedName,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
          },
        });
      }
    }

    revalidatePath("/suggestions");
    revalidatePath(`/suggestions/${id}`);
    revalidatePath(`/suggestions/${id}/edit`);
    return NextResponse.json({ suggestion });
  } catch {
    return NextResponse.json({ error: "Unable to update suggestion." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const existing = await prisma.suggestion.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Suggestion not found." }, { status: 404 });

  try {
    await prisma.suggestion.delete({ where: { id } });
    await deleteAllSuggestionAttachments(id);

    revalidatePath("/suggestions");
    revalidatePath(`/suggestions/${id}`);
    revalidatePath(`/suggestions/${id}/edit`);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete suggestion." }, { status: 500 });
  }
}
