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
            doc.setFontSize(18);

            let titleText = `${data.config.type} Practice`;
            if (data.config.type === 'tables') titleText = "Multiplication Tables";
            // Capitalize first letter if not tables
            if (data.config.type !== 'tables') titleText = titleText.charAt(0).toUpperCase() + titleText.slice(1);

            const title = isAnswerKey ? `${titleText} ANSWER KEY` : `${titleText}`;
            // Center the title for a clean, simple look
            doc.text(title.toUpperCase(), pageWidth / 2, margin + 12, { align: 'center' });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);

            doc.setLineWidth(1.5);
            doc.line(margin + 10, margin + 25, pageWidth - margin - 10, margin + 25);

            // --- Page Border (Thick Frame) ---
            doc.setLineWidth(1.5); // Thick border
            doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

            // --- Questions ---
            let yPos = margin + 35;

            // --- TABLES LAYOUT BRANCH ---
            if (data.config.type === 'tables') {
                const numCols = 1; // 1 column per page
                const colWidth = contentWidth / numCols;
                const startY = margin + 35;
                const lineHeight = 10; // Tight spacing (10mm)
                const maxRows = Math.floor((pageHeight - startY - margin) / lineHeight);

                let col = 0;
                let row = 0;
                let currentTable = -1; // Track active table to trigger column breaks

                doc.setFont("courier", "bold");
                doc.setFontSize(14);

                data.questions.forEach(q => {
                    // Check for Table Change -> Trigger Column Break
                    // This creates the "Column 1 = Table 2, Column 2 = Table 3" effect
                    if (currentTable !== q.num1) {
                        // Only break if we aren't at the very start of a column already
                        if (currentTable !== -1 && row > 0) {
                            col++;
                            row = 0;
                        }
                        // Check page break
                        if (col >= numCols) {
                            doc.addPage();
                            doc.setLineWidth(1.5);
                            doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));
                            col = 0;
                            row = 0;
                        }
                        currentTable = q.num1;
                    }

                    // Standard Row Overflow
                    if (row >= maxRows) {
                        col++;
                        row = 0;
                        if (col >= numCols) {
                            doc.addPage();
                            doc.setLineWidth(1.5);
                            doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));
                            col = 0;
                        }
                    }

                    const x = margin + (col * colWidth) + 60; // Centered Indent
                    const y = startY + (row * lineHeight);

                    let op = q.displayOperator === '×' ? 'x' : q.displayOperator;
                    const eq = `${q.num1} ${op} ${q.num2} = `;

                    doc.text(eq, x, y);

                    if (isAnswerKey) {
                        const width = doc.getTextWidth(eq);
                        doc.text(q.answer.toString(), x + width + 2, y);
                    }

                    row++;
                });

            } else {
                // --- STANDARD LAYOUT (Original Logic) ---
                const isHorizontal = data.config.layout === 'horizontal';
                const isWordProblem = data.config.layout === 'word-problem';
                const terms = data.config.terms || 2;
                const digits = data.config.digits || 1;

                const calculateNumCols = () => {
                    if (isWordProblem) return 1;
                    if (!isHorizontal) return 2;
                    const estWidth = 15 + (terms * digits * 3.5) + ((terms - 1) * 8) + 35;
                    if (estWidth > contentWidth * 0.45) return 1;
                    if (estWidth > contentWidth * 0.3) return 2;
                    return 3;
                };

                const numCols = calculateNumCols();
                const colWidth = contentWidth / numCols;
                const startY = margin + 35;
                const availableHeight = pageHeight - startY - margin - 10;

                const lineSpacing = 7;
                let linesPerProblem = terms + 1;
                if (isHorizontal) linesPerProblem = 3;
                if (isWordProblem) linesPerProblem = 4;

                const problemHeight = (linesPerProblem * lineSpacing) + 5;
                let rowsPerCol = Math.floor(availableHeight / problemHeight);

                const maxRows = numCols === 1 ? 12 : 8;
                if (rowsPerCol > maxRows) rowsPerCol = maxRows;

                const itemsPerPage = rowsPerCol * numCols;
                const rowsPerPage = Math.ceil(itemsPerPage / numCols);
                const dynamicRowHeight = availableHeight / rowsPerPage;
                const alignOffset = 15 + Math.max(0, (digits - 3) * 3.5);

                const colX = [];
                for (let c = 0; c < numCols; c++) {
                    colX.push(margin + (c * colWidth) + 25);
                }

                data.questions.forEach((q, i) => {
                    const pageIndex = Math.floor(i / itemsPerPage);
                    const localIndex = i % itemsPerPage;
                    const colIndex = localIndex % numCols;
                    const rowIndex = Math.floor(localIndex / numCols);

                    // Page Break Check
                    if (i > 0 && localIndex === 0) {
                        doc.addPage();
                        doc.setLineWidth(1.5);
                        doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));
                    }

                    const x = colX[colIndex];
                    const y = startY + (rowIndex * dynamicRowHeight);

                    // Question Number
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(0);
                    doc.text(`${i + 1})`, x - 15, y + 2);

                    // Problem Rendering
                    doc.setFontSize(16);
                    doc.setFont("courier", "bold");

                    let pdfOp = q.displayOperator;
                    if (pdfOp === '−') pdfOp = '-';
                    if (pdfOp === '×') pdfOp = 'x';
                    if (pdfOp === '÷') pdfOp = String.fromCharCode(247);

                    if (isWordProblem) {
                        doc.setFontSize(11);
                        doc.setFont("helvetica", "normal");
                        const effectivePageRight = pageWidth - margin;
                        const availableWidth = effectivePageRight - x - 5;
                        const text = q.questionText || "Problem text missing.";
                        const splitText = doc.splitTextToSize(text, availableWidth);
                        doc.text(splitText, x, y);
                        if (isAnswerKey) {
                            const textHeight = splitText.length * 5;
                            doc.setFont("courier", "bold");
                            doc.setFontSize(12);
                            doc.text(`Ans: ${q.answer}`, x, y + textHeight + 5);
                        }
                    } else if (isHorizontal) {
                        let equation = "";
                        const nums = q.nums || [q.num1, q.num2];
                        if (nums && nums[0] !== undefined) {
                            equation = nums.join(` ${pdfOp} `) + " = ";
                        } else {
                            equation = "0 + 0 = ";
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
                                if (isLast) doc.text(pdfOp, x - 4, currentLineY);
                                doc.text((num || 0).toString(), x + alignOffset, currentLineY, { align: 'right' });
                                if (!isLast) currentLineY += lineSpacing;
                            });
                        } else {
                            const n1 = nums[0] !== undefined ? nums[0] : (q.num1 || 0);
                            const n2 = nums[1] !== undefined ? nums[1] : (q.num2 || 0);
                            doc.text(n1.toString(), x + alignOffset, currentLineY, { align: 'right' });
                            currentLineY += lineSpacing;
                            doc.text(pdfOp, x - 4, currentLineY);
                            doc.text(n2.toString(), x + alignOffset, currentLineY, { align: 'right' });
                        }
                        doc.setLineWidth(0.5);
                        doc.line(x - 2, currentLineY + 2, x + alignOffset + 2, currentLineY + 2);
                        if (isAnswerKey) {
                            doc.text(q.answer.toString(), x + alignOffset, currentLineY + 9, { align: 'right' });
                        }
                    }
                });
            }

            // --- Footer (Page Numbers) ---
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
            }
        };

        // 1. Draw Problem Sheet
        drawDocSet(false);

        // 2. Draw Answer Key (New Page)
        if (data.config.includeAnswers) {
            doc.addPage();
            doc.setLineWidth(1.5); // Reset border for new page
            doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));
            drawDocSet(true);
        }

        doc.save(data.config.type === 'tables' ? 'MathWizard_Tables.pdf' : 'MathWizard_Worksheet.pdf');
    }
}
// Export
window.PDFGenerator = PDFGenerator;
