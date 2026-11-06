import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export async function downloadElementAsPdf(
  elementId: string,
  fileName: string,
  onProgress?: (loading: boolean) => void
): Promise<boolean> {
  try {
    if (onProgress) onProgress(true);

    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id ${elementId} not found`);
      window.print();
      if (onProgress) onProgress(false);
      return false;
    }

    // Capture using html2canvas-pro which natively supports oklch / Tailwind v4
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Standard A4 landscape dimensions in mm: 297 x 210
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

    if (pdfHeight <= pageHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pdfHeight);
    } else {
      // Scale to fit on single landscape sheet with margins
      const scaleFactor = (pageHeight - 10) / pdfHeight;
      const fitWidth = pageWidth * scaleFactor;
      const marginX = (pageWidth - fitWidth) / 2;
      pdf.addImage(imgData, 'JPEG', marginX, 5, fitWidth, pageHeight - 10);
    }

    pdf.save(fileName);
    if (onProgress) onProgress(false);
    return true;
  } catch (err) {
    console.error('Failed to generate direct PDF, falling back to window.print():', err);
    if (onProgress) onProgress(false);
    window.print();
    return false;
  }
}
