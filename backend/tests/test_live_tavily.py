import os
import sys

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.agents.tools import search_web_tavily_structured

print("settings.TAVILY_API_KEY:", settings.TAVILY_API_KEY[:10] + "..." if settings.TAVILY_API_KEY else "NONE")
print("settings.is_tavily_configured:", settings.is_tavily_configured)
print("settings.GEMINI_API_KEY:", bool(settings.GEMINI_API_KEY))

res = search_web_tavily_structured("Curcumin patent Section 3(p) India IPO", max_results=3)
print("\nTavily status:", res.get("status"))
print("Tavily error:", res.get("error"))
print("Tavily answer:", res.get("answer"))
print("Tavily results count:", len(res.get("results", [])))
for r in res.get("results", []):
    print(" - Title:", r.get("title"))
    print("   URL:", r.get("url"))
