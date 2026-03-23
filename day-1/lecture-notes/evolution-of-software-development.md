# The Evolution of Software Development

---

## The Five Eras

### Software Dev 1.0 — "Man vs. Machine"
- **Era**: Pre-2000s
- **Tools**: Text editor, compiler, man pages
- **Workflow**: Think → Write code → Compile → Debug → Repeat
- **Help source**: Books, printed manuals
- **Speed**: Weeks for basic features

### Software Dev 1.2 — "Google It"
- **Era**: 2000–2022
- **Tools**: VS Code, Git, StackOverflow, Google
- **Workflow**: Think → Write code → Get stuck → Google it → Copy from StackOverflow → Adapt → Test
- **Help source**: StackOverflow, docs, blog posts, GitHub issues
- **Speed**: Days for basic features

### Software Dev 1.5 — "Ask ChatGPT"
- **Era**: 2023–2024
- **Tools**: VS Code + ChatGPT/Claude in browser
- **Workflow**: Think → Write code → Get stuck → Paste code into ChatGPT → Get answer → Copy back → Adapt → Test
- **Help source**: ChatGPT, Claude (in browser)
- **Speed**: Hours for basic features
- **Key limitation**: Context-switching. The AI doesn't see your codebase.

### Software Dev 1.8 — "AI in the Editor"
- **Era**: 2024–2025
- **Tools**: Cursor, GitHub Copilot, Windsurf, Cline
- **Workflow**: Write a comment → AI autocompletes → Accept/reject → Chat with AI about your code → Apply diff
- **Help source**: AI embedded in your editor, sees your files
- **Speed**: Hours for complex features, minutes for simple ones
- **Key limitation**: You're still the architect. AI is a fast typist.

### Software Dev 2.0 — "Agentic Coding"
- **Era**: 2025–present
- **Tools**: Claude Code, Devin, OpenAI Codex, aider
- **Workflow**: Write a detailed prompt → Agent builds the entire thing → Review → Iterate → Deploy
- **Help source**: The AI IS the developer. You are the PM/architect/reviewer.
- **Speed**: Minutes for full applications
- **Key shift**: From "writing code" to "writing prompts" and "reviewing code"

---

## Visual Timeline

```
2000                    2023        2024         2025         2026
  │                       │           │            │            │
  ▼                       ▼           ▼            ▼            ▼
 1.0/1.2               1.5         1.8          2.0       THIS COURSE
 Google &            ChatGPT     Cursor/       Claude        You are
 StackOverflow       as helper   Copilot       Code          here
                                 in editor     Agentic
```

---

## Key Insight

> "The best developers in 2026 aren't the ones who type the fastest. They're the ones who **think the clearest** — because the bottleneck has shifted from implementation to specification."

In Software Dev 2.0, **prompt engineering IS software engineering**. The quality of your prompt determines the quality of your output. The skills that matter most now:

1. **Breaking down problems** — decomposing a fuzzy idea into a precise specification
2. **Reviewing AI output** — knowing when code is correct vs. when it just looks correct
3. **Iterating with context** — building on what was already built, not starting over
4. **Understanding architecture** — the AI is better when YOU understand what it's building

---

## Day 1 Project: Paper to Notebook

To make this concrete, Day 1 builds a **Paper to Notebook** tool — an app that converts research paper PDFs into runnable Google Colab notebooks. You will see this same project built four different ways:

| Era | Approach | Time | Output Quality |
|-----|----------|------|---------------|
| 1.2 (Traditional) | Hand-written Python, regex-based PDF parsing | ~1 week | Mediocre — brittle, no code generation |
| 1.5 (ChatGPT) | Copy-paste from ChatGPT, manual integration | ~2 days | Better, but still manual glue work |
| 1.8 (Cursor) | AI-assisted editing with full codebase context | ~4 hours | Good, but you're still directing every change |
| 2.0 (Claude Code) | Single detailed prompt → full-stack app built live | ~15 min | Dramatically better — LLM-powered, full frontend |

The traditional version is pre-built so you can see the contrast firsthand.
