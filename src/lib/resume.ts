import PDFDocument from 'pdfkit';

function sanitizeMarkdownLine(line: string) {
  return line
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .trim();
}

function drawBlock(doc: InstanceType<typeof PDFDocument>, text: string, fontSize: number, options: { bold?: boolean; color?: string; indent?: number } = {}) {
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const content = sanitizeMarkdownLine(text);
  if (!content) return;

  doc.font(options.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize).fillColor(options.color ?? '#111111');
  const height = doc.heightOfString(content, { width: width - (options.indent ?? 0) });

  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  doc.text(content, {
    width: width - (options.indent ?? 0),
    indent: options.indent ?? 0,
    lineGap: 3,
  });
}

function drawBullet(doc: InstanceType<typeof PDFDocument>, text: string) {
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const content = sanitizeMarkdownLine(text);
  if (!content) return;

  doc.font('Helvetica').fontSize(10.5).fillColor('#333333');
  const height = doc.heightOfString(`• ${content}`, { width: width - 12 });

  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  doc.text(`• ${content}`, {
    width: width - 12,
    indent: 12,
    lineGap: 3,
  });
}

export function renderResumePdf(markdown: string) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 54, bottom: 54, left: 54, right: 54 },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const lines = markdown.replace(/\r\n/g, '\n').split('\n');

  doc.font('Helvetica-Bold').fontSize(22).fillColor('#111111');
  doc.text('Farrel Apriandry', { align: 'left' });
  doc.moveDown(0.25);
  doc.font('Helvetica').fontSize(11).fillColor('#555555');
  doc.text('Software Engineering SME | Full-Stack Developer');
  doc.moveDown(0.75);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      doc.moveDown(0.45);
      continue;
    }

    if (trimmed === '---') {
      const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      doc.moveDown(0.2);
      doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + width, doc.y).strokeColor('#D1D5DB').lineWidth(0.8).stroke();
      doc.moveDown(0.35);
      continue;
    }

    if (trimmed.startsWith('# ')) {
      drawBlock(doc, trimmed.slice(2), 16, { bold: true, color: '#111111' });
      doc.moveDown(0.2);
      continue;
    }

    if (trimmed.startsWith('## ')) {
      drawBlock(doc, trimmed.slice(3), 13, { bold: true, color: '#111111' });
      doc.moveDown(0.15);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      drawBlock(doc, trimmed.slice(4), 11.5, { bold: true, color: '#111111' });
      continue;
    }

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      drawBullet(doc, trimmed.slice(2));
      continue;
    }

    drawBlock(doc, trimmed, 10.5, { color: '#333333' });
  }

  doc.end();
  return done;
}
