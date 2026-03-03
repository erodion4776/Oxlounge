import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EmployeeData } from "../types";

export const generateBiodataPDF = (data: EmployeeData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // --- Header ---
  // Background Header
  doc.setFillColor(20, 20, 20); // Dark background
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Gold Line
  doc.setDrawColor(212, 175, 55); // #D4AF37
  doc.setLineWidth(1.5);
  doc.line(0, 41, pageWidth, 41);

  // Logo Text
  doc.setTextColor(212, 175, 55);
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.text("OX LOUNGE", pageWidth / 2, 20, { align: "center" });
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("OFFICIAL BIODATA FORM", pageWidth / 2, 30, { align: "center" });

  // --- Passport Photo ---
  // We determine photo presence and layout constraints
  let hasPhoto = false;
  const photoSize = 35; // Size of square photo
  const photoMarginRight = 14;
  const photoY = 48; // Position below header
  
  if (data.passportPhoto) {
    try {
      // Image positioned on the right
      doc.addImage(
        data.passportPhoto, 
        pageWidth - photoMarginRight - photoSize, 
        photoY, 
        photoSize, 
        photoSize
      );
      hasPhoto = true;
    } catch (e) {
      console.warn("Could not add image", e);
    }
  }

  // --- Content Layout ---
  // Start content below the header line
  let yPos = 55;
  
  const addSection = (title: string, content: [string, string][], isPersonalSection = false) => {
    // Check if we need to wrap text around the photo
    // We only wrap for the Personal Information section if a photo exists
    const wrapForPhoto = isPersonalSection && hasPhoto;
    
    // Calculate width available for this section
    // If wrapping, subtract photo width + gap (approx 50 units total) from the right
    const sectionWidth = wrapForPhoto 
      ? pageWidth - 28 - (photoSize + 10) 
      : pageWidth - 28;

    // Section Header Bar
    doc.setFillColor(212, 175, 55); // Gold
    doc.rect(14, yPos, sectionWidth, 8, 'F');
    
    // Section Title
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title.toUpperCase(), 18, yPos + 5.5);
    yPos += 12;

    // Content Table
    autoTable(doc, {
      startY: yPos,
      body: content,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 1.5, overflow: 'linebreak' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, textColor: [50, 50, 50] },
        1: { cellWidth: wrapForPhoto ? 70 : 110, textColor: [0, 0, 0] } // Adjust column width if wrapped
      },
      margin: { left: 14 },
      tableWidth: sectionWidth, // Constrain table width
      didDrawPage: (d) => {
          // Hook to update yPos for next section if page breaks
      }
    });
    
    // Safely update Y position
    const lastTable = (doc as any).lastAutoTable;
    if (lastTable && lastTable.finalY) {
      yPos = lastTable.finalY + 10;
    } else {
      yPos += 20; // Fallback spacing
    }
    
    // If we just finished the wrapped section, ensure the next section starts BELOW the photo
    if (wrapForPhoto) {
        const photoBottom = photoY + photoSize + 10;
        if (yPos < photoBottom) {
            yPos = photoBottom;
        }
    }
  };

  // Personal Info (Wrapped)
  addSection("Personal Information", [
    ["Full Name", data.fullName],
    ["ID", data.id],
    ["Gender", data.gender],
    ["Date of Birth", data.dob],
    ["Nationality", data.nationality],
    ["State / LGA", `${data.stateOfOrigin} / ${data.lga}`],
    ["Marital Status", data.maritalStatus],
    ["Contact", `${data.phone}`],
    ["Email", data.email],
    ["Address", data.address],
  ], true);

  // Next of Kin
  addSection("Next of Kin", [
    ["Name", data.nokName],
    ["Relationship", data.nokRelationship],
    ["Phone", data.nokPhone],
    ["Address", data.nokAddress],
  ]);

  // Employment
  addSection("Employment Details", [
    ["Position", data.position],
    ["Department", data.department],
    ["Employment Type", data.employmentType],
    ["Start Date", data.startDate],
    ["Monthly Salary", data.salary]
  ]);

  // Financial & Legal
  addSection("Identification & Legal", [
    ["Bank", data.bankName],
    ["Account Number", data.accountNumber],
    ["BVN", data.bvn],
    ["NIN", data.nin],
    ["Previous Employer", data.hasPreviousEmployer === 'Yes' ? data.previousEmployerName || 'N/A' : 'No'],
    ["Criminal Record", data.hasCriminalRecord === 'Yes' ? data.criminalExplanation || 'Yes' : 'No'],
  ]);

  // Referees
  addSection("References", [
    ["Referee Name", data.refereeName],
    ["Referee Contact", data.refereePhone],
    ["Guarantor Name", data.guarantorName],
    ["Guarantor Contact", data.guarantorPhone],
    ["Guarantor Occ.", data.guarantorOccupation],
  ]);

  // Footer
  const totalPages = doc.getNumberOfPages();
  for(let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`OX Lounge Confidential - Generated on ${new Date().toLocaleDateString()}`, 14, doc.internal.pageSize.height - 10);
  }

  doc.save(`OX_LOUNGE_${data.fullName.replace(/\s+/g, '_')}.pdf`);
};

export const generateOfferLetterPDF = (data: EmployeeData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // --- Branding / Background (Same as Biodata) ---
  // Dark Header
  doc.setFillColor(20, 20, 20); 
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Gold Line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.5);
  doc.line(0, 46, pageWidth, 46);

  // Logo Text
  doc.setTextColor(212, 175, 55); // Gold
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.text("OX LOUNGE", pageWidth / 2, 22, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255); // White
  doc.setFont("helvetica", "normal");
  doc.text("LUXURY & HOSPITALITY", pageWidth / 2, 34, { align: "center" });

  // --- Photo (Attached to letter) ---
  const photoSize = 35;
  const photoMargin = 20;
  const photoY = 55; // Below header
  
  let hasPhoto = false;
  if (data.passportPhoto) {
    try {
      // Top Right
      doc.addImage(
        data.passportPhoto, 
        pageWidth - photoMargin - photoSize, 
        photoY, 
        photoSize, 
        photoSize
      );
      // Add a gold border around photo
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.5);
      doc.rect(pageWidth - photoMargin - photoSize, photoY, photoSize, photoSize);
      hasPhoto = true;
    } catch (e) {
      console.warn("Could not add image", e);
    }
  }

  // --- Letter Content ---
  doc.setTextColor(0, 0, 0);
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  
  let y = 60;
  const margin = 20;
  
  // Date
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  doc.text(date, margin, y);
  y += 10;

  // Name
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text(data.fullName.toUpperCase(), margin, y);
  
  // Address & Details
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  y += 6;
  
  // Split address to verify it doesn't run too wide, though it's on left side
  const addressLines = doc.splitTextToSize(data.address || "Lagos, Nigeria", 100);
  doc.text(addressLines, margin, y);
  y += (addressLines.length * 5) + 2;
  
  doc.text(data.phone, margin, y);
  
  // Ensure we move below the photo for the main body
  y = Math.max(y + 15, photoY + photoSize + 15);

  // Subject Line
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`OFFER OF EMPLOYMENT: ${data.position.toUpperCase()}`, margin, y);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, pageWidth - margin, y + 2);

  y += 15;

  // Body Text
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  const lineHeight = 6;
  const maxWidth = pageWidth - (margin * 2);

  const paragraphs = [
    `Dear ${data.fullName},`,
    `Following our recent interview and review of your biodata, we are pleased to offer you the position of ${data.position} with OX Lounge. You will be joining our ${data.department} department.`,
    `We believe your skills and background fit perfectly with our commitment to luxury and excellence.`,
    `The terms of this offer are outlined below:`,
  ];
  
  // Render intro paragraphs
  paragraphs.forEach(p => {
    const lines = doc.splitTextToSize(p, maxWidth);
    doc.text(lines, margin, y);
    y += (lines.length * lineHeight) + 4;
  });

  // Details Table (Styled like biodata)
  autoTable(doc, {
    startY: y,
    body: [
        ["Start Date", data.startDate ? new Date(data.startDate).toLocaleDateString() : 'To be confirmed'],
        ["Employment Type", data.employmentType],
        ["Monthly Salary", data.salary || 'As agreed'],
        ["Reporting To", "Department Manager"]
    ],
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 2, font: "times" },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 100 }
    },
    margin: { left: margin },
  });
  
  // Update Y after table
  y = (doc as any).lastAutoTable.finalY + 10;

  const closingParagraphs = [
    `This offer is contingent upon the successful verification of your provided information.`,
    `Please sign the copy of this letter to indicate your acceptance and return it to the HR department.`,
    `We look forward to having you on the OX Lounge team.`
  ];

  closingParagraphs.forEach(p => {
    const lines = doc.splitTextToSize(p, maxWidth);
    // Check for page break
    if (y + (lines.length * lineHeight) > pageHeight - 30) {
        doc.addPage();
        y = 30;
    }
    doc.text(lines, margin, y);
    y += (lines.length * lineHeight) + 4;
  });

  y += 10;

  // Signatures
  if (y > pageHeight - 50) {
      doc.addPage();
      y = 30;
  }

  doc.text("Sincerely,", margin, y);
  y += 25;
  
  doc.setFont("times", "bold");
  doc.text("MANAGEMENT", margin, y);
  doc.setFont("times", "normal");
  doc.text("OX LOUNGE", margin, y + 5);

  // Footer
  const totalPages = doc.getNumberOfPages();
  for(let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`OX Lounge | Premium Hospitality | www.oxlounge.com`, pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  doc.save(`OX_OFFER_${data.fullName.replace(/\s+/g, '_')}.pdf`);
};