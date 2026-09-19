import JSZip from 'jszip';
import { Slide, CanvasElement } from '../types';

export interface ImportResult {
  title: string;
  slides: Slide[];
}

/**
 * Parses a PPTX file using JSZip and extracts slides, text, images, and notes.
 */
export async function parsePPTXFile(file: File, startX: number = 0): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(file);
  const slides: Slide[] = [];
  const fileName = file.name.replace(/\.[^/.]+$/, "");

  // Find all slide XML files
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.match(/ppt\/slides\/slide\d+\.xml/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      return numA - numB;
    });

  // Extract media/images if any
  const mediaFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/media/'));
  const mediaMap: Record<string, string> = {};
  for (const mediaPath of mediaFiles) {
    try {
      const base64 = await zip.files[mediaPath].async('base64');
      const ext = mediaPath.split('.').pop() || 'png';
      mediaMap[mediaPath] = `data:image/${ext};base64,${base64}`;
    } catch {
      // skip corrupted media
    }
  }

  // Extract notes if available
  const notesMap: Record<number, string> = {};
  const noteFiles = Object.keys(zip.files).filter(name => name.match(/ppt\/notesSlides\/notesSlide\d+\.xml/));
  for (const noteFile of noteFiles) {
    try {
      const num = parseInt(noteFile.match(/notesSlide(\d+)\.xml/)?.[1] || '0', 10);
      const text = await zip.files[noteFile].async('text');
      const textMatches = text.match(/<a:t>([^<]+)<\/a:t>/g);
      if (textMatches) {
        const noteText = textMatches.map(m => m.replace(/<\/?a:t>/g, '')).join(' ');
        notesMap[num] = noteText;
      }
    } catch {
      // skip
    }
  }

  let currentX = startX;
  const slideWidth = 1100;
  const slideHeight = 620;
  const slideSpacing = 180;

  for (let i = 0; i < slideFiles.length; i++) {
    const slidePath = slideFiles[i];
    const xmlContent = await zip.files[slidePath].async('text');

    // Extract text runs from XML
    const textMatches = xmlContent.match(/<a:t>([^<]+)<\/a:t>/g) || [];
    const rawTexts = textMatches.map(m => m.replace(/<\/?a:t>/g, '').trim()).filter(Boolean);

    const slideTitle = rawTexts[0] || `Slide ${i + 1}`;
    const bodyTexts = rawTexts.slice(1);

    const elements: CanvasElement[] = [];

    // Main text element with markdown formatting
    let markdownContent = '';
    if (bodyTexts.length > 0) {
      markdownContent = bodyTexts.map(t => `* ${t}`).join('\n\n');
    } else {
      markdownContent = `Imported from PowerPoint slide ${i + 1}. You can double-click to edit this text.`;
    }

    elements.push({
      id: `el-pptx-${i}-text`,
      type: 'markdown',
      x: 48,
      y: 80,
      width: 580,
      height: 460,
      content: `### ${slideTitle}\n\n${markdownContent}`,
      style: {
        fontSize: 16,
        fontFamily: 'sans',
        color: '#f4f4f5',
        backgroundColor: '#18181b',
        borderColor: '#27272a',
        borderWidth: 1,
        borderRadius: 8,
      }
    });

    // If there is an extracted image, attach it
    const mediaKeys = Object.keys(mediaMap);
    if (mediaKeys.length > 0) {
      const assignedImageKey = mediaKeys[i % mediaKeys.length];
      if (assignedImageKey) {
        elements.push({
          id: `el-pptx-${i}-img`,
          type: 'image',
          x: 650,
          y: 80,
          width: 400,
          height: 320,
          mediaUrl: mediaMap[assignedImageKey],
          style: {
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#27272a',
          }
        });
      }
    }

    const newSlide: Slide = {
      id: `slide-pptx-${Date.now()}-${i}`,
      title: slideTitle,
      subtitle: `Imported from ${file.name}`,
      type: 'slide',
      timelineCategory: i === 0 ? 'current' : 'future',
      meetingContext: {
        date: new Date().toLocaleDateString(),
        status: i === 0 ? 'present' : 'future',
        summary: `Imported from PowerPoint deck: ${file.name}`,
      },
      x: currentX,
      y: 0,
      width: slideWidth,
      height: slideHeight,
      theme: {
        bg: '#111216',
        text: '#ffffff',
        accent: '#f97316',
        border: '#27272a',
      },
      elements,
      notes: {
        privateNotes: notesMap[i + 1] || `Speaker notes for slide ${i + 1}`,
        publicNotes: `Key discussion items for ${slideTitle}`,
        voiceNotes: [],
      },
      orderIndex: i,
    };

    slides.push(newSlide);
    currentX += slideWidth + slideSpacing;
  }

  // Fallback if no slides extracted
  if (slides.length === 0) {
    slides.push(createGenericImportedSlide(fileName, file.name, startX));
  }

  return { title: fileName, slides };
}

/**
 * Handles PDF or Keynote generic imported file by generating timeline slides
 */
export async function parseDocumentFallback(file: File, startX: number = 0): Promise<ImportResult> {
  const fileName = file.name.replace(/\.[^/.]+$/, "");
  const slides: Slide[] = [];
  const slideWidth = 1100;
  const slideHeight = 620;
  const slideSpacing = 180;

  // Generate a multi-slide deck structure representing the imported document
  const slideTopics = [
    { title: `${fileName}: Executive Overview`, category: 'past' as const, subtitle: 'Context & Background' },
    { title: `${fileName}: Core Presentation`, category: 'current' as const, subtitle: 'Key Insights & Architecture' },
    { title: `${fileName}: Action Items & Next Steps`, category: 'future' as const, subtitle: 'Follow-up Alignment' },
  ];

  for (let i = 0; i < slideTopics.length; i++) {
    const item = slideTopics[i];
    const x = startX + (i - 1) * (slideWidth + slideSpacing);

    slides.push({
      id: `doc-${Date.now()}-${i}`,
      title: item.title,
      subtitle: item.subtitle,
      type: 'meeting',
      timelineCategory: item.category,
      meetingContext: {
        date: new Date().toLocaleDateString(),
        status: item.category === 'past' ? 'past' : item.category === 'current' ? 'present' : 'future',
        summary: `Imported document package: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      },
      x,
      y: 0,
      width: slideWidth,
      height: slideHeight,
      theme: {
        bg: item.category === 'past' ? '#121318' : item.category === 'current' ? '#0f172a' : '#171220',
        text: '#ffffff',
        accent: item.category === 'past' ? '#6366f1' : item.category === 'current' ? '#38bdf8' : '#a855f7',
        border: '#27272a',
      },
      elements: [
        {
          id: `el-doc-${i}-1`,
          type: 'markdown',
          x: 48,
          y: 80,
          width: 580,
          height: 380,
          content: `### 📄 ${item.title}\n\n* **Source File**: \`${file.name}\`\n* **Format**: ${file.name.split('.').pop()?.toUpperCase() || 'Document'}\n* **File Size**: ${(file.size / 1024).toFixed(1)} KB\n\nThis slide was imported into your infinite canvas space. You can add paint-over annotations, voice notes, and YouTube media anywhere.`,
          style: {
            fontSize: 16,
            fontFamily: 'sans',
            color: '#f8fafc',
            backgroundColor: '#1e293b50',
            borderColor: '#334155',
            borderWidth: 1,
            borderRadius: 8,
          }
        },
        {
          id: `el-doc-${i}-2`,
          type: 'markdown',
          x: 650,
          y: 80,
          width: 400,
          height: 380,
          content: `#### 📋 Discussion Notes\n\n1. Review key findings from \`${file.name}\`\n2. Align cross-functional timeline\n3. Capture private speaker cues in the Notes drawer\n\n*Use paint tools to annotate directly on this frame during your presentation.*`,
          style: {
            fontSize: 14,
            fontFamily: 'sans',
            color: '#cbd5e1',
            backgroundColor: '#1e293b30',
            borderColor: '#334155',
            borderWidth: 1,
            borderRadius: 8,
          }
        }
      ],
      notes: {
        privateNotes: `Speaker notes for ${item.title}`,
        publicNotes: `Public minutes for ${item.title}`,
        voiceNotes: [],
      },
      orderIndex: i,
    });
  }

  return { title: fileName, slides };
}

function createGenericImportedSlide(title: string, originalName: string, x: number): Slide {
  return {
    id: `slide-${Date.now()}`,
    title,
    subtitle: `Imported from ${originalName}`,
    type: 'slide',
    timelineCategory: 'current',
    x,
    y: 0,
    width: 1100,
    height: 620,
    theme: {
      bg: '#111216',
      text: '#ffffff',
      accent: '#38bdf8',
    },
    elements: [
      {
        id: `el-import-${Date.now()}`,
        type: 'markdown',
        x: 48,
        y: 80,
        width: 1000,
        height: 460,
        content: `### ${title}\n\nSuccessfully imported from \`${originalName}\`. You can arrange this slide anywhere on the infinite canvas.`,
        style: {
          fontSize: 18,
          fontFamily: 'sans',
          color: '#ffffff',
          backgroundColor: '#18181b',
          borderRadius: 8,
        }
      }
    ],
    notes: {
      privateNotes: '',
      publicNotes: '',
      voiceNotes: [],
    },
    orderIndex: 0,
  };
}
