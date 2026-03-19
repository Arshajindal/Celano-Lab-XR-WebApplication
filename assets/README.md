# Assets Organization Guide

This directory contains product-specific PDFs and images for lab tools referenced in `data/labtools.json`.

## Folder Structure

```
assets/
├── qnami-proteusq/
│   ├── pdfs/
│   │   ├── proteusq_spec_sheet.pdf
│   │   └── proteusq_brochure.pdf
│   └── images/
│       └── proteusq_system.jpg
└── park-nx-hivac/
    ├── pdfs/
    │   ├── nx_hivac_brochure.pdf
    │   └── nx_hivac_product_page.pdf
    └── images/
        └── nx_hivac_system.jpg
```

## Usage in JSON

In your `labtools.json`, reference local assets using the `localPath` field:

```json
{
  "pdfs": [
    {
      "type": "spec-sheet",
      "title": "Qnami ProteusQ Specification Sheet",
      "localPath": "assets/qnami-proteusq/pdfs/proteusq_spec_sheet.pdf",
      "url": "https://qnami.ch/wp-content/uploads/2020/06/Spec_sheet_ProteusQ.pdf"
    }
  ],
  "images": [
    {
      "label": "Qnami ProteusQ system overview",
      "localPath": "assets/qnami-proteusq/images/proteusq_system.jpg",
      "url": "https://qnami.ch/wp-content/uploads/2020/02/proteusq-hero-image.jpg"
    }
  ]
}
```

## Adding New Assets

1. Create a new vendor folder: `assets/vendor-product-name/`
2. Create subdirectories: `pdfs/` and `images/`
3. Add your files to the appropriate subdirectories
4. Update the JSON references with the `localPath` field

## File Naming Convention

- Use lowercase with hyphens for spaces: `product-name_component.pdf`
- Be descriptive: `nx_hivac_brochure.pdf`, `proteusq_system.jpg`
- Avoid special characters and spaces in filenames
