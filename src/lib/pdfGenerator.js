import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a professional PDF invoice for DriveStream
 * @param {Object} invoice - The invoice data object with populated vehicle, customer, job, and booking
 */
export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // 1. HEADER & BRANDING
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('DRIVESTREAM', 15, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Vehicle Service & Care', 15, 32);
  
  doc.setFontSize(18);
  doc.text('INVOICE', pageWidth - 15, 25, { align: 'right' });
  
  doc.setFontSize(10);
  doc.text(invoice.invoiceNumber, pageWidth - 15, 32, { align: 'right' });

  // 2. CUSTOMER & VEHICLE INFO
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 15, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${invoice.customer?.name || 'Valued Customer'}`, 15, 62);
  doc.text(`${invoice.customer?.email || ''}`, 15, 67);
  doc.text(`${invoice.customer?.phone || ''}`, 15, 72);

  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE DETAILS:', pageWidth / 2, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reg No: ${invoice.vehicle?.registrationNumber || 'N/A'}`, pageWidth / 2, 62);
  doc.text(`Make: ${invoice.vehicle?.brand || ''} ${invoice.vehicle?.model || ''}`, pageWidth / 2, 67);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, pageWidth / 2, 72);

  // 3. SERVICES TABLE
  const servicesData = invoice.booking?.services?.map(s => [
    s.name,
    `${s.price.toLocaleString()} LKR`
  ]) || [];

  autoTable(doc, {
    startY: 85,
    head: [['Service Description', 'Price']],
    body: servicesData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], textColor: 255 }, // Primary color
    styles: { fontSize: 9 },
    columnStyles: {
      1: { halign: 'right' }
    }
  });

  let finalY = doc.lastAutoTable.finalY;

  // 4. PARTS TABLE (If applicable)
  if (invoice.job?.partsUsed && invoice.job.partsUsed.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('PARTS & MATERIALS:', 15, finalY + 15);
    
    const partsData = invoice.job.partsUsed.map(p => [
      p.name,
      p.quantity,
      `${p.price.toLocaleString()} LKR`,
      `${(p.price * p.quantity).toLocaleString()} LKR`
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Part Name', 'Qty', 'Unit Price', 'Total']],
      body: partsData,
      theme: 'grid',
      headStyles: { fillColor: [100, 116, 139] },
      styles: { fontSize: 9 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });
    finalY = doc.lastAutoTable.finalY;
  }

  // 5. SUMMARY SECTION
  const summaryX = pageWidth - 80;
  doc.setFontSize(10);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Labor / Base Service:', summaryX, finalY + 15);
  doc.text(`${invoice.baseServiceCost.toLocaleString()} LKR`, pageWidth - 15, finalY + 15, { align: 'right' });
  
  doc.text('Parts Total:', summaryX, finalY + 22);
  doc.text(`${invoice.partsTotal.toLocaleString()} LKR`, pageWidth - 15, finalY + 22, { align: 'right' });
  
  doc.setDrawColor(200, 200, 200);
  doc.line(summaryX, finalY + 27, pageWidth - 15, finalY + 27);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('GRAND TOTAL:', summaryX, finalY + 37);
  doc.text(`${invoice.grandTotal.toLocaleString()} LKR`, pageWidth - 15, finalY + 37, { align: 'right' });

  // 6. FOOTER
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for choosing DriveStream. Drive Safe!', pageWidth / 2, footerY, { align: 'center' });
  
  if (invoice.isPaid) {
    doc.setDrawColor(34, 197, 94); // Emerald-500
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PAID', 15, footerY, { angle: 15 });
  }

  // Save PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
};
