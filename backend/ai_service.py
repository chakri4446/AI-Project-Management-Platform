import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def analyze_requirement(requirement_text: str):
    prompt = f"""
You are an AI assistant for a project management system.

Analyze the following software requirement.

Requirement:
{requirement_text}

Provide the following:

1. Requirement Type
2. Priority
3. Suggested Tasks
4. Potential Risks
5. Recommendation

Keep the response practical and concise.
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return response.text