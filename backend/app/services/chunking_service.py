import re
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("ayunova.chunking")

class LegalChunkingService:
    """
    Semantic & Legal statutory chunker designed for Patents, Drugs & Cosmetics,
    Biodiversity Acts, and Ayurvedic Prior Art monographs.
    Preserves statutory hierarchy, section numbers, and authority context across chunks.
    """

    DEFAULT_CHUNK_SIZE = 1800  # ~400-600 tokens
    DEFAULT_CHUNK_OVERLAP = 250  # ~50-75 tokens

    @classmethod
    def chunk_document(
        cls,
        text: str,
        doc_title: str,
        authority: str,
        official_act: str,
        default_section: str = "General Provisions",
        jurisdiction: str = "India",
        chunk_size: int = DEFAULT_CHUNK_SIZE,
        chunk_overlap: int = DEFAULT_CHUNK_OVERLAP
    ) -> List[Dict[str, Any]]:
        """
        Splits legal text into overlapping semantic chunks with statutory contextual headers.
        """
        if not text or not text.strip():
            return []

        # 1. Clean and normalize paragraphs
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        
        # 2. Build blocks grouped by section boundaries or paragraph size
        raw_chunks: List[Dict[str, Any]] = []
        current_text = ""
        current_page = "1"
        current_section = default_section

        # Regex patterns to detect specific sections and page markers
        section_pattern = re.compile(
            r"^(section\s+\d+\s*\([a-z0-9]+\)|section\s+\d+|rule\s+\d+[a-z]?|article\s+\d+|chapter\s+[ivx\d]+|schedule\s+[a-z0-9]+)", 
            re.IGNORECASE
        )
        page_pattern = re.compile(r"^\[Page\s+(\d+)\]", re.IGNORECASE)

        for para in paragraphs:
            # Check for page markers
            page_match = page_pattern.search(para)
            if page_match:
                current_page = page_match.group(1)

            # Check for new section headings
            sec_match = section_pattern.search(para)
            if sec_match:
                # If current text is substantial, finish current chunk before switching section
                if len(current_text) > 400:
                    raw_chunks.append({
                        "content": current_text.strip(),
                        "section": current_section,
                        "page": current_page
                    })
                    current_text = ""
                current_section = sec_match.group(1).title()

            # Append paragraph
            if len(current_text) + len(para) > chunk_size and len(current_text) > 400:
                raw_chunks.append({
                    "content": current_text.strip(),
                    "section": current_section,
                    "page": current_page
                })
                # Retain overlap from end of previous text
                overlap_text = current_text[-chunk_overlap:] if len(current_text) > chunk_overlap else ""
                current_text = overlap_text + "\n\n" + para
            else:
                if current_text:
                    current_text += "\n\n" + para
                else:
                    current_text = para

        if current_text.strip():
            raw_chunks.append({
                "content": current_text.strip(),
                "section": current_section,
                "page": current_page
            })

        # 3. Format structured chunks with statutory embedding context headers
        structured_chunks: List[Dict[str, Any]] = []
        for idx, item in enumerate(raw_chunks):
            content_text = item["content"]
            sec = item["section"]
            pg = item["page"]

            # Grounding context header ensures high-dimensional vector representations
            # encode the Act, Authority, and Section names directly
            embed_text = (
                f"[Statute: {doc_title} | Authority: {authority} | "
                f"Act: {official_act} | Section: {sec} | Jurisdiction: {jurisdiction}] "
                f"{content_text}"
            )

            structured_chunks.append({
                "chunk_index": idx,
                "section": sec,
                "page": f"Page {pg}" if pg else "",
                "content_text": content_text,
                "embed_text": embed_text,
                "char_length": len(content_text),
                "estimated_tokens": max(1, len(content_text) // 4),
                "authority": authority,
                "official_act": official_act,
                "jurisdiction": jurisdiction
            })

        logger.info(f"Chunked document '{doc_title}' into {len(structured_chunks)} statutory chunks.")
        return structured_chunks
