/**
 * PDF Generator logic using jsPDF
 */

class PDFGenerator {
    constructor() {
        // Check if jsPDF is loaded
        if (!window.jspdf) {
            console.error("jsPDF not loaded");
            return;
        }
    }

    generate(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Config
        const margin = 20;
        const pageWidth = 210;
        const pageHeight = 297;
        const contentWidth = pageWidth - (margin * 2);

        // Helper to draw a complete set of questions (either Problems or Answers)
        const drawDocSet = (isAnswerKey) => {
            // --- Header (Per Set) ---
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);

            const title = isAnswerKey ? `${data.config.type} ANSWER KEY` : `${data.config.type} Practice`;
            doc.text(title.toUpperCase(), margin + 10, margin + 15);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(14);

            if (!isAnswerKey) {
                doc.text("Date: ____________________", pageWidth - margin - 10, margin + 12, { align: 'right' });
                doc.text(`Score: _________ / ${data.questions.length}`, pageWidth - margin - 10, margin + 20, { align: 'right' });
            }

            doc.setLineWidth(1.5);
            doc.line(margin + 10, margin + 25, pageWidth - margin - 10, margin + 25);

            // --- Page Border (Thick Frame) ---
            doc.setLineWidth(1.5); // Thick border
            doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

            // --- Questions ---
            let yPos = margin + 35;

            // Dynamic Layout Configuration
            const isHorizontal = data.config.layout === 'horizontal';
            const terms = data.config.terms || 2;
            const digits = data.config.digits || 1;

            const calculateNumCols = () => {
                if (!isHorizontal) return 2;
                // --- Updated Conservative Estimation ---
                // Char width 3.5mm, Operator space 8mm, Answer space 35mm
                const estWidth = 15 + (terms * digits * 3.5) + ((terms - 1) * 8) + 35;

                // If it's more than 45% of width, it won't fit 3. 
                // If it's more than 90% of HALF width, it won't fit 2.
                if (estWidth > contentWidth * 0.45) return 1;
                if (estWidth > contentWidth * 0.3) return 2;
                return 3;
            };

            const numCols = calculateNumCols();
            const colWidth = contentWidth / numCols;

            // Improved vertical spacing
            const rowHeight = isHorizontal ? 18 : ((terms * 9) + 15);
            let currentPageY = yPos;

            // Standard offset to ensure space for question number "1) " which is drawn at x-15
            const xOffset = 25;

            const colX = [];
            for (let c = 0; c < numCols; c++) {
                colX.push(margin + (c * colWidth) + xOffset);
            }

            // Loop
            data.questions.forEach((q, i) => {
                const colIndex = i % numCols;

                // Page Break Check
                if (i > 0 && colIndex === 0) {
                    currentPageY += rowHeight;
                    if (currentPageY + rowHeight > (pageHeight - margin - 15)) {
                        doc.addPage();
                        doc.setLineWidth(1.5);
                        doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));
                        currentPageY = margin + 20;
                    }
                }

                const x = colX[colIndex];
                const y = currentPageY;

                // Question Number
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                if (isAnswerKey) {
                    doc.setTextColor(100); // Grey for number in answer key to highlight answer? Or keep black. black is fine.
                    doc.setTextColor(0);
                }
                doc.text(`${i + 1})`, x - 15, y + 2);

                // Problem
                // Problem Rendering
                doc.setFontSize(16);
                doc.setFont("courier", "bold");

                let pdfOp = q.displayOperator;
                if (pdfOp === '−') pdfOp = '-';
                if (pdfOp === '×') pdfOp = 'x';

                if (isHorizontal) {
                    // Horizontal Layout
                    let equation = "";
                    const nums = q.nums || [q.num1, q.num2];
                    if (nums && nums[0] !== undefined) {
                        equation = nums.join(` ${pdfOp} `) + " = ";
                    } else {
                        equation = "0 + 0 = "; // Fallback
                    }
                    const eqText = equation;
                    const eqWidth = doc.getTextWidth(eqText);
                    const availWidth = colWidth - 25;

                    if (eqWidth + 40 > availWidth) {
                        const scaledSize = Math.max(9, 16 * (availWidth / (eqWidth + 45)));
                        doc.setFontSize(scaledSize);
                    }

                    const actualWidth = doc.getTextWidth(eqText);
                    doc.text(eqText, x, y + 2);

                    if (isAnswerKey) {
                        doc.setTextColor(0);
                        doc.text((q.answer || 0).toString(), x + actualWidth + 2, y + 2);
                    } else {
                        doc.text("__________", x + actualWidth + 2, y + 2);
                    }
                    doc.setFontSize(16);
                } else {
                    // Vertical Layout
                    let currentLineY = y;
                    const lineSpacing = 7;
                    const nums = q.nums || [q.num1, q.num2];

                    if (nums && nums.length > 2) {
                        nums.forEach((num, i) => {
                            const isLast = i === nums.length - 1;
                            if (isLast) doc.text(pdfOp, x, currentLineY);
                            doc.text((num || 0).toString(), x + 15, currentLineY, { align: 'right' });
                            if (!isLast) currentLineY += lineSpacing;
                        });
                    } else {
                        const n1 = nums[0] !== undefined ? nums[0] : (q.num1 || 0);
                        const n2 = nums[1] !== undefined ? nums[1] : (q.num2 || 0);
                        doc.text(n1.toString(), x + 15, currentLineY, { align: 'right' });
                        currentLineY += lineSpacing;
                        doc.text(pdfOp, x, currentLineY);
                        doc.text(n2.toString(), x + 15, currentLineY, { align: 'right' });
                    }

                    // Draw horizontal line
                    doc.setLineWidth(0.5);
                    doc.line(x - 2, currentLineY + 2, x + 17, currentLineY + 2);

                    // ANSWER (Only if Answer Key)
                    if (isAnswerKey) {
                        doc.setTextColor(0);
                        doc.text(q.answer.toString(), x + 15, currentLineY + 9, { align: 'right' });
                    }
                }
            });

            // --- Footer (Page Numbers) ---
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
            }
        };

        // 1. Draw Problem Sheet
        drawDocSet(false);

        // 2. Draw Answer Sheet (if requested)
        if (data.config.includeAnswers) {
            doc.addPage(); // Start fresh page for Key
            drawDocSet(true);
        }

        // Save causing issues? Use manual manual blob download for robustness
        // doc.save(`${data.config.type}-worksheet.pdf`);

        try {
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${data.config.type}-worksheet.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (e) {
            console.error("PDF Save Failed:", e);
            alert("Error saving PDF. Trying fallback.");
            doc.save(`${data.config.type}-worksheet.pdf`);
        }
    }
}

window.PDFGenerator = PDFGenerator;
