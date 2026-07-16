# Veronica — AI Desktop Buddy (GitHub Pages)

## Cross-tool context for AI assistants

This is an interactive HTML prototype that renders the **Veronica** MMD model from Chaos Zero Nightmare (Smilegate) as an AI desktop buddy / chatbot companion.

### How it works
- **https://mrdchiang.github.io/veronica/** — GitHub Pages URL
- Single-file `index.html` loads Three.js + MMDLoader from CDN to render the PMX model
- AI chat powered by **DeepSeek API** (browser-side fetch with CORS)
- API key stored in `localStorage`, entered via settings overlay
- Without API key, falls back to randomized in-character response lines
- Sir Kowalski notification companion (🧸 emoji) with auto-tip rotation

### File structure (repo root)
```
/
├── index.html
├── README.md
├── models/
│   └── Veronica_MMD_Model_v2/
│       ├── Veronica_Character_MMD_Model/   (main model, 2.6MB PMX + 6.5MB textures)
│       ├── Veronica_SirKowalski_MMD_Model/ (companion, 549KB)
│       └── Veronica_Weapon_MMD_Model/      (weapon, 678KB)
```

### localStorage bridge
- `deepseek_api_key` — user's DeepSeek API key (never sent anywhere except api.deepseek.com)
- No cross-tool pipeline (standalone demo)
