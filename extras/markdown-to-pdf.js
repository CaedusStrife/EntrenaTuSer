const fs = require('fs');
const path = require('path');
const marked = require('marked');
const puppeteer = require('puppeteer');

async function markdownToPdf(markdownPath, pdfPath) {
    // Read markdown file
    const markdown = fs.readFileSync(markdownPath, 'utf-8');

    // Convert markdown to HTML
    const htmlContent = marked.parse(markdown);

    // Create full HTML with styling for PDF
    const fullHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de Calidad y Pruebas - Entrena Tu Ser</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            margin: 2.5cm;
            size: A4;
            @bottom-center {
                content: "Página " counter(page) " de " counter(pages);
                font-size: 10pt;
                color: #666;
            }
        }

        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 0;
        }

        h1 {
            font-size: 28pt;
            color: #1a1a2e;
            border-bottom: 3px solid #ff6b35;
            padding-bottom: 10px;
            margin-bottom: 30px;
            page-break-after: avoid;
        }

        h2 {
            font-size: 20pt;
            color: #2c3e50;
            border-bottom: 2px solid #00c8b3;
            padding-bottom: 8px;
            margin-top: 40px;
            margin-bottom: 20px;
            page-break-after: avoid;
        }

        h3 {
            font-size: 16pt;
            color: #34495e;
            margin-top: 30px;
            margin-bottom: 15px;
            page-break-after: avoid;
        }

        h4 {
            font-size: 13pt;
            color: #34495e;
            margin-top: 20px;
            margin-bottom: 10px;
            page-break-after: avoid;
        }

        p {
            margin-bottom: 12px;
            text-align: justify;
        }

        ul, ol {
            margin-bottom: 15px;
            padding-left: 30px;
        }

        li {
            margin-bottom: 6px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            page-break-inside: avoid;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 10px 12px;
            text-align: left;
            font-size: 10pt;
        }

        th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
        }

        tr:nth-child(even) {
            background-color: #fafafa;
        }

        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 9pt;
        }

        pre {
            background-color: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
            page-break-inside: avoid;
            font-size: 8.5pt;
            line-height: 1.4;
        }

        pre code {
            background: none;
            padding: 0;
            color: inherit;
        }

        blockquote {
            border-left: 4px solid #ff6b35;
            padding-left: 15px;
            margin: 15px 0;
            color: #555;
            font-style: italic;
        }

        strong {
            color: #2c3e50;
        }

        em {
            color: #555;
        }

        a {
            color: #ff6b35;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        hr {
            border: none;
            border-top: 1px solid #eee;
            margin: 30px 0;
        }

        .toc {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            page-break-after: always;
        }

        .toc h2 {
            border: none;
            margin-top: 0;
            margin-bottom: 15px;
        }

        .toc ul {
            list-style: none;
            padding: 0;
        }

        .toc li {
            padding: 5px 0;
            border-bottom: 1px dotted #ddd;
        }

        .toc a {
            text-decoration: none;
            color: #2c3e50;
        }

        .page-break {
            page-break-after: always;
        }

        .header-info {
            background: linear-gradient(135deg, #ff6b35 0%, #00c8b3 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            page-break-after: always;
        }

        .header-info h1 {
            color: white;
            border: none;
            margin: 0;
            font-size: 24pt;
        }

        .header-info .meta {
            margin-top: 15px;
            font-size: 11pt;
            opacity: 0.9;
        }

        .header-info .meta div {
            margin: 5px 0;
        }

        .checkmark {
            color: #27ae60;
            font-weight: bold;
        }

        .crossmark {
            color: #e74c3c;
            font-weight: bold;
        }

        .warning {
            color: #f39c12;
            font-weight: bold;
        }

        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        .badge-critical { background: #e74c3c; color: white; }
        .badge-high { background: #e67e22; color: white; }
        .badge-medium { background: #f39c12; color: white; }
        .badge-low { background: #3498db; color: white; }
        .badge-pass { background: #27ae60; color: white; }
        .badge-fail { background: #e74c3c; color: white; }

        /* Mermaid diagrams placeholder */
        .mermaid {
            background: #f8f9fa;
            border: 1px dashed #ddd;
            padding: 20px;
            text-align: center;
            color: #666;
            font-style: italic;
            margin: 15px 0;
            border-radius: 5px;
        }

        @media print {
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header-info">
        <h1>Informe de Resultados del Aseguramiento de Calidad y Pruebas de Software</h1>
        <div class="meta">
            <div><strong>Proyecto:</strong> Entrena Tu Ser - Plataforma Web de Entrenamiento Guiado</div>
            <div><strong>Fecha:</strong> 17 de noviembre de 2025</div>
            <div><strong>Versión:</strong> 1.0</div>
            <div><strong>Equipo:</strong> Proyecto Integrador</div>
        </div>
    </div>

    ${htmlContent}
</body>
</html>`;

    // Write temporary HTML file
    const tempHtmlPath = path.join(path.dirname(markdownPath), 'temp-report.html');
    fs.writeFileSync(tempHtmlPath, fullHtml);

    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });

    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '2.5cm',
            right: '2.5cm',
            bottom: '2.5cm',
            left: '2.5cm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 8px; width: 100%; text-align: center; color: #999; padding-top: 5px;">Entrena Tu Ser - Informe de Calidad y Pruebas</div>',
        footerTemplate: '<div style="font-size: 8px; width: 100%; text-align: center; color: #999; padding-bottom: 5px;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>'
    });

    await browser.close();

    // Clean up temp file
    fs.unlinkSync(tempHtmlPath);

    console.log(`PDF generado exitosamente: ${pdfPath}`);
}

const markdownPath = path.join(__dirname, 'INFORME_CALIDAD_Y_PRUEBAS.md');
const pdfPath = path.join(__dirname, 'INFORME_CALIDAD_Y_PRUEBAS.pdf');

markdownToPdf(markdownPath, pdfPath).catch(console.error);