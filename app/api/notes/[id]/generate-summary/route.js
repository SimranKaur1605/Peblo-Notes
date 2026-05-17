import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.note.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!note.content || note.content.trim().length < 1) {
    return NextResponse.json(
      { error: "Content likho pehle!" },
      { status: 400 },
    );
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 4096,
        messages: [
          {
            role: "system",
            content: `You are a smart AI assistant like ChatGPT. Even if the user writes a single word, explain it fully.
Rules:
- Always explain the topic in detail no matter how short the input is
- Include comparisons/differences if relevant
- Include real world examples
- For mermaid diagrams, ONLY use this exact simple format:
  flowchart TD
    A[Box A] --> B[Box B]
    B --> C[Box C]
- Do NOT use parentheses () inside mermaid node labels
- Do NOT use special characters in mermaid labels, only plain text in square brackets []
- Do NOT use sequenceDiagram, classDiagram or any other type, ONLY flowchart TD
- If diagram is not clearly helpful, set mermaid_diagram to empty string
- Respond ONLY with valid JSON. No markdown backticks outside JSON.`,
          },
          {
            role: "user",
            content: `Analyze this and respond with JSON only:
{
  "suggested_title": "appropriate title",
  "analysis": "Complete ChatGPT-style explanation covering everything about the topic. Use \\n\\n for paragraphs.",
  "mermaid_diagram": "flowchart TD\\n  A[Start] --> B[End] OR empty string if no diagram needed",
  "diagram_title": "title for diagram or empty string",
  "actionItems": ["action 1", "action 2"]
}

MERMAID RULES - follow strictly:
- Only flowchart TD
- Node labels only in square brackets: A[Label here]
- No special chars: no (), no {}, no <>
- No quotes inside labels
- Simple arrows only: -->

Note content: ${note.content}`,
          },
        ],
      }),
    },
  );

  const aiData = await response.json();

  if (aiData.error) {
    return NextResponse.json(
      { error: "AI service error: " + aiData.error.message },
      { status: 500 },
    );
  }

  const text = aiData.choices?.[0]?.message?.content?.trim() || "{}";

  let parsed = {};
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch (e) {
    parsed = { analysis: text, actionItems: [] };
  }

  // Clean mermaid code to remove common syntax errors
  let mermaid = parsed.mermaid_diagram || "";
  if (mermaid) {
    mermaid = mermaid
      .replace(/\(([^)]*)\)/g, " $1 ") // remove parentheses
      .replace(/[{}]/g, "") // remove curly braces
      .replace(/"/g, "") // remove quotes inside
      .trim();

    // Validate it starts correctly
    if (!mermaid.startsWith("flowchart")) {
      mermaid = "";
    }
  }

  await prisma.note.update({
    where: { id },
    data: {
      summary: parsed.analysis || "",
      actionItems: parsed.actionItems || [],
    },
  });

  return NextResponse.json({
    suggested_title: parsed.suggested_title || "",
    analysis: parsed.analysis || "",
    mermaid_diagram: mermaid,
    diagram_title: parsed.diagram_title || "",
    actionItems: parsed.actionItems || [],
  });
}
