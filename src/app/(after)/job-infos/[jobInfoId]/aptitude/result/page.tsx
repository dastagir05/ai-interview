"use client";

import { useSearchParams } from "next/navigation";

export default function AptitudeResultPage() {
  const params = useSearchParams();
  const score = params.get("score");

  return (
    <div className="max-w-xl mx-auto p-10 text-center space-y-4">
      <h1 className="text-3xl font-bold">Aptitude Test Result</h1>
      <p className="text-xl">Your Score</p>
      <p className="text-5xl font-bold text-green-600">{score}%</p>
    </div>
  );
}
