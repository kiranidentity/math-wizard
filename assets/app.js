class WorksheetGenerator {
    constructor() { }

    generate(config) {
        const { type, count, min1, max1, min2, max2, terms } = config;
        const questions = [];

        // Logic check: Multi-term is only for Addition. Others use 2 terms.
        const isAddition = type === 'addition';

        for (let i = 0; i < count; i++) {
            let q = {};

            // Determine active operation for this problem (randomly if Mixed)
            let activeOp = type;
            if (type === 'mixed') {
                const ops = ['addition', 'subtraction', 'multiplication'];
                activeOp = ops[Math.floor(Math.random() * ops.length)];
            }

            // Generate Numbers
            if (activeOp === 'addition') {
                const numTerms = terms || 2;
                q.nums = [];
                for (let j = 0; j < numTerms; j++) {
                    const min = j === 0 ? min1 : min2;
                    const max = j === 0 ? max1 : max2;
                    q.nums.push(Math.floor(Math.random() * (max - min + 1)) + min);
                }
                q.answer = q.nums.reduce((a, b) => a + b, 0);
                q.displayOperator = '+';
            } else {
                // 2 Terms for others
                let n1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
                let n2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;

                if (activeOp === 'subtraction') {
                    if (n2 > n1) [n1, n2] = [n2, n1]; // Avoid negative results
                    q.answer = n1 - n2;
                    q.displayOperator = '−';
                } else {
                    q.answer = n1 * n2;
                    q.displayOperator = '×';
                }
                q.num1 = n1;
                q.num2 = n2;
            }

            q.op = activeOp;
            questions.push(q);
        }

        return { questions, config };
    }
}

class WorksheetRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render(data) {
        this.container.innerHTML = '';
        // Removed hardcoded display override to respect CSS flex/scaling

        // Add Action Bar at top
        this._renderActionBar(data);

        const wsPage = document.createElement('div');
        wsPage.className = 'worksheet-container';

        const innerContent = document.createElement('div');
        innerContent.className = 'worksheet-inner-content';

        // Header - Split Layout
        const header = document.createElement('div');
        header.className = 'worksheet-header';

        // Dynamic title based on config
        const opDisplay = data.config.type.charAt(0).toUpperCase() + data.config.type.slice(1);
        header.innerHTML = `
            <div class="worksheet-title">${opDisplay} Practice</div>
            <div class="worksheet-meta">
                <div>Date: ____________________</div>
                <div>Score: _________ / ${data.questions.length}</div>
            </div>
        `;
        innerContent.appendChild(header);

        const isHorizontal = data.config.layout === 'horizontal';

        // Decide column count
        let numCols = 2;
        if (isHorizontal) {
            // Check if 3 columns fit (simple heuristic based on digits)
            const d = data.config.digits || 1;
            const t = data.config.terms || 2;
            if (d <= 2 && t <= 2) numCols = 3;
        }

        const grid = document.createElement('div');
        grid.className = 'worksheet-grid';
        grid.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
        if (isHorizontal) grid.classList.add('horizontal-layout');

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

                problemHTML += `
                    <div class="problem-horizontal">
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
                            <span>${q.num1 || (q.nums ? q.nums[0] : 0)}</span>
                        </div>
                        <div class="problem-row">
                            <span class="operator">${q.displayOperator}</span>
                            <span>${q.num2 || (q.nums ? q.nums[1] : 0)}</span>
                        </div>
                    `;
                }
                problemHTML += `<div class="line"></div></div>`;
            }

            el.innerHTML = problemHTML;
            grid.appendChild(el);
        });

        innerContent.appendChild(grid);
        wsPage.appendChild(innerContent);
        this.container.appendChild(wsPage);

        // Render Answer Key (Sequential in the same container for v32 flow)
        if (data.config.includeAnswers) {
            this._renderAnswerKey(data, numCols);
        }
    }

    _renderActionBar(data) {
        const bar = document.createElement('div');
        bar.className = 'preview-actions no-print';
        bar.style.justifyContent = 'center';
        bar.style.marginBottom = '2rem';

        const dlBtn = document.createElement('button');
        dlBtn.className = 'btn-action download';
        dlBtn.innerHTML = '<span>📥</span> Download PDF';
        dlBtn.onclick = () => {
            if (window.PDFGenerator) {
                const gen = new window.PDFGenerator();
                gen.generate(data);
            }
        };

        const printBtn = document.createElement('button');
        printBtn.className = 'btn-action print';
        printBtn.innerHTML = '<span>🖨️</span> Print';
        printBtn.onclick = () => window.print();

        const shuffleBtn = document.createElement('button');
        shuffleBtn.className = 'btn-action shuffle';
        shuffleBtn.innerHTML = '<span>🎲</span> Shuffle';
        shuffleBtn.onclick = () => generate(); // Assuming generate is global

        bar.appendChild(shuffleBtn);
        bar.appendChild(dlBtn);
        bar.appendChild(printBtn);
        this.container.appendChild(bar);
    }

    _renderAnswerKey(data, numCols) {
        const divider = document.createElement('div');
        divider.className = 'answer-key-section no-print';
        this.container.appendChild(divider);

        const section = document.createElement('div');
        section.className = 'worksheet-container';

        const innerContent = document.createElement('div');
        innerContent.className = 'worksheet-inner-content';

        const header = document.createElement('div');
        header.className = 'worksheet-header';
        header.innerHTML = `<div class="worksheet-title">Answer Key</div>`;
        innerContent.appendChild(header);

        const isHorizontal = data.config.layout === 'horizontal';

        const grid = document.createElement('div');
        grid.className = 'worksheet-grid';
        if (isHorizontal) grid.classList.add('horizontal-layout');
        grid.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;

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

                problemHTML += `
                    <div class="problem-horizontal">
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
                            <span>${q.num1 || (q.nums ? q.nums[0] : 0)}</span>
                        </div>
                        <div class="problem-row">
                            <span class="operator">${q.displayOperator}</span>
                            <span>${q.num2 || (q.nums ? q.nums[1] : 0)}</span>
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

        innerContent.appendChild(grid);
        section.appendChild(innerContent);
        this.container.appendChild(section);
    }
}

window.WorksheetGenerator = WorksheetGenerator;
window.WorksheetRenderer = WorksheetRenderer;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('SW ok'))
            .catch(err => console.log('SW fail', err));
    });
}
