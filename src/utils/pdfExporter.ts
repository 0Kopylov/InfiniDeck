import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Slide, PaintStroke } from '../types';

/**
 * Exports all slides into a polished presentation PDF.
 */
export async function exportDeckToPDF(slides: Slide[], title: string = 'Canvas Presentation'): Promise<void> {
  // Landscape 16:9 PDF
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: [1920, 1080],
  });

  const sortedSlides = [...slides].sort((a, b) => a.orderIndex - b.orderIndex);

  for (let i = 0; i < sortedSlides.length; i++) {
    const slide = sortedSlides[i];
    if (i > 0) {
      pdf.addPage([1920, 1080], 'landscape');
    }

    // Capture DOM slide element if rendered
    const slideElement = document.getElementById(`slide-frame-${slide.id}`);
    if (slideElement) {
      try {
        const canvas = await html2canvas(slideElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: slide.theme.bg || '#111216',
          logging: false,
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080);
        continue;
      } catch (err) {
        console.warn('html2canvas capture failed, falling back to programmatic PDF render', err);
      }
    }

    // Programmatic Fallback Rendering
    pdf.setFillColor(slide.theme.bg || '#111216');
    pdf.rect(0, 0, 1920, 1080, 'F');

    // Header bar
    pdf.setFillColor(slide.theme.accent || '#38bdf8');
    pdf.rect(60, 60, 8, 80, 'F');

    pdf.setTextColor('#ffffff');
    pdf.setFontSize(36);
    pdf.text(slide.title, 90, 105);

    if (slide.subtitle) {
      pdf.setTextColor('#94a3b8');
      pdf.setFontSize(20);
      pdf.text(slide.subtitle, 90, 135);
    }

    // Meeting context pill
    if (slide.meetingContext) {
      pdf.setTextColor(slide.theme.accent || '#38bdf8');
      pdf.setFontSize(16);
      pdf.text(
        `[${slide.timelineCategory.toUpperCase()}] ${slide.meetingContext.date} • ${slide.meetingContext.status}`,
        1400,
        105
      );
    }

    // Elements summary
    let textY = 220;
    for (const el of slide.elements) {
      if (el.type === 'markdown' && el.content) {
        pdf.setFillColor('#1e293b');
        pdf.roundedRect(80, textY, 860, 240, 8, 8, 'F');
        pdf.setTextColor('#f1f5f9');
        pdf.setFontSize(16);
        const cleanText = el.content.replace(/[#*`_>]/g, '');
        const splitText = pdf.splitTextToSize(cleanText, 800);
        pdf.text(splitText.slice(0, 10), 110, textY + 40);
        textY += 270;
      }
    }

    // Footer page indicator
    pdf.setTextColor('#64748b');
    pdf.setFontSize(14);
    pdf.text(`${i + 1} / ${sortedSlides.length} • Infinideck`, 960, 1030, { align: 'center' });
  }

  pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}-deck.pdf`);
}

/**
 * Exports a single slide or entire presentation to high-resolution PNG.
 */
export async function exportSlideToPNG(slideId: string, title: string = 'slide'): Promise<void> {
  const slideElement = document.getElementById(`slide-frame-${slideId}`);
  if (!slideElement) {
    throw new Error('Slide DOM element not found');
  }

  const canvas = await html2canvas(slideElement, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Exports deck data into JSON bundle file (.cdeck / .json)
 */
export function exportDeckToJSON(slides: Slide[], strokes: PaintStroke[], title: string = 'presentation'): void {
  const bundle = {
    title,
    version: '1.0',
    exportedAt: new Date().toISOString(),
    slides,
    paintStrokes: strokes,
  };

  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.cdeck.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a self-contained, standalone HTML presentation.
 */
export function exportStandaloneHTML(slides: Slide[], title: string = 'presentation'): void {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - Canvas Presentation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #090a0f; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; height: 100vh; display: flex; flex-direction: column; }
    header { height: 50px; background: #111318; border-bottom: 1px solid #27272a; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
    .title { font-weight: 600; font-size: 16px; color: #38bdf8; }
    .nav-btn { background: #27272a; color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .nav-btn:hover { background: #3f3f46; }
    main { flex: 1; position: relative; overflow: auto; display: flex; align-items: center; justify-content: center; background: radial-gradient(#27272a 1px, transparent 1px); background-size: 32px 32px; }
    .slide-card { width: 1000px; height: 580px; background: #13151b; border: 1px solid #38bdf840; border-radius: 12px; padding: 36px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); position: relative; }
    .slide-header { margin-bottom: 24px; }
    .slide-title { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
    .slide-sub { color: #94a3b8; font-size: 16px; }
    .slide-body { font-size: 16px; line-height: 1.6; color: #cbd5e1; }
    .footer { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(24,24,27,0.85); backdrop-filter: blur(8px); padding: 8px 20px; border-radius: 30px; border: 1px solid #3f3f46; display: flex; gap: 16px; align-items: center; }
  </style>
</head>
<body>
  <header>
    <div class="title">${title}</div>
    <div>Standalone Portable Deck</div>
  </header>
  <main>
    <div id="deck-container" class="slide-card"></div>
  </main>
  <div class="footer">
    <button class="nav-btn" onclick="prevSlide()">← Previous</button>
    <span id="slide-num">1 / ${slides.length}</span>
    <button class="nav-btn" onclick="nextSlide()">Next →</button>
  </div>
  <script>
    const slides = ${JSON.stringify(slides)};
    let currentIndex = 0;
    function render() {
      const s = slides[currentIndex];
      const container = document.getElementById('deck-container');
      document.getElementById('slide-num').innerText = (currentIndex + 1) + ' / ' + slides.length;
      container.style.background = s.theme?.bg || '#13151b';
      let elementsHtml = s.elements.map(e => '<div style="margin-bottom:16px;background:#1e293b40;padding:16px;border-radius:8px;border:1px solid #334155;">' + (e.content || '') + '</div>').join('');
      container.innerHTML = '<div class="slide-header"><div class="slide-title">' + s.title + '</div><div class="slide-sub">' + (s.subtitle || '') + '</div></div><div class="slide-body">' + elementsHtml + '</div>';
    }
    function nextSlide() { if (currentIndex < slides.length - 1) { currentIndex++; render(); } }
    function prevSlide() { if (currentIndex > 0) { currentIndex--; render(); } }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    });
    render();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-deck.html`;
  a.click();
  URL.revokeObjectURL(url);
}
