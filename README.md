# ❶ VOXX NEXUS — CINEMATIC WEBGL

Next-generation digital technology studio landing page.

## Included
- Real Three.js WebGL scene
- Custom GLSL vertex + fragment shaders
- UnrealBloomPass post-processing / bloom
- Scroll-controlled camera choreography
- Pointer-reactive 3D core
- OrbitControls with damping
- Actual glTF asset: `assets/voxx-core.gltf` + `assets/voxx-core.bin`
- Particle universe, emissive lighting, fog and cinematic vignette
- Loading sequence and HUD
- Full service narrative: Web, AI, APIs, Automation, Creative
- Responsive layout

## Important
The included core is a generated glTF asset and is intentionally lightweight for the web. If you have a Blender model/brand object, replace `assets/voxx-core.gltf` and its `.bin` with your exported GLTF/GLB and keep the loader path updated.

## Run
Because GLTF and ES modules are loaded from files, use a local HTTP server rather than double-clicking the HTML.

Example:
`python -m http.server 8000`

Open:
`http://localhost:8000`

## Deploy
Static hosting works on Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.

## Production checklist
- Replace the demo portfolio with real projects.
- Connect the contact form to Formspree, Resend, your own API, etc.
- Add the real WhatsApp/business contact.
- Replace placeholder social links.
- Consider self-hosting/pinning Three.js and Google fonts.
- Provide a reduced-motion / low-power mode for very low-end devices.
