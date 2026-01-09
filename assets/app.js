class WorksheetGenerator {
    constructor() { }

    generate(config) {
        const { type, count, min1, max1, min2, max2, terms } = config;
        const questions = [];

        for (let i = 0; i < count; i++) {
            const problemTerms = [];
            const numTerms = (type === 'addition' || (type === 'mixed' && Math.random() > 0.5)) ? (terms || 2) : 2;

            for (let j = 0; j < numTerms; j++) {
                const min = j === 0 ? min1 : min2;
                const max = j === 0 ? max1 : max2;
                problemTerms.push(Math.floor(Math.random() * (max - min + 1)) + min);
            }

            let op = type;
            if (type === 'mixed') {
                const ops = ['addition', 'subtraction', 'multiplication'];
                op = ops[Math.floor(Math.random() * ops.length)];
            }

            // For subtraction, ensure result is non-negative
            if (op === 'subtraction' && problemTerms.length === 2) {
                problemTerms.sort((a, b) => b - a);
            }

            const answer = this._calculateAnswer(op, problemTerms);
            questions.push({ terms: problemTerms, op, answer });
        }

        return { questions, config };
    }

    _calculateAnswer(op, terms) {
        if (op === 'addition' || op === 'mixed_addition') return terms.reduce((a, b) => a + b, 0);
        if (op === 'subtraction') return terms[0] - terms[1];
        if (op === 'multiplication') return terms.reduce((a, b) => a * b, 1);
        return 0;
    }
}

class WorksheetRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render(data) {
        this.container.innerHTML = '';
        this.container.style.display = 'block';

        const wrapper = document.createElement('div');
        wrapper.className = 'worksheet-container';

        // Header
        const header = document.createElement('div');
        header.className = 'worksheet-header';

        const titleText = data.config.type.charAt(0).toUpperCase() + data.config.type.slice(1) + " Worksheet";
        header.innerHTML = `
            <div class="worksheet-title">${titleText}</div>
            <div class="worksheet-meta">
                Name: ____________________ Date: _________
            </div>
        `;
        wrapper.appendChild(header);

        // Grid
        const grid = document.createElement('div');
        const numCols = data.config.layout === 'horizontal' ? 3 : 2;
        grid.className = `worksheet-grid ${data.config.layout}-layout`;
        grid.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;

        data.questions.forEach((q, index) => {
            const el = document.createElement('div');
            el.className = `problem ${data.config.layout}`;

            let problemHTML = `<div class="problem-number">${index + 1})</div>`;

            if (data.config.layout === 'horizontal') {
                const sym = q.op === 'subtraction' ? '-' : (q.op === 'multiplication' ? '×' : '+');
                problemHTML += `<div class="problem-horizontal">
                    <span class="equation">${q.terms.join(` ${sym} `)} = </span>
                    <span class="answer-space">_______</span>
                </div>`;
            } else {
                problemHTML += `<div class="problem-inner">`;
                for (let i = 0; i < q.terms.length; i++) {
                    const isLast = i === q.terms.length - 1;
                    const sym = q.op === 'subtraction' ? '-' : (q.op === 'multiplication' ? '×' : '+');
                    problemHTML += `
                        <div class="problem-row">
                            ${isLast ? `<span class="operator">${sym}</span>` : ''}
                            <span class="number">${q.terms[i]}</span>
                        </div>`;
                }
                problemHTML += `<div class="line"></div></div>`;
            }

            el.innerHTML = problemHTML;
            grid.appendChild(el);
        });

        wrapper.appendChild(grid);
        this.container.appendChild(wrapper);

        // Answer Key
        if (data.config.includeAnswers) {
            this._renderAnswerKey(data, numCols);
        }
    }

    _renderAnswerKey(data, numCols) {
        const divider = document.createElement('div');
        divider.className = 'answer-key-section no-print';
        this.container.appendChild(divider);

        const wrapper = document.createElement('div');
        wrapper.className = 'worksheet-container answer-key';

        const header = document.createElement('div');
        header.className = 'worksheet-header';
        header.innerHTML = `<div class="worksheet-title">Answer Key</div>`;
        wrapper.appendChild(header);

        const grid = document.createElement('div');
        grid.className = `worksheet-grid ${data.config.layout}-layout`;
        grid.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;

        data.questions.forEach((q, index) => {
            const el = document.createElement('div');
            el.className = `problem ${data.config.layout}`;

            let html = `<div class="problem-number">${index + 1})</div>`;
            if (data.config.layout === 'horizontal') {
                const sym = q.op === 'subtraction' ? '-' : (q.op === 'multiplication' ? '×' : '+');
                html += `<div class="problem-horizontal">
                    <span class="equation">${q.terms.join(` ${sym} `)} = </span>
                    <span class="answer-value">${q.answer}</span>
                </div>`;
            } else {
                html += `<div class="problem-inner">
                    <div class="answer-value" style="text-align:right; width:100%; border-bottom: 2px solid #000; padding-bottom: 5px;">${q.answer}</div>
                    <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">Correct Answer</div>
                </div>`;
            }
            el.innerHTML = html;
            grid.appendChild(el);
        });

        wrapper.appendChild(grid);
        this.container.appendChild(wrapper);
    }
}
