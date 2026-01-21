import jsPDF from 'jspdf';
import { CalculationResult, TripDraft } from '../types/ui';

export const pdfService = {
  async generateQuotePDF(draft: TripDraft, calculation: CalculationResult, quoteId?: string): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Try to load and add logo (if exists)
    try {
      const response = await fetch('/logo.png');
      if (response.ok) {
        const blob = await response.blob();
        const logoBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        // Add logo - 15mm height, left aligned
        const logoHeight = 15;
        const logoWidth = logoHeight * 1.2; // Maintain aspect ratio
        doc.addImage(logoBase64, 'PNG', 20, y, logoWidth, logoHeight);
        y += logoHeight + 10;
      } else {
        y += 5; // Space if no logo
      }
    } catch (e) {
      // Logo not found or failed to load, continue without it
      y += 5;
    }

    // Header - Left aligned
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 54, 28); // brand-dark
    doc.text('Discover Africa', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(85, 73, 32); // brand-olive
    doc.text('Safari Quote', 20, y);
    y += 15;

    // Quote ID and Date - Left aligned
    if (quoteId) {
      doc.setFontSize(10);
      doc.setTextColor(75, 54, 28); // brand-dark
      doc.text('Quote ID: ' + quoteId, 20, y);
      y += 5;
    }
    doc.setFontSize(10);
    doc.setTextColor(85, 73, 32); // brand-olive
    doc.text('Date: ' + new Date().toLocaleDateString(), 20, y);
    y += 12;

    // Trip Details Box
    doc.setFillColor(245, 243, 238); // brand-olive light tint
    doc.rect(15, y - 5, pageWidth - 30, 25, 'F');
    doc.setFontSize(14);
    doc.setTextColor(75, 54, 28); // brand-dark
    doc.text(draft.name || 'Safari Trip', 20, y + 5);
    doc.setFontSize(11);
    doc.setTextColor(85, 73, 32); // brand-olive
    doc.text(draft.travelers + ' travelers | ' + draft.days + ' days | ' + (draft.tier || 'base'), 20, y + 15);
    y += 35;

    // Parse totals from strings (e.g., "USD 1234.56" -> 1234.56)
    const parseAmount = (amount: string): number => {
      const numeric = amount.replace(/[^0-9.]/g, '');
      return parseFloat(numeric) || 0;
    };

    const grandTotal = parseAmount(calculation.total);
    const pricePerPerson = parseAmount(calculation.pricePerPerson);

    // Totals - Force brand-gold color (RGB: 202, 161, 49)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    // Set brand-gold color explicitly before text
    doc.setTextColor(202, 161, 49);
    const totalCostText = 'Total Cost: USD ' + grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 });
    doc.text(totalCostText, 20, y);
    // Ensure color is set again (sometimes jsPDF resets)
    doc.setTextColor(202, 161, 49);
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 54, 28); // brand-dark
    doc.text('Price per Person: USD ' + pricePerPerson.toLocaleString('en-US', { minimumFractionDigits: 2 }), 20, y);
    y += 18;

    // Line Items Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 54, 28); // brand-dark
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
        doc.setTextColor(75, 54, 28); // brand-dark
        doc.setFont('helvetica', 'bold');
        doc.text(category.category + ': ' + category.subtotal, 20, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(85, 73, 32); // brand-olive
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

    // Footer - Left aligned
    y = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(85, 73, 32); // brand-olive
    doc.text('Discover Africa | Premium Safari Experiences', 20, y);

    // Download
    const fileName = 'quote-' + (quoteId || 'draft') + '-' + new Date().toISOString().slice(0, 10) + '.pdf';
    doc.save(fileName);
  }
};

