/**
 * Kids Math Worksheet Generator - Logic Engine
 * Pure Vanilla JavaScript (ES6)
 */

class WorksheetGenerator {
    constructor(seed = null) {
        this.history = new Set();
        this.seed = seed;

        // Initialize PRNG if seed is provided
        if (this.seed !== null) {
            this._random = this._mulberry32(this.seed);
        } else {
            this._random = Math.random;
        }
    }

    // Seeded Random Generator
    _mulberry32(a) {
        return function () {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    /**
     * Generate a full worksheet
     * @param {Object} config - Configuration object
     * @param {string} config.type - 'addition', 'subtraction', 'multiplication', 'mixed'
     * @param {number} config.count - Number of questions
     * @param {number} config.min - Minimum number value (default 1)
     * @param {number} config.max - Maximum number value (default 20)
     * @returns {Object} Worksheet data with questions and answer key
     */
    generate(config) {
        // Fallback or Destructure
        const { type, count, min1, max1, min2, max2 } = config;
        this.history.clear();
        const questions = [];
        let attempts = 0;
        const maxAttempts = count * 20;

        while (questions.length < count && attempts < maxAttempts) {
            attempts++;
            let op = type;
            if (type === 'mixed') {
                const ops = ['addition', 'subtraction', 'multiplication'];
                op = ops[Math.floor(Math.random() * ops.length)];
            }

            const terms = (op === 'addition' || type === 'addition') ? (config.terms || 2) : 2;
            const question = this._generateQuestion(op, min1, max1, min2, max2, terms);

            if (question && !this._isDuplicate(question)) {
                questions.push(question);
                this._addToHistory(question);
            }
        }

        return {
            id: Date.now(),
            config: config,
            questions: questions,
            generatedAt: new Date().toISOString()
        };
    }

    _generateQuestion(type, min1, max1, min2, max2, terms = 2) {
        // Handle multi-term for addition
        if (type === 'addition' && terms > 2) {
            let nums = [];
            for (let i = 0; i < terms; i++) {
                nums.push(this._randomInt(min1, max1));
            }
            const answer = nums.reduce((a, b) => a + b, 0);
            return {
                nums: nums,
                operator: '+',
                displayOperator: '+',
                answer: answer,
                type: 'multi-addition'
            };
        }

        // Standard 2-number logic
        let n1 = this._randomInt(min1, max1);
        let n2 = this._randomInt(min2, max2);
        let operator, answer, displayOp;

        switch (type) {
            case 'addition':
                operator = '+';
                answer = n1 + n2;
                displayOp = '+';
                break;
            case 'subtraction':
                // For subtraction, n1 must be >= n2 typically.
                // But we have strict digit rules. (e.g. 1-digit minus 6-digits = negative).
                // If we want no negatives, we swap.
                // BUT swapping might break the "Top Number Digits" rule if n2 had more digits.
                // However, standard subtraction sheets usually put the bigger number on top regardless.
                // Let's swap to ensure non-negative, but this effectively ignores "Top vs Bottom" distinction for subtraction
                // if the generated "Bottom" is bigger. That is math standard though.
                if (n1 < n2) [n1, n2] = [n2, n1];
                operator = '-';
                answer = n1 - n2;
                displayOp = '-';
                break;
            case 'multiplication':
                operator = '*';
                answer = n1 * n2;
                displayOp = '×';
                break;
            default:
                return null;
        }

        return {
            num1: n1,
            num2: n2,
            operator: operator,
            displayOperator: displayOp,
            answer: answer,
            type: type
        };
    }

    _randomInt(min, max) {
        return Math.floor(this._random() * (max - min + 1)) + min;
    }

    _isDuplicate(question) {
        let key;
        if (question.nums) {
            key = `multi:${question.nums.join(',')}`;
        } else {
            key = `${question.num1}|${question.operator}|${question.num2}`;
        }
        return this.history.has(key);
    }

    _addToHistory(question) {
        let key;
        if (question.nums) {
            key = `multi:${question.nums.join(',')}`;
        } else {
            key = `${question.num1}|${question.operator}|${question.num2}`;
        }
        this.history.add(key);
    }
}

class WorksheetRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render(data) {
        if (!this.container) return;

        // Reset container
        this.container.innerHTML = '';
        this.container.style.display = 'block';

        // 1. Page Label
        const pageLabel = document.createElement('div');
        pageLabel.className = 'page-label';
        pageLabel.innerText = 'Problem Sheet';
        this.container.appendChild(pageLabel);

        // 2. Header
        const header = document.createElement('div');
        header.className = 'worksheet-header';
        header.innerHTML = `
            <div class="worksheet-title">${data.config.type} Practice</div>
            <div class="worksheet-meta">
                Date: _________________<br>
                Score: _______ / ${data.questions.length}
            </div>
        `;
        this.container.appendChild(header);

        // 2. Questions Grid
        const isHorizontal = data.config.layout === 'horizontal';
        const terms = data.config.terms || 2;
        const digits = data.config.digits || 1;

        const getNumCols = () => {
            if (!isHorizontal) return 2;
            // Est width in chars roughly
            const estChars = (terms * digits) + ((terms - 1) * 3) + 15;
            if (estChars > 28) return 1;
            if (estChars > 18) return 2;
            return 3;
        };

        const numCols = getNumCols();
        const grid = document.createElement('div');
        grid.className = 'worksheet-grid';
        grid.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
        if (isHorizontal) grid.style.columnGap = "1rem";

        data.questions.forEach((q, index) => {
            const el = document.createElement('div');
            el.className = `problem ${isHorizontal ? 'horizontal' : ''}`;

            let problemHTML = `<div class="problem-number">${index + 1})</div>`;

            if (isHorizontal) {
                // Horizontal Layout
                let equation = "";
                if (q.nums) {
                    equation = q.nums.join(` ${q.displayOperator} `);
                } else {
                    equation = `${q.num1} ${q.displayOperator} ${q.num2}`;
                }

                // --- Dynamic Font Scaling for Preview ---
                const estChars = equation.length + 15;
                let style = "";
                if (numCols === 1 && estChars > 45) {
                    const size = Math.max(0.7, 1.1 * (45 / estChars));
                    style = `style="font-size: ${size}rem"`;
                } else if (numCols === 2 && estChars > 22) {
                    const size = Math.max(0.7, 1.1 * (22 / estChars));
                    style = `style="font-size: ${size}rem"`;
                }

                problemHTML += `
                    <div class="problem-horizontal" ${style}>
                        <span class="equation">${equation} = </span>
                        <span class="answer-space">___________</span>
                    </div>
                `;
            } else {
                // Vertical Layout
                problemHTML += `<div class="problem-inner">`;
                if (q.nums && q.nums.length > 2) {
                    q.nums.forEach((num, i) => {
                        const isLast = i === q.nums.length - 1;
                        problemHTML += `
                            <div class="problem-row">
                                ${isLast ? `<span class="operator">${q.displayOperator}</span>` : ''}
                                <span>${num}</span>
                            </div>
                        `;
                    });
                } else {
                    problemHTML += `
                        <div class="problem-row">
                            <span>${q.num1}</span>
                        </div>
                        <div class="problem-row">
                            <span class="operator">${q.displayOperator}</span>
                            <span>${q.num2}</span>
                        </div>
                    `;
                }
                problemHTML += `<div class="line"></div></div>`;
            }

            el.innerHTML = problemHTML;
            grid.appendChild(el);
        });

        this.container.appendChild(grid);

        // 3. Answer Key (if requested)
        if (data.config.includeAnswers) {
            this._renderAnswerKey(data);
        }

        // Scroll to preview
        this.container.scrollIntoView({ behavior: 'smooth' });

        // 4. Action Bar (PDF Download)
        this._renderActionBar(data);
    }

    _renderActionBar(data) {
        const bar = document.createElement('div');
        bar.style.textAlign = 'center';
        bar.style.marginTop = '2rem';
        bar.className = 'no-print'; // Hide from browser print

        const btn = document.createElement('button');
        btn.innerHTML = '<span>📥</span> Download PDF';
        btn.className = 'btn-primary';
        btn.style.width = 'auto';
        btn.style.padding = '0.75rem 2.5rem';
        btn.style.fontSize = '1.25rem';
        btn.style.display = 'inline-block';

        btn.onclick = () => {
            if (window.PDFGenerator) {
                const gen = new window.PDFGenerator();
                gen.generate(data);
            } else {
                alert("PDF Generator loading...");
            }
        };

        bar.appendChild(btn);

        // Add Print Button too
        const printBtn = document.createElement('button');
        printBtn.innerHTML = '<span>🖨️</span> Print';
        printBtn.className = 'btn-primary';
        printBtn.style.width = 'auto';
        printBtn.style.padding = '0.75rem 2rem';
        printBtn.style.display = 'inline-block';
        printBtn.style.marginLeft = '1rem';
        printBtn.style.background = '#64748B'; // Secondary color
        printBtn.onclick = () => window.print();

        bar.appendChild(printBtn);

        this.container.prepend(bar); // Add to top or append? Prepend is nice to see actions.
        // Actually append is better after seeing the worksheet implies "scroll down to see".
        // But if I put it at the top, they can print immediately.
        // Let's put it at the top AND bottom or just top.
        // I'll prepend it to the header or insert before grid.
        // Let's append it to the container, so it's at the bottom.
        this.container.appendChild(bar);
    }

    _renderAnswerKey(data) {
        // Separator / Container for Answer Sheet
        const section = document.createElement('div');
        section.className = 'answer-key-section';

        // Page Label
        const pageLabel = document.createElement('div');
        pageLabel.className = 'page-label';
        pageLabel.innerText = 'Answer Key';
        section.appendChild(pageLabel);

        // Similar Header
        const header = document.createElement('div');
        header.className = 'worksheet-header';
        header.innerHTML = `
            <div class="worksheet-title">${data.config.type} Answer Key</div>
        `;
        section.appendChild(header);

        const isHorizontal = data.config.layout === 'horizontal';
        const terms = data.config.terms || 2;
        const digits = data.config.digits || 1;

        const getNumCols = () => {
            if (!isHorizontal) return 2;
            const estChars = (terms * digits) + ((terms - 1) * 3) + 15;
            if (estChars > 28) return 1;
            if (estChars > 18) return 2;
            return 3;
        };

        const numCols = getNumCols();
        const grid = document.createElement('div');
        grid.className = 'worksheet-grid';
        grid.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
        if (isHorizontal) grid.style.columnGap = "1rem";

        data.questions.forEach((q, index) => {
            const el = document.createElement('div');
            el.className = `problem ${isHorizontal ? 'horizontal' : ''}`;

            let problemHTML = `<div class="problem-number">${index + 1})</div>`;

            if (isHorizontal) {
                let equation = "";
                if (q.nums) {
                    equation = q.nums.join(` ${q.displayOperator} `);
                } else {
                    equation = `${q.num1} ${q.displayOperator} ${q.num2}`;
                }

                const estChars = equation.length + 8;
                let style = "";
                if (numCols === 1 && estChars > 45) {
                    const size = Math.max(0.7, 1.1 * (45 / estChars));
                    style = `style="font-size: ${size}rem"`;
                } else if (numCols === 2 && estChars > 22) {
                    const size = Math.max(0.7, 1.1 * (22 / estChars));
                    style = `style="font-size: ${size}rem"`;
                }

                problemHTML += `
                    <div class="problem-horizontal" ${style}>
                        <span class="equation">${equation} = </span>
                        <span class="answer-value">${q.answer}</span>
                    </div>
                `;
            } else {
                problemHTML += `<div class="problem-inner">`;
                if (q.nums && q.nums.length > 2) {
                    q.nums.forEach((num, i) => {
                        const isLast = i === q.nums.length - 1;
                        problemHTML += `
                            <div class="problem-row">
                                ${isLast ? `<span class="operator">${q.displayOperator}</span>` : ''}
                                <span>${num}</span>
                            </div>
                        `;
                    });
                } else {
                    problemHTML += `
                        <div class="problem-row">
                            <span>${q.num1}</span>
                        </div>
                        <div class="problem-row">
                            <span class="operator">${q.displayOperator}</span>
                            <span>${q.num2}</span>
                        </div>
                    `;
                }

                problemHTML += `
                        <div class="line"></div>
                        <div class="answer-value">${q.answer}</div>
                    </div>
                `;
            }
            el.innerHTML = problemHTML;
            grid.appendChild(el);
        });

        section.appendChild(grid);
        this.container.appendChild(section);
    }
}

// Global Exports
window.WorksheetGenerator = WorksheetGenerator;
window.WorksheetRenderer = WorksheetRenderer;

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW failed', err));
    });
}
