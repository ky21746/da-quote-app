import jsPDF from 'jspdf';
import { CalculationResult, TripDraft } from '../types/ui';

export const pdfService = {
  generateQuotePDF(draft: TripDraft, calculation: CalculationResult, quoteId?: string): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(33, 37, 41);
    doc.text('Discover Africa', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(108, 117, 125);
    doc.text('Safari Quote', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Quote ID and Date
    if (quoteId) {
      doc.setFontSize(10);
      doc.text('Quote ID: ' + quoteId, 20, y);
    }
    doc.text('Date: ' + new Date().toLocaleDateString(), pageWidth - 60, y);
    y += 15;

    // Trip Details Box
    doc.setFillColor(248, 249, 250);
    doc.rect(15, y - 5, pageWidth - 30, 25, 'F');
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text(draft.name || 'Safari Trip', 20, y + 5);
    doc.setFontSize(11);
    doc.setTextColor(108, 117, 125);
    doc.text(draft.travelers + ' travelers | ' + draft.days + ' days | ' + (draft.tier || 'base'), 20, y + 15);
    y += 35;

    // Parse totals from strings (e.g., "USD 1234.56" -> 1234.56)
    const parseAmount = (amount: string): number => {
      const numeric = amount.replace(/[^0-9.]/g, '');
      return parseFloat(numeric) || 0;
    };

    const grandTotal = parseAmount(calculation.total);
    const pricePerPerson = parseAmount(calculation.pricePerPerson);

    // Totals
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Total: USD ' + grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }), 20, y);
    y += 8;
    doc.setFontSize(12);
    doc.setTextColor(108, 117, 125);
    doc.text('Price per Person: USD ' + pricePerPerson.toLocaleString('en-US', { minimumFractionDigits: 2 }), 20, y);
    y += 15;

    // Line Items Header
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text('Breakdown', 20, y);
    y += 10;

    // Line Items
    doc.setFontSize(10);
    if (calculation.breakdown && Array.isArray(calculation.breakdown)) {
      calculation.breakdown.forEach((category: any) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.setTextColor(33, 37, 41);
        doc.setFont('helvetica', 'bold');
        doc.text(category.category + ': ' + category.subtotal, 20, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(108, 117, 125);
        if (category.items && Array.isArray(category.items)) {
          category.items.forEach((item: any) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            doc.text('  - ' + item.description + ': ' + item.total, 25, y);
            y += 5;
          });
        }
        y += 5;
      });
    }

    // Footer
    y = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text('Discover Africa | Premium Safari Experiences', pageWidth / 2, y, { align: 'center' });

    // Download
    const fileName = 'quote-' + (quoteId || 'draft') + '-' + new Date().toISOString().slice(0, 10) + '.pdf';
    doc.save(fileName);
  }
};

