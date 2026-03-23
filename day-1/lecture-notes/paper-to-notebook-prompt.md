# Paper to Notebook — Claude Code Prompt

Use this prompt to build the Paper to Notebook application live with Claude Code. This is the Day 1 capstone — you'll see a full-stack app built from a single prompt in about 15 minutes.

---

## Setup

```bash
mkdir paper-to-notebook-live
cd paper-to-notebook-live
claude
```

---

## The Main Prompt

Copy-paste this into Claude Code:

```
Build me a full-stack application called "Paper to Notebook" that converts research paper PDFs into runnable Google Colab Jupyter notebooks.

## Requirements

### Backend (Python/FastAPI)
- POST /api/convert endpoint that accepts:
  - A PDF file upload
  - A Gemini API key (user provides their own)
- Use PyMuPDF (fitz) to extract text from the uploaded PDF
- Send the extracted text to Google's Gemini 2.5 Pro API with a prompt that:
  - Analyzes the paper's methodology and algorithms
  - Generates a structured Jupyter notebook with:
    - Markdown cells for Abstract, Introduction, Methodology, Experiments, Conclusion
    - LaTeX equations extracted from the paper
    - Python/PyTorch code cells implementing the paper's key algorithms at reduced scale (CPU-friendly)
    - Proper pip install cells for dependencies
- Use nbformat to assemble the notebook
- Return the .ipynb file as a download
- Add CORS middleware for frontend communication
- Add a POST /api/convert-arxiv endpoint that accepts an arXiv URL, downloads the PDF, and runs the same pipeline

### Frontend (Next.js + Tailwind CSS)
- Clean, modern UI with:
  - PDF upload area (drag and drop)
  - Text field for arXiv URL (alternative to upload)
  - Input for Gemini API key
  - "Generate Notebook" button
  - Loading state with progress indication
  - Download button for the generated .ipynb
  - "Open in Colab" button that opens the notebook in Google Colab
- Use shadcn/ui components for the UI
- Responsive design

### Project Structure
- /backend — Python FastAPI app
- /frontend — Next.js app
- Include requirements.txt, package.json, .env.example files
- Include a README.md with setup instructions

Make it production-ready with proper error handling, input validation, and clean code.
```

---

## Follow-up Prompts

Use these to iterate after the initial build:

### Add streaming progress
```
Add server-sent events (SSE) to the /api/convert endpoint so the frontend can show
real-time progress as the notebook is being generated. Show steps like
"Extracting text...", "Analyzing paper...", "Generating code...", "Assembling notebook..."
```

### Test and fix bugs
```
Run the backend with `uvicorn app:app --reload --port 8000` and the frontend with
`npm run dev`. Test by uploading a PDF. Fix any errors you find.
```

### Add deployment config
```
Add a railway.toml and Procfile for deploying the backend to Railway.
Add a vercel.json for deploying the frontend to Vercel.
Update the README with deployment instructions.
```

---

## Why This Prompt Works

Study the structure of this prompt — it applies to any project you build:

1. **Specific but not micromanaging** — describes *what* to build, not *how* to write every line
2. **Architectural decisions included** — backend/frontend split, specific libraries named
3. **User-facing behavior described** — drag and drop, loading states, download button
4. **Structured with headers** — makes it easy for the LLM to parse each requirement
5. **"Production-ready" specified** — this primes the LLM to add error handling and validation

> In Software Dev 2.0, **the prompt is your specification, your architecture doc, and your code review checklist — all in one.**

The more precise your prompt, the closer the output matches your vision on the first try. A vague prompt gets a vague app. A specific prompt gets a specific app.

---

## Compare: Traditional vs. Agentic

| | Traditional (pre-built demo) | Agentic (Claude Code) |
|---|---|---|
| Time to build | ~1 week | ~15 minutes |
| Lines written by hand | ~500 | ~0 |
| PDF handling | Regex / heuristics | LLM-powered |
| Code generation | None | Full PyTorch implementations |
| LaTeX support | None | Yes |
| arXiv integration | None (would take days) | Built-in |
| Frontend | None | Full Next.js UI |

Same requirements. Dramatically different results.
