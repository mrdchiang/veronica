# Veronica - AI Desktop Buddy

## Setup
1. Open https://mrdchiang.github.io/veronica/
2. Click the ⚙ gear icon in the top-right
3. Enter a DeepSeek API key (get one at https://platform.deepseek.com/api_keys)
4. Without a key, Veronica responds with local fallback lines

## Features
- 3D MMD model rendering (Veronica from Chaos Zero Nightmare)
- Procedural idle animation (breathing, subtle sway)
- AI chat with character personality via DeepSeek API
- Sir Kowalski notification companion popup
- Dark glass-morphism UI

## Tech Stack
- Three.js via CDN + MMDLoader for PMX model
- DeepSeek API for AI chat (browser-side fetch)
- Plain HTML/CSS/JS — no build step

## File Structure
```
index.html                          — Main app (open this)
models/Veronica_MMD_Model_v2/
  Veronica_Character_MMD_Model/
    Veronica_Character.pmx          — Main model (2.6MB)
    textures/                       — 6 texture PNGs (~6.5MB)
  Veronica_SirKowalski_MMD_Model/
    Veronica_SirKowalski.pmx        — Companion model (549KB)
  Veronica_Weapon_MMD_Model/
    Veronica_Weapon_MMD_Model.pmx   — Weapon model (678KB)
```

## API Key
Stored in localStorage as `deepseek_api_key`. Input is password-masked. Key never sent anywhere except directly to api.deepseek.com via the browser's fetch API.

## Model Credits
Chaos Zero Nightmare (Smilegate) — MMD fan kit model of Veronica.
