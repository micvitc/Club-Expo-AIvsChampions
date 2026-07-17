import os
import json
from typing import Any, Optional
from pydantic import BaseModel, Field

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

class SingleBattleDecision(BaseModel):
    reasoning_summary: str = Field(description="A concise, 1-2 sentence explanation of the move decision in English to post to the battle chat. E.g. 'Switching to Great Tusk to threaten the opponent's active Pokemon.'")
    action_index: int = Field(description="The index of the chosen action from the AVAILABLE ACTIONS list.")

class DoublesBattleDecision(BaseModel):
    reasoning_summary: str = Field(description="A concise, 1-2 sentence explanation of the moves chosen for both slots to post in the battle chat.")
    slot1_action_index: int = Field(description="The index of the chosen action for Slot 1 from the slot 1 available actions list.")
    slot2_action_index: int = Field(description="The index of the chosen action for Slot 2 from the slot 2 available actions list.")

class GeminiClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if self.api_key:
            os.environ["GEMINI_API_KEY"] = self.api_key
        self.genai_client = None
        self._init_client()

    def _init_client(self):
        if GEMINI_AVAILABLE and self.api_key:
            try:
                self.genai_client = genai.Client()
            except Exception as e:
                print(f"⚠️  Could not initialize Gemini Client: {e}")

    def is_configured(self) -> bool:
        return self.genai_client is not None

    async def get_decision(self, prompt: str, schema: Any) -> Optional[dict]:
        if not self.genai_client:
            self._init_client()
            if not self.genai_client:
                return None
        
        system_instruction = "You are a Grandmaster-level Competitive Pokémon Player."
        try:
            with open("prompt.txt") as f:
                system_instruction = f.read()
        except Exception:
            pass

        try:
            print("\n🤖  Querying Gemini API for decision...")
            response = self.genai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=schema,
                    temperature=0.1,
                ),
            )
            data = json.loads(response.text)
            return data
        except Exception as e:
            print(f"\n❌  Gemini API Request failed: {e}")
            return None
