import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveSuggestionAttachment } from "@/lib/suggestion-attachment-storage";

export const dynamic = "force-dynamic";

function toNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

const ALLOWED_STATUSES = new Set(["new", "under_review", "planned", "accepted", "rejected", "implemented", "archived"]);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const suggestions = await prisma.suggestion.findMany({
    include: {
      suggestedBy: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, companyName: true } },
      _count: { select: { attachments: true } },
    },
    orderBy: [{ suggestedAt: "desc" }],
  });

  return NextResponse.json({ suggestions });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const title = typeof formData.get("title") === "string" ? formData.get("title")!.toString().trim() : "";
    const body = typeof formData.get("body") === "string" ? formData.get("body")!.toString().trim() : "";

    if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    if (!body) return NextResponse.json({ error: "Suggestion body is required." }, { status: 400 });

    const status = toNullableString(formData.get("status")) ?? "new";
    const clientId = toNullableString(formData.get("clientId"));

    const suggestion = await prisma.suggestion.create({
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
        status: ALLOWED_STATUSES.has(status) ? status : "new",
        suggestedById: session.user.id,
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
    revalidatePath(`/suggestions/${suggestion.id}`);
    revalidatePath(`/suggestions/${suggestion.id}/edit`);
    return NextResponse.json({ suggestion }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create suggestion." }, { status: 500 });
  }
}
