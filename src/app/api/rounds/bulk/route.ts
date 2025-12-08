import { NextRequest } from "next/server";
import { env } from "@/data/env/server";

const { BACKEND_URL } = env;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const jobId = body.jobId;
  type FrontendRound = {
    type: string;
    order: number;
    aiConfig?: any;
    questions?: any[];
  };

  const backendPayload: FrontendRound[] = body.rounds.map(
    (r: FrontendRound) => ({
      roundType: r.type,
      orderNumber: r.order,
      aiConfig: r.aiConfig,
      codingQuestions: r.questions ?? [],
    })
  );

  const response = await fetch(`${BACKEND_URL}/rounds/${jobId}/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(backendPayload),
  });

  return Response.json(await response.json(), { status: response.status });
}
