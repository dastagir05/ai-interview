from pydantic import BaseModel

class InterviewRequest(BaseModel):
    questionId: str | None = None
    candidateText: str
    metadata: dict | None = None
