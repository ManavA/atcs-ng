#!/usr/bin/env python3
"""
PDF Generator for hanaML Documentation
Converts Markdown files to styled PDFs using the purple hanaML theme.
"""

import markdown
import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime

# Configuration
DOCS_DIR = Path(__file__).parent.parent
STYLES_DIR = DOCS_DIR / "styles"
OUTPUT_DIR = DOCS_DIR / "pdf"
CSS_FILE = STYLES_DIR / "pdf-theme.css"

# Documents to convert
MAIN_DOCS = [
    ("product-requirements-document.md", "PRD-ATCS-NG-v2.5.0.pdf"),
    ("design-document.md", "Design-Document-ATCS-NG-v2.5.0.pdf"),
    ("technical-specification.md", "Technical-Specification-ATCS-NG-v2.5.0.pdf"),
    ("release-plan.md", "Release-Plan-ATCS-NG-v2.5.0.pdf"),
]

TEMPLATE_DOCS = [
    ("templates/TEMPLATE-product-requirements-document.md", "TEMPLATE-PRD.pdf"),
    ("templates/TEMPLATE-design-document.md", "TEMPLATE-Design-Document.pdf"),
    ("templates/TEMPLATE-technical-specification.md", "TEMPLATE-Technical-Specification.pdf"),
    ("templates/TEMPLATE-release-plan.md", "TEMPLATE-Release-Plan.pdf"),
]

def read_css():
    """Read the CSS stylesheet."""
    if CSS_FILE.exists():
        return CSS_FILE.read_text()
    return ""

def convert_md_to_html(md_content, title, source_dir):
    """Convert Markdown to styled HTML."""
    # Initialize markdown with extensions
    md = markdown.Markdown(extensions=[
        'tables',
        'fenced_code',
        'codehilite',
        'toc',
        'meta',
        'attr_list',
        'def_list',
        'footnotes',
        'md_in_html',
    ])

    # Convert markdown to HTML
    html_body = md.convert(md_content)

    import re

    # Convert any remaining markdown image syntax to HTML img tags
    # (markdown inside <div> tags doesn't get processed)
    def md_image_to_html(match):
        alt = match.group(1)
        src = match.group(2)
        return f'<img src="{src}" alt="{alt}" style="max-height: 40px;">'

    html_body = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', md_image_to_html, html_body)

    # Fix relative image paths to absolute paths for PDF generation
    def fix_image_path(match):
        src = match.group(1)
        if not src.startswith(('http://', 'https://', '/')):
            # Convert relative path to absolute
            abs_path = (source_dir / src).resolve()
            return f'src="file://{abs_path}"'
        return match.group(0)

    html_body = re.sub(r'src="([^"]+)"', fix_image_path, html_body)

    # Read CSS
    css = read_css()

    # Create full HTML document
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
{css}
    </style>
</head>
<body>
{html_body}
    <div class="footer">
        <span class="badge">hanaML</span>
        <p>Generated on {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
    </div>
</body>
</html>'''

    return html

def html_to_pdf(html_path, pdf_path):
    """Convert HTML to PDF using wkhtmltopdf."""
    cmd = [
        'wkhtmltopdf',
        '--enable-local-file-access',
        '--page-size', 'A4',
        '--margin-top', '20mm',
        '--margin-bottom', '25mm',
        '--margin-left', '15mm',
        '--margin-right', '15mm',
        '--header-spacing', '5',
        '--footer-spacing', '5',
        '--footer-center', '[page] / [topage]',
        '--footer-font-size', '9',
        '--header-center', 'hanaML Documentation',
        '--header-font-size', '9',
        '--header-font-name', 'Inter',
        '--encoding', 'UTF-8',
        '--print-media-type',
        '--no-stop-slow-scripts',
        '--javascript-delay', '1000',
        str(html_path),
        str(pdf_path)
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode != 0:
            print(f"  Warning: {result.stderr[:200] if result.stderr else 'Unknown error'}")
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print("  Error: PDF generation timed out")
        return False
    except Exception as e:
        print(f"  Error: {e}")
        return False

def process_document(md_file, pdf_name, is_template=False):
    """Process a single document."""
    md_path = DOCS_DIR / md_file

    if not md_path.exists():
        print(f"  Skipping: {md_file} (file not found)")
        return False

    print(f"  Converting: {md_file}")

    # Read markdown
    md_content = md_path.read_text()

    # Extract title from first heading or filename
    title = pdf_name.replace('.pdf', '').replace('-', ' ')
    for line in md_content.split('\n'):
        if line.startswith('# '):
            title = line[2:].strip()
            break

    # Convert to HTML (pass source directory for resolving relative paths)
    source_dir = md_path.parent
    html_content = convert_md_to_html(md_content, title, source_dir)

    # Create temp HTML file
    html_path = OUTPUT_DIR / pdf_name.replace('.pdf', '.html')
    html_path.write_text(html_content)

    # Convert to PDF
    pdf_path = OUTPUT_DIR / pdf_name
    success = html_to_pdf(html_path, pdf_path)

    # Clean up HTML (optional - keep for debugging)
    # html_path.unlink()

    if success:
        print(f"  Created: {pdf_path.name}")
    else:
        print(f"  Failed: {pdf_path.name}")

    return success

def main():
    """Main entry point."""
    print("\n" + "="*60)
    print("  hanaML Documentation PDF Generator")
    print("="*60 + "\n")

    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Process main documents
    print("Processing Main Documents:")
    print("-" * 40)
    main_success = 0
    for md_file, pdf_name in MAIN_DOCS:
        if process_document(md_file, pdf_name):
            main_success += 1

    print(f"\nMain Documents: {main_success}/{len(MAIN_DOCS)} successful\n")

    # Process template documents
    print("Processing Template Documents:")
    print("-" * 40)
    template_success = 0
    for md_file, pdf_name in TEMPLATE_DOCS:
        if process_document(md_file, pdf_name, is_template=True):
            template_success += 1

    print(f"\nTemplate Documents: {template_success}/{len(TEMPLATE_DOCS)} successful\n")

    # Summary
    total = main_success + template_success
    total_expected = len(MAIN_DOCS) + len(TEMPLATE_DOCS)

    print("="*60)
    print(f"  Total: {total}/{total_expected} PDFs generated")
    print(f"  Output: {OUTPUT_DIR}")
    print("="*60 + "\n")

    # List generated files
    if OUTPUT_DIR.exists():
        pdfs = list(OUTPUT_DIR.glob("*.pdf"))
        if pdfs:
            print("Generated PDFs:")
            for pdf in sorted(pdfs):
                size = pdf.stat().st_size / 1024
                print(f"  - {pdf.name} ({size:.1f} KB)")

    return 0 if total == total_expected else 1

if __name__ == "__main__":
    sys.exit(main())
