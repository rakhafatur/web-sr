import type jsPDF from 'jspdf';

export type RGB = [number, number, number];

export type IconType =
  | 'person'
  | 'store'
  | 'lock'
  | 'calendar'
  | 'coffee'
  | 'heart-plus';

export const PDF_COLORS = {
  primary: [37, 99, 235] as RGB,
  primaryDark: [29, 78, 216] as RGB,
  primarySoft: [219, 234, 254] as RGB,
  ink: [15, 23, 42] as RGB,
  body: [51, 65, 85] as RGB,
  muted: [100, 116, 139] as RGB,
  border: [226, 232, 240] as RGB,
  bg: [248, 250, 252] as RGB,
  white: [255, 255, 255] as RGB,
  danger: [220, 38, 38] as RGB,
  slateSoft: [241, 245, 249] as RGB,
};

type Colors = typeof PDF_COLORS;

export const drawBackground = (
  doc: jsPDF,
  C: Colors,
  pageWidth: number,
  pageHeight: number
) => {
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
};

export const drawDecorativeCircles = (
  doc: jsPDF,
  C: Colors,
  pageWidth: number
) => {
  doc.saveGraphicsState();
  doc.setGState(doc.GState({ opacity: 0.5 }));
  doc.setFillColor(...C.primarySoft);
  doc.circle(pageWidth - 12, 4, 42, 'F');
  doc.restoreGraphicsState();

  doc.saveGraphicsState();
  doc.setGState(doc.GState({ opacity: 0.3 }));
  doc.setFillColor(...C.primarySoft);
  doc.circle(pageWidth - 46, 20, 22, 'F');
  doc.restoreGraphicsState();
};

export const drawFooter = (
  doc: jsPDF,
  C: Colors,
  pageWidth: number,
  pageHeight: number
) => {
  const lineY = pageHeight - 20;

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(14, lineY, pageWidth - 14, lineY);

  doc.setFillColor(...C.primary);
  doc.circle(15, lineY + 5.8, 0.8, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.muted);
  doc.text(
    `Dicetak ${new Date().toLocaleDateString('id-ID')}  •  Halaman ${doc.getNumberOfPages()}`,
    18,
    lineY + 7
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.primaryDark);
  doc.text('SR Agency System', pageWidth - 14, lineY + 7, {
    align: 'right',
  });
};

export const drawPageBadges = (doc: jsPDF, C: Colors) => {
  const total = doc.getNumberOfPages();

  for (let i = 1; i <= total; i++) {
    doc.setPage(i);

    const label = `${i} dari ${total}`;
    const textW = doc.getTextWidth(label);
    const badgeW = textW + 8;

    doc.setFillColor(...C.primarySoft);
    doc.roundedRect(14, 10, badgeW, 7, 3.5, 3.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.primaryDark);
    doc.text(label, 14 + badgeW / 2, 14.6, { align: 'center' });
  }
};

const drawIconGlyph = (
  doc: jsPDF,
  type: IconType,
  cx: number,
  cy: number,
  r: number,
  fg: RGB,
  bg: RGB
) => {
  const k = r * 0.62;

  doc.setDrawColor(...fg);

  switch (type) {
    case 'person': {
      doc.setFillColor(...fg);
      doc.circle(cx, cy - k * 0.55, k * 0.32, 'F');
      doc.ellipse(cx, cy + k * 0.34, k * 0.52, k * 0.4, 'F');
      break;
    }

    case 'store': {
      doc.setFillColor(...fg);
      doc.roundedRect(cx - k * 0.65, cy - k * 0.55, k * 1.3, k * 0.28, 0.4, 0.4, 'F');
      doc.setLineWidth(0.45);
      doc.roundedRect(cx - k * 0.55, cy - k * 0.2, k * 1.1, k * 0.85, 0.3, 0.3, 'S');
      doc.setFillColor(...fg);
      doc.rect(cx - k * 0.13, cy + k * 0.2, k * 0.26, k * 0.42, 'F');
      break;
    }

    case 'lock': {
      doc.setLineWidth(0.55);
      doc.ellipse(cx, cy - k * 0.28, k * 0.32, k * 0.4, 'S');
      doc.setFillColor(...fg);
      doc.roundedRect(cx - k * 0.5, cy - k * 0.05, k * 1.0, k * 0.7, k * 0.15, k * 0.15, 'F');
      doc.setFillColor(...bg);
      doc.circle(cx, cy + k * 0.26, k * 0.09, 'F');
      break;
    }

    case 'calendar': {
      doc.setLineWidth(0.45);
      doc.setFillColor(...bg);
      doc.roundedRect(cx - k * 0.55, cy - k * 0.42, k * 1.1, k * 0.95, k * 0.12, k * 0.12, 'FD');
      doc.setFillColor(...fg);
      doc.rect(cx - k * 0.55, cy - k * 0.42, k * 1.1, k * 0.24, 'F');
      doc.rect(cx - k * 0.35, cy - k * 0.55, k * 0.09, k * 0.24, 'F');
      doc.rect(cx + k * 0.26, cy - k * 0.55, k * 0.09, k * 0.24, 'F');
      break;
    }

    case 'coffee': {
      doc.setFillColor(...fg);
      doc.roundedRect(cx - k * 0.42, cy - k * 0.18, k * 0.72, k * 0.58, k * 0.1, k * 0.1, 'F');
      doc.setLineWidth(0.4);
      doc.ellipse(cx + k * 0.44, cy + k * 0.08, k * 0.16, k * 0.2, 'S');
      doc.setLineWidth(0.4);
      doc.line(cx - k * 0.14, cy - k * 0.24, cx - k * 0.05, cy - k * 0.44);
      doc.line(cx + k * 0.14, cy - k * 0.24, cx + k * 0.23, cy - k * 0.44);
      break;
    }

    case 'heart-plus': {
      const lobeR = k * 0.28;

      doc.setFillColor(...fg);
      doc.circle(cx - lobeR * 0.55, cy - k * 0.15, lobeR, 'F');
      doc.circle(cx + lobeR * 0.55, cy - k * 0.15, lobeR, 'F');
      doc.triangle(
        cx - lobeR * 1.1, cy - k * 0.05,
        cx + lobeR * 1.1, cy - k * 0.05,
        cx, cy + k * 0.5,
        'F'
      );

      doc.setFillColor(...bg);
      doc.rect(cx - k * 0.18, cy - k * 0.1, k * 0.36, k * 0.09, 'F');
      doc.rect(cx - k * 0.045, cy - k * 0.28, k * 0.09, k * 0.36, 'F');
      break;
    }
  }
};

export const drawIconBadge = (
  doc: jsPDF,
  type: IconType,
  cx: number,
  cy: number,
  r: number,
  C: Colors
) => {
  doc.setFillColor(...C.primarySoft);
  doc.circle(cx, cy, r, 'F');
  drawIconGlyph(doc, type, cx, cy, r, C.primary, C.primarySoft);
};

export const drawSectionTitle = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  C: Colors
) => {
  doc.setFillColor(...C.primary);
  doc.roundedRect(x, y - 4.2, 1.6, 6, 0.8, 0.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.ink);
  doc.text(text, x + 5, y);
};

export const drawProfileCard = (
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  items: { icon: IconType; label: string; value: string }[],
  C: Colors
) => {
  doc.saveGraphicsState();
  doc.setGState(doc.GState({ opacity: 0.08 }));
  doc.setFillColor(...C.ink);
  doc.roundedRect(x + 0.8, y + 1.6, w, h, 5, 5, 'F');
  doc.restoreGraphicsState();

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.setFillColor(...C.white);
  doc.roundedRect(x, y, w, h, 5, 5, 'FD');

  const colW = w / items.length;

  items.forEach((item, i) => {
    const colX = x + colW * i;

    if (i > 0) {
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.line(colX, y + 7, colX, y + h - 7);
    }

    const iconCx = colX + 12;
    const iconCy = y + h / 2;

    drawIconBadge(doc, item.icon, iconCx, iconCy, 6.5, C);

    const textX = colX + 21;
    const maxWidth = colW - 24;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text(item.label, textX, y + h / 2 - 3.5, { maxWidth });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...C.ink);
    doc.text(item.value, textX, y + h / 2 + 5, { maxWidth });
  });
};

export const drawStatCard = (
  doc: jsPDF,
  opts: {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    value: string;
    unit: string;
  },
  C: Colors
) => {
  const { x, y, w, h, label, value, unit } = opts;

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.setFillColor(...C.white);
  doc.roundedRect(x, y, w, h, 4, 4, 'FD');

  const cx = x + w / 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.primary);
  doc.text(label, cx, y + 13, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...C.ink);
  doc.text(value, cx, y + 24.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text(unit, cx, y + 30, { align: 'center' });

  doc.setFillColor(...C.primary);
  doc.roundedRect(x + w * 0.15, y + h - 1.4, w * 0.7, 1.4, 0.7, 0.7, 'F');
};
