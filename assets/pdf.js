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
            // --- Header (Per Set) ---
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18); // Reduced from 22

            const title = isAnswerKey ? `${data.config.type} ANSWER KEY` : `${data.config.type} Practice`;
            // Center the title for a clean, simple look
            doc.text(title.toUpperCase(), pageWidth / 2, margin + 12, { align: 'center' });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);

            // Meta block removed (Name/Date) as requested

            doc.setLineWidth(1.5);
            doc.line(margin + 10, margin + 25, pageWidth - margin - 10, margin + 25);

            // --- Page Border (Thick Frame) ---
            doc.setLineWidth(1.5); // Thick border
            doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

            // --- Questions ---
            let yPos = margin + 35;

            // Dynamic Layout Configuration
            const isHorizontal = data.config.layout === 'horizontal';
            const isWordProblem = data.config.layout === 'word-problem';
            const terms = data.config.terms || 2;
            const digits = data.config.digits || 1;

            const calculateNumCols = () => {
                if (isWordProblem) return 1; // Force 1 col for Statement problems as requested
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

            const startY = margin + 35;
            const availableHeight = pageHeight - startY - margin - 10;

            // Dynamic Layout Calculation
            // Calculate exact height needed per problem to guarantee fit
            const lineSpacing = 7;
            let linesPerProblem = terms + 1; // terms + answer line (Vertical default)

            if (isHorizontal) {
                // Horizontal layout is much more compact vertically
                linesPerProblem = 3; // Equivalent space of ~3 lines is plenty
            }
            if (isWordProblem) {
                // Single column with inline Answer (Right aligned).
                // Text wraps (max 2-3 lines usually) + buffer.
                linesPerProblem = 3;
            }

            // Reduced buffer from 10mm to 5mm to allow tighter packing
            const problemHeight = (linesPerProblem * lineSpacing) + 5;

            // How many rows mathematically fit?
            let rowsPerCol = Math.floor(availableHeight / problemHeight);

            // Cap rows to ensure standard density
            // Increased cap from 5 to 8 to allow more problems per page (e.g. 16 problems)
            // If 1 column (wide), allow up to 12.
            const maxRows = numCols === 1 ? 12 : 8;
            if (rowsPerCol > maxRows) rowsPerCol = maxRows;

            const itemsPerPage = rowsPerCol * numCols;
            const rowsPerPage = Math.ceil(itemsPerPage / numCols); // Should equal rowsPerCol roughly

            const dynamicRowHeight = availableHeight / rowsPerPage;

            // Horizontal Alignment Helper
            // We align right. As digits increase, we need to push the alignment point further right
            // so the number doesn't grow leftwards into the operator.
            // Base offset 15 fits ~3 digits. For 6 digits, we need ~30.
            const alignOffset = 15 + Math.max(0, (digits - 3) * 3.5);

            const colX = [];
            for (let c = 0; c < numCols; c++) {
                colX.push(margin + (c * colWidth) + 25); // Keep xOffset for question number
            }

            // Loop
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
                    // Redraw Border/Title on new page? Usually handled by "Header" per set, 
                    // but here we just need a blank border canvas technically.
                    // The function `drawDocSet` handles the whole set, but `doc.addPage()` makes a blank one.
                    // We should re-add the border. 
                }

                // IMPORTANT: The original code drew the header ONCE at start.
                // If we add a page, we lose the border/header. 
                // We'll keep it simple: Just border on sub-pages.

                const x = colX[colIndex];
                // Position based on row index and dynamic height
                const y = startY + (rowIndex * dynamicRowHeight);

                // Question Number
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                if (isAnswerKey) {
                    doc.setTextColor(100);
                    doc.setTextColor(0);
                }
                doc.text(`${i + 1})`, x - 15, y + 2);

                // Problem Rendering
                doc.setFontSize(16);
                doc.setFont("courier", "bold");

                let pdfOp = q.displayOperator;
                if (pdfOp === '−') pdfOp = '-';
                if (pdfOp === '×') pdfOp = 'x';
                if (pdfOp === '÷') pdfOp = String.fromCharCode(247);

                if (isWordProblem) {
                    doc.setFontSize(11); // Slightly smaller for text
                    doc.setFont("helvetica", "normal");

                    // Layout: Text on Left, Answer on Right
                    const answerWidth = 60;
                    const gap = 10;
                    const textWidth = colWidth - answerWidth - gap - 5;

                    const text = q.questionText || "Problem text missing.";
                    const splitText = doc.splitTextToSize(text, textWidth);

                    // Render wrapped text
                    doc.text(splitText, x, y);

                    // Render Answer Space on the right, aligned with the last line of text
                    // roughly bottom-aligned gives a neat 'form' look
                    const textHeight = (splitText.length - 1) * 5;
                    const ansY = y + textHeight;
                    const ansX = x + textWidth + gap;

                    doc.setFont("courier", "bold");
                    if (isAnswerKey) {
                        doc.text(`Ans: ${q.answer}`, ansX, ansY);
                    } else {
                        doc.text("Ans: ______________", ansX, ansY);
                    }
                } else if (isHorizontal) {
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

                    // Draw horizontal line
                    doc.setLineWidth(0.5);
                    doc.line(x - 2, currentLineY + 2, x + alignOffset + 2, currentLineY + 2);

                    // ANSWER (Only if Answer Key)
                    if (isAnswerKey) {
                        doc.setTextColor(0);
                        doc.text(q.answer.toString(), x + alignOffset, currentLineY + 9, { align: 'right' });
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
