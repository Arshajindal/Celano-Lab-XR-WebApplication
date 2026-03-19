# XR-LabTools

**Celano Lab Tools Gallery** - A Next.js web application showcasing research tools and equipment at the Celano Nanoelectronics Metrology & Failure Analysis Lab at Arizona State University.

## Features

- 🎨 **Welcome Page** - Lab information with vertical scrolling tool list
- 🔍 **Tool Details** - Individual pages for each research tool with specs, images, PDFs, and videos
- 📱 **Responsive Design** - Mobile-friendly layout with modern styling
- ⚡ **Next.js 14** - Static generation with dynamic routes
- 🎯 **TypeScript** - Full type safety

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Deployment**: Google Cloud Run (Docker)

## Local Development

### Prerequisites

- Node.js 20+ (with npm)
- Git

### Setup

1. **Clone or navigate to project**
   ```bash
   cd "c:\Users\arsha\Desktop\Arsha\ASU\XR Research\XR-LabTools"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
XR-LabTools/
├── components/          # React components
│   ├── Welcome.tsx      # Homepage with lab info
│   ├── ToolDetail.tsx   # Individual tool detail page
│   ├── LabToolsGallery.tsx  # Tool gallery component
│   └── *.module.css     # Component styles
├── pages/
│   ├── index.tsx        # Homepage route
│   ├── tools/
│   │   └── [toolId].tsx # Dynamic tool detail routes
│   └── _app.tsx         # App wrapper
├── public/
│   └── assets/          # Static images and files
├── data/
│   └── labtools.json    # Tool data
├── Dockerfile           # Docker configuration
├── DEPLOY.md            # Deployment guide
└── CHANGELOG.md         # Project history
```

## Deployment to Google Cloud Run

### Quick Deploy

```bash
# PowerShell (Windows)
.\deploy-cloudrun.ps1 YOUR_PROJECT_ID

# Bash (Mac/Linux)
./deploy-cloudrun.sh YOUR_PROJECT_ID
```

### Manual Deploy

```bash
gcloud run deploy xr-labtools \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

👉 **Full deployment guide**: See [DEPLOY.md](DEPLOY.md)

## Data Structure

Tool data is stored in `data/labtools.json` with the following structure:

```json
{
  "lab": {
    "name": "Lab Name",
    "location": "Location",
    "website": "URL"
  },
  "tools": [
    {
      "toolId": "UNIQUE-ID",
      "name": "Tool Name",
      "vendor": "Vendor Name",
      "model": "Model Number",
      "category": "Category",
      "shortDescription": "Brief description",
      "specs": { ... },
      "pdfs": [ ... ],
      "images": [ ... ],
      "videos": [ ... ]
    }
  ]
}
```

## Adding New Tools

1. Edit `data/labtools.json`
2. Add images to `public/assets/[tool-folder]/images/`
3. Update image URLs in JSON to `/assets/[tool-folder]/images/[filename]`
4. Rebuild: `npm run build`

## Contributing

This project is maintained by the Celano Lab at ASU. For questions or contributions, please contact the lab through the [official website](https://labs.engineering.asu.edu/celano/).

## License

© 2026 Celano Lab, Arizona State University

---

**Lab Website**: https://labs.engineering.asu.edu/celano/  
**Project**: XR-LabTools Gallery  
**Version**: 1.0.0
