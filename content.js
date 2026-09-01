const UI_IDS = {
    root: 'froster-root',
    style: 'froster-style',
    btnFetch: 'froster-btn-fetch',
    btnSubmit: 'froster-btn-submit',
    btnComplete: 'froster-btn-complete',
    btnCopy: 'froster-btn-copy',
    btnClear: 'froster-btn-clear',
    answer: 'froster-answer',
    log: 'froster-log',
    menuAbout: 'froster-menu-about',
    menuOpenConsole: 'froster-menu-open-console',
    menuClose: 'froster-menu-close'
};

const logQueue = [];
let lastAnswer = '';
let lastAnswerRaw = null;
const globalContext = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

function getEl(id) {
    return document.getElementById(id);
}

function el(tag, options = {}) {
    const node = document.createElement(tag);
    if (options.id) node.id = options.id;
    if (options.className) node.className = options.className;
    if (options.text !== undefined) node.textContent = options.text;
    if (options.title) node.title = options.title;
    if (options.attrs) {
        Object.entries(options.attrs).forEach(([key, value]) => node.setAttribute(key, value));
    }
    return node;
}

function getJQuery() {
    if (globalContext && typeof globalContext.$ === 'function') return globalContext.$;
    if (typeof $ === 'function') return $;
    return null;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function injectStyles() {
    if (getEl(UI_IDS.style)) return;
    const style = document.createElement('style');
    style.id = UI_IDS.style;
    style.textContent = `
#${UI_IDS.root}{
    position:fixed;
    top:16px;
    right:16px;
    width:min(380px,92vw);
    z-index:99999;
    font-family:"Space Grotesk","Segoe UI",sans-serif;
    color:#e5e7eb;
    background:rgba(15,23,42,.94);
    border:1px solid rgba(148,163,184,.2);
    border-radius:16px;
    overflow:hidden;
    box-shadow:
        0 24px 70px rgba(0,0,0,.45),
        0 0 0 1px rgba(255,255,255,.03) inset;
    backdrop-filter:blur(18px);
    -webkit-backdrop-filter:blur(18px);
}

#${UI_IDS.root} *{
    box-sizing:border-box;
}

/* ───── Menu Bar ───── */

#${UI_IDS.root} .frost-menu-bar{
    position:relative;
    background:
        radial-gradient(circle at 10% 0%,rgba(45,212,191,.18),transparent 35%),
        radial-gradient(circle at 90% 100%,rgba(99,102,241,.16),transparent 40%),
        rgba(15,23,42,.92);
    padding:10px 12px;
    border-bottom:1px solid rgba(148,163,184,.15);
    cursor:move;
    user-select:none;
    touch-action:none;
}

#${UI_IDS.root} .frost-menu-bar::before{
    content:"";
    position:absolute;
    top:0;
    left:0;
    right:0;
    height:1px;
    background:linear-gradient(
        90deg,
        transparent,
        rgba(45,212,191,.7),
        rgba(99,102,241,.7),
        transparent
    );
}

#${UI_IDS.root} .frost-menu{
    list-style:none;
    margin:0;
    padding:0;
    display:flex;
    gap:4px;
    align-items:center;
}

#${UI_IDS.root} .frost-menu-item{
    position:relative;
    padding:6px 9px;
    border-radius:7px;
    cursor:default;
    font-size:12px;
    font-weight:600;
    color:#94a3b8;
    transition:
        color .18s ease,
        background .18s ease;
}

#${UI_IDS.root} .frost-menu-item:hover{
    color:#f8fafc;
    background:rgba(255,255,255,.07);
}

/* ───── Dropdown ───── */

#${UI_IDS.root} .frost-submenu{
    display:none;
    position:absolute;
    left:0;
    top:calc(100% + 4px);
    background:rgba(15,23,42,.98);
    border:1px solid rgba(148,163,184,.18);
    list-style:none;
    padding:5px;
    margin:0;
    min-width:155px;
    border-radius:10px;
    box-shadow:
        0 18px 40px rgba(0,0,0,.4),
        0 0 0 1px rgba(255,255,255,.025) inset;
    backdrop-filter:blur(16px);
}

#${UI_IDS.root} .frost-menu-item:hover>.frost-submenu{
    display:block;
    animation:frost-dropdown .15s ease-out;
}

#${UI_IDS.root} .frost-submenu li{
    padding:8px 10px;
    border-radius:6px;
    cursor:pointer;
    font-size:12px;
    color:#cbd5e1;
    transition:
        background .15s ease,
        color .15s ease,
        transform .15s ease;
}

#${UI_IDS.root} .frost-submenu li:hover{
    background:linear-gradient(
        90deg,
        rgba(20,184,166,.16),
        rgba(99,102,241,.10)
    );
    color:#ffffff;
    transform:translateX(2px);
}

@keyframes frost-dropdown{
    from{
        opacity:0;
        transform:translateY(-4px);
    }
    to{
        opacity:1;
        transform:translateY(0);
    }
}

/* ───── Content ───── */

#${UI_IDS.root} .frost-content{
    padding:15px;
    background:
        radial-gradient(circle at 100% 0%,rgba(20,184,166,.045),transparent 35%),
        rgba(15,23,42,.94);
}

#${UI_IDS.root} .frost-title{
    margin:0 0 13px 0;
    font-size:19px;
    letter-spacing:-.3px;
    font-weight:700;
    color:#f8fafc;
}

#${UI_IDS.root} .frost-title::after{
    content:"";
    display:block;
    width:128px;
    height:2px;
    margin-top:7px;
    border-radius:999px;
    background:linear-gradient(90deg,#2dd4bf,#818cf8);
}

/* ───── Rows ───── */

#${UI_IDS.root} .frost-row{
    display:flex;
    gap:8px;
    flex-wrap:wrap;
    margin-bottom:11px;
}

/* ───── Buttons ───── */

#${UI_IDS.root} .frost-btn{
    position:relative;
    overflow:hidden;
    background:linear-gradient(135deg,#0f766e,#0d9488);
    color:#ffffff;
    border:1px solid rgba(45,212,191,.25);
    padding:8px 11px;
    border-radius:8px;
    cursor:pointer;
    font-size:12px;
    font-weight:600;
    box-shadow:
        0 4px 12px rgba(13,148,136,.18),
        inset 0 1px 0 rgba(255,255,255,.12);
    transition:
        transform .15s ease,
        box-shadow .15s ease,
        filter .15s ease;
}

#${UI_IDS.root} .frost-btn::before{
    content:"";
    position:absolute;
    inset:0;
    background:linear-gradient(
        120deg,
        transparent 30%,
        rgba(255,255,255,.12),
        transparent 70%
    );
    transform:translateX(-120%);
    transition:transform .4s ease;
}

#${UI_IDS.root} .frost-btn:hover{
    transform:translateY(-1px);
    filter:brightness(1.08);
    box-shadow:
        0 7px 18px rgba(13,148,136,.28),
        inset 0 1px 0 rgba(255,255,255,.14);
}

#${UI_IDS.root} .frost-btn:hover::before{
    transform:translateX(120%);
}

#${UI_IDS.root} .frost-btn:active{
    transform:translateY(1px) scale(.98);
}

/* Secondary button */

#${UI_IDS.root} .frost-btn-secondary{
    background:rgba(51,65,85,.55);
    color:#cbd5e1;
    border:1px solid rgba(148,163,184,.15);
    box-shadow:none;
}

#${UI_IDS.root} .frost-btn-secondary:hover{
    background:rgba(71,85,105,.65);
    color:#f8fafc;
    box-shadow:0 5px 14px rgba(0,0,0,.2);
}

/* ───── Labels ───── */

#${UI_IDS.root} .frost-label{
    font-weight:600;
    color:#94a3b8;
    font-size:11px;
    margin-bottom:6px;
    margin-top:6px;
    text-transform:uppercase;
    letter-spacing:.7px;
}

/* ───── Answer ───── */

#${UI_IDS.root} .frost-answer{
    position:relative;
    padding:11px 12px;
    border:1px solid rgba(129,140,248,.2);
    border-radius:9px;
    background:
        linear-gradient(
            135deg,
            rgba(30,41,59,.75),
            rgba(15,23,42,.85)
        );
    min-height:38px;
    font-size:13px;
    color:#e2e8f0;
    box-shadow:
        inset 0 1px 0 rgba(255,255,255,.025);
}

#${UI_IDS.root} .frost-answer:empty::before{
    content:"Waiting for answer...";
    color:#64748b;
    font-style:italic;
}

/* ───── Log ───── */

#${UI_IDS.root} .frost-log{
    position:relative;
    background:#080d18;
    color:#a7f3d0;
    padding:11px;
    border:1px solid rgba(51,65,85,.5);
    border-radius:9px;
    min-height:140px;
    max-height:200px;
    overflow:auto;
    font-size:11px;
    line-height:1.55;
    font-family:"JetBrains Mono","Cascadia Code",Consolas,monospace;
    box-shadow:
        inset 0 0 25px rgba(0,0,0,.25),
        inset 0 1px 0 rgba(255,255,255,.02);
}

/* Scrollbar */

#${UI_IDS.root} .frost-log::-webkit-scrollbar{
    width:6px;
}

#${UI_IDS.root} .frost-log::-webkit-scrollbar-track{
    background:transparent;
}

#${UI_IDS.root} .frost-log::-webkit-scrollbar-thumb{
    background:#334155;
    border-radius:999px;
}

#${UI_IDS.root} .frost-log::-webkit-scrollbar-thumb:hover{
    background:#475569;
}

/* ───── Minimized ───── */

#${UI_IDS.root}.frost-minimized{
    display: none;
}

#${UI_IDS.root}.frost-minimized .frost-content{
    display:none;
}

/* ───── Selection ───── */

#${UI_IDS.root} ::selection{
    background:rgba(45,212,191,.3);
    color:#ffffff;
}
`;
    (document.head || document.documentElement).appendChild(style);
}

function buildGui() {
    if (getEl(UI_IDS.root)) return;
    injectStyles();

    const root = el('div', { id: UI_IDS.root });

    const menuBar = el('div', { className: 'frost-menu-bar' });
    const menu = el('ul', { className: 'frost-menu' });

    const fileItem = el('li', { className: 'frost-menu-item', text: 'File' });
    const fileSub = el('ul', { className: 'frost-submenu' });
    const menuOpenConsole = el('li', { id: UI_IDS.menuOpenConsole, text: 'Open Console' });
    const menuClose = el('li', { id: UI_IDS.menuClose, text: 'Minimize Panel' });
    fileSub.append(menuOpenConsole, menuClose);
    fileItem.appendChild(fileSub);

    const helpItem = el('li', { className: 'frost-menu-item', text: 'Help' });
    const helpSub = el('ul', { className: 'frost-submenu' });
    const menuAbout = el('li', { id: UI_IDS.menuAbout, text: 'About' });
    helpSub.appendChild(menuAbout);
    helpItem.appendChild(helpSub);

    menu.append(fileItem, helpItem);
    menuBar.appendChild(menu);

    const content = el('div', { className: 'frost-content' });
    const title = el('h1', { className: 'frost-title', text: '❄️ Froster ❄️' });

    const controls = el('div', { className: 'frost-controls' });
    const row = el('div', { className: 'frost-row' });
    const btnFetch = el('button', { id: UI_IDS.btnFetch, className: 'frost-btn', text: 'Fetch Answer', title: 'Fetch Answer - ]' });
    const btnSubmit = el('button', { id: UI_IDS.btnSubmit, className: 'frost-btn', text: 'Skip Question', title: 'Skip Question - ;' });
    const btnComplete = el('button', { id: UI_IDS.btnComplete, className: 'frost-btn', text: 'Complete Task', title: 'Complete Task - ctrl + ;' });
    const btnCopy = el('button', { id: UI_IDS.btnCopy, className: 'frost-btn', text: 'Copy Answer', title: 'Copy Answer - `' });
    row.append(btnFetch, btnSubmit, btnComplete, btnCopy);

    const labelAnswer = el('div', { className: 'frost-label', text: 'Latest Answer:' });
    const answer = el('div', { id: UI_IDS.answer, className: 'frost-answer', text: lastAnswer || '(no answer yet)' });

    controls.append(row, labelAnswer, answer);

    const logWrap = el('div', { className: 'frost-log-wrap' });
    const labelLog = el('div', { className: 'frost-label', text: 'Made by Hudson' });
    const log = el('pre', { id: UI_IDS.log, className: 'frost-log' });
    const btnClear = el('button', { id: UI_IDS.btnClear, className: 'frost-btn frost-btn-secondary', text: 'Clear Log'});
    logWrap.append(labelLog, log, btnClear);

    content.append(title, controls, logWrap);
    root.append(menuBar, content);
    document.body.appendChild(root);
}

function applyRootPosition(root, x, y) {
    root.style.left = `${x}px`;
    root.style.top = `${y}px`;
    root.style.right = 'auto';
}

function makeGuiDraggable() {
    const root = getEl(UI_IDS.root);
    if (!root || root.dataset.draggable === '1') return;

    const handle = root.querySelector('.frost-menu-bar');
    if (!handle) return;

    root.dataset.draggable = '1';
    const storageKey = 'froster-panel-pos';

    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const pos = JSON.parse(saved);
            if (Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
                applyRootPosition(root, pos.x, pos.y);
            }
        }
    } catch (err) {
    }

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let rootW = 0;
    let rootH = 0;
    let lastX = 0;
    let lastY = 0;

    const onPointerMove = (event) => {
        if (!dragging) return;
        const maxX = Math.max(8, window.innerWidth - rootW - 8);
        const maxY = Math.max(8, window.innerHeight - rootH - 8);
        const nextX = clamp(event.clientX - offsetX, 8, maxX);
        const nextY = clamp(event.clientY - offsetY, 8, maxY);
        lastX = nextX;
        lastY = nextY;
        applyRootPosition(root, nextX, nextY);
    };

    const onPointerUp = (event) => {
        if (!dragging) return;
        dragging = false;
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        try {
            handle.releasePointerCapture(event.pointerId);
        } catch (err) {
        }
        try {
            localStorage.setItem(storageKey, JSON.stringify({ x: lastX, y: lastY }));
        } catch (err) {
        }
    };

    const onPointerDown = (event) => {
        if (event.button !== 0) return;
        const rect = root.getBoundingClientRect();
        dragging = true;
        rootW = rect.width;
        rootH = rect.height;
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        lastX = rect.left;
        lastY = rect.top;
        applyRootPosition(root, lastX, lastY);
        handle.setPointerCapture(event.pointerId);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        event.preventDefault();
    };

    handle.addEventListener('pointerdown', onPointerDown);
}

function flushLogQueue() {
    const logEl = getEl(UI_IDS.log);
    if (!logEl || logQueue.length === 0) return;
    for (let i = logQueue.length - 1; i >= 0; i -= 1) {
        logEl.textContent = `${logQueue[i]}\n` + logEl.textContent;
    }
    logQueue.length = 0;
}

function uiLog(...args) {
    const logEl = getEl(UI_IDS.log);
    const now = new Date().toISOString().slice(11, 23);
    const text = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    const line = `${now}  ${text}`;
    if (logEl) {
        logEl.textContent = `${line}\n` + logEl.textContent;
    } else {
        logQueue.push(line);
    }
    console.log(...args);
}

function uiSetAnswer(text) {
    if (text !== undefined && text !== null) {
        lastAnswer = String(text);
    }
    const el = getEl(UI_IDS.answer);
    if (el) el.textContent = lastAnswer || '(no answer yet)';
}

function formatAnswerText(raw) {
    if (raw === undefined || raw === null) return '(no answer yet)';
    if (typeof raw === 'string') return raw;
    try {
        return JSON.stringify(raw);
    } catch (err) {
        return String(raw);
    }
}

function normalizeArrayAnswer(value) {
    const isAnswerWrapperObject = (candidate) => candidate
        && typeof candidate === 'object'
        && !Array.isArray(candidate)
        && (Object.prototype.hasOwnProperty.call(candidate, 'main')
            || Object.prototype.hasOwnProperty.call(candidate, 'exact'));

    if (Array.isArray(value)) {
        if (value.length === 1 && isAnswerWrapperObject(value[0])) {
            return normalizeArrayAnswer(value[0]);
        }
        return value.map(normalizeArrayAnswer);
    }
    if (isAnswerWrapperObject(value)) {
        const hasMain = Object.prototype.hasOwnProperty.call(value, 'main');
        const hasExact = Object.prototype.hasOwnProperty.call(value, 'exact');
        const mainValue = hasMain ? value.main : undefined;
        if (hasMain && mainValue !== undefined && mainValue !== null) {
            return normalizeArrayAnswer(mainValue);
        }
        if (hasExact) {
            return normalizeArrayAnswer(value.exact);
        }
        if (hasMain) return normalizeArrayAnswer(mainValue);
    }
    return value;
}

function normalizeUserAnswer(raw) {
    return normalizeArrayAnswer(raw);
}

function getTaskContext() {
    const jq = getJQuery();
    const $taskState = jq ? jq(document).data('taskState') : null;
    const taskState = $taskState || (window.taskState ? window.taskState : null);
    const question = taskState?.question || null;
    const params = taskState?.params || question?.params || null;
    const ssid = question?.subskill?.ssid || taskState?.ssid || null;
    const qnumAttr = document.querySelector('[data-qnum]')?.getAttribute('data-qnum');
    const aaidAttr = document.querySelector('[data-aaid]')?.getAttribute('data-aaid');
    const url = new URL(window.location.href);
    const qnum = taskState?.qnum || question?.qnum || (qnumAttr ? Number(qnumAttr) : null) || (url.searchParams.get('qnum') ? Number(url.searchParams.get('qnum')) : null);
    const aaid = taskState?.aaid || question?.aaid || (aaidAttr ? Number(aaidAttr) : null) || (url.searchParams.get('aaid') ? Number(url.searchParams.get('aaid')) : null);
    const referrer = aaid ? `https://www.drfrost.org/do-question.php?aaid=${aaid}` : window.location.href;

    return {
        taskState,
        question,
        params,
        ssid,
        qnum,
        aaid,
        referrer
    };
}

function overrideSetQNum() {
    if (!globalContext || typeof globalContext.setQNum !== 'function') return false;

    globalContext.setQNum = function(qnum) {
        const jq = getJQuery();
        const state = jq ? jq(document).data('taskState') : (globalContext.taskState || window.taskState);
        if (!state || !state.attempt) {
            uiLog('setQNum override failed: taskState missing');
            return false;
        }

        var isFixedTask = !!state.task.wid;
        var hasSeenQuestion = !!state.attempt.answers[qnum];

        const feedbackFn = globalContext.isFeedbackRequiredAndNotGiven
            || (typeof isFeedbackRequiredAndNotGiven === 'function' ? isFeedbackRequiredAndNotGiven : null);
        if (typeof feedbackFn === 'function' && feedbackFn()) {
            const alertFn = globalContext.dfmAlert
                || (typeof dfmAlert === 'function' ? dfmAlert : null)
                || alert;
            alertFn('Your teacher has required that you give feedback on your answer.');
            return false;
        }

        var toSend = { aaid: state.attempt.aaid };
        if (qnum) toSend.qnum = qnum;

        if (typeof globalContext.getTaskQuestion === 'function') {
            globalContext.getTaskQuestion(toSend);
        } else if (typeof getTaskQuestion === 'function') {
            getTaskQuestion(toSend);
        }
        return true;
    };

    uiLog('setQNum override installed');
    return true;
}

function installSetQNumOverride() {
    if (overrideSetQNum()) return;

    let attempts = 0;
    const maxAttempts = 40;
    const intervalMs = 500;
    const timer = setInterval(() => {
        attempts += 1;
        const installed = overrideSetQNum();
        if (installed || attempts >= maxAttempts) {
            clearInterval(timer);
            if (!installed) {
                uiLog('setQNum override not installed: function not found');
            }
        }
    }, intervalMs);
}

async function fetchAnswer() {
    try {
        uiLog('Attempting to fetch answer...');

        const jq = getJQuery();
        const $taskState = jq ? jq(document).data('taskState') : null;
        const taskState = $taskState || (window.taskState ? window.taskState : null);

        if (!taskState || !taskState.question) {
            uiLog('Task state or question not found. This must run on an active question page.');
            throw new Error('Task state missing');
        }

        const questionObj = taskState.question;

        const payload = {
            userAnswer: '1',
            params: questionObj.params,
            ssid: questionObj.subskill ? questionObj.subskill.ssid : undefined,
            question: questionObj
        };

        uiLog('Sending preview request...');

        const response = await fetch('https://www.drfrost.org/api/tasks/submitanswer', {
            method: 'POST',
            headers: {
                accept: 'application/json, text/javascript, */*; q=0.01',
                'content-type': 'text/plain;charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: 'https://www.drfrost.org/worksheets.php?wid=new',
            body: JSON.stringify(payload),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resultData = await response.json();
        const correctAnswerObj = resultData?.question?.answer?.correctAnswer;
        const rawAnswer = correctAnswerObj && Object.prototype.hasOwnProperty.call(correctAnswerObj, 'main')
            ? correctAnswerObj.main
            : correctAnswerObj;

        lastAnswerRaw = rawAnswer;
        uiLog('Fetched answer:', rawAnswer);
        uiSetAnswer(formatAnswerText(rawAnswer));
        return rawAnswer;
    } catch (err) {
        uiLog('Fetch failed:', err && err.message ? err.message : err);
        throw err;
    }
}

async function copyToClipboard(answerText) {
    const currentAnswer = getEl(UI_IDS.answer)?.textContent;
    const text = String(answerText ?? currentAnswer ?? lastAnswer ?? '');
    if (!text) {
        uiLog('Nothing to copy');
        return false;
    }

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            uiLog('Copied answer to clipboard (Clipboard API)');
            return true;
        }
        throw new Error('Clipboard API not available');
    } catch (apiErr) {
        uiLog('Clipboard API failed, attempting fallback');
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.top = '0';
            textarea.style.left = '0';
            textarea.style.width = '1px';
            textarea.style.height = '1px';
            textarea.style.padding = '0';
            textarea.style.border = 'none';
            textarea.style.outline = 'none';
            textarea.style.boxShadow = 'none';
            textarea.style.background = 'transparent';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (successful) {
                uiLog('Copied answer to clipboard (fallback)');
                return true;
            }

            uiLog('Fallback copy failed. Document may not be focused or browser blocked the copy.');
            return false;
        } catch (fallbackErr) {
            uiLog('Fallback clipboard copy exception:', fallbackErr);
            return false;
        }
    }
}

async function waitForTaskState(timeout = 10000) {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        const ctx = getTaskContext();

        if (ctx.taskState?.question) {
            return ctx;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
    }

    throw new Error('Timed out waiting for task state');
}

async function submitAnswer() {
    try {
        uiLog('Preparing submission...');
        const ctx = getTaskContext();

        const hasRawAnswer = lastAnswerRaw !== null && lastAnswerRaw !== undefined && !(typeof lastAnswerRaw === 'string' && lastAnswerRaw.trim() === '');

        if (!hasRawAnswer) {
            uiLog('No cached answer found. Fetching answer first...');
            await fetchAnswer();
        }

        const hasAnswerAfterFetch = lastAnswerRaw !== null && lastAnswerRaw !== undefined && !(typeof lastAnswerRaw === 'string' && lastAnswerRaw.trim() === '');
        if (!hasAnswerAfterFetch) {
            uiLog('Unable to submit: no answer available.');
            return null;
        }

        const missing = [];
        if (!ctx.aaid) missing.push('aaid');
        if (!ctx.qnum) missing.push('qnum');
        if (!ctx.ssid) missing.push('ssid');
        if (!ctx.params) missing.push('params');

        if (missing.length > 0) {
            uiLog('Unable to submit: missing', missing.join(', '));
            return null;
        }

        const userAnswer = normalizeUserAnswer(lastAnswerRaw);
        const payload = {
            userAnswer,
            qnum: ctx.qnum,
            aaid: ctx.aaid,
            ssid: ctx.ssid,
            params: ctx.params
        };

        uiLog('Submitting answer...');
        const response = await fetch('https://www.drfrost.org/api/tasks/submitanswer', {
            method: 'POST',
            headers: {
                accept: 'application/json, text/javascript, */*; q=0.01',
                'content-type': 'text/plain;charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: ctx.referrer,
            body: JSON.stringify(payload),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resultData = await response.json();
        const isCorrect = resultData?.iscorrect;
        const points = resultData?.performanceupdate?.pointsearned;
        uiLog('Submit response:', { iscorrect: isCorrect, pointsearned: points });
        return resultData;
    } catch (err) {
        uiLog('Submit failed:', err && err.message ? err.message : err);
        return null;
    }
}

function toggleCompleting() {
    if (!localStorage.getItem("running")) {
        localStorage.setItem("running", "true")
        uiLog("Completing active...");
        location.reload();
    } else {
        if (localStorage.getItem("running") == "true") {
            localStorage.setItem("running", "false")
            uiLog("Completing inactive...");
            getEl(UI_IDS.btnComplete).innerText = "Complete Task";
            getEl(UI_IDS.btnComplete).title = "Complete Task - ctrl + ;";
        } else {
            localStorage.setItem("running", "true")
            uiLog("Completing active...");
            location.reload();
        }
    }
};

function bindGuiEvents() {
    const root = getEl(UI_IDS.root);
    if (!root || root.dataset.bound === '1') return;
    root.dataset.bound = '1';

    const btnFetch = getEl(UI_IDS.btnFetch);
    const btnSubmit = getEl(UI_IDS.btnSubmit);
    const btnComplete = getEl(UI_IDS.btnComplete);
    const btnCopy = getEl(UI_IDS.btnCopy);
    const btnClear = getEl(UI_IDS.btnClear);
    const menuAbout = getEl(UI_IDS.menuAbout);
    const menuOpenConsole = getEl(UI_IDS.menuOpenConsole);
    const menuClose = getEl(UI_IDS.menuClose);

    if (btnFetch) btnFetch.addEventListener('click', async () => {
        try {
            await fetchAnswer();
        } catch (e) {
        }
    });

    if (btnSubmit) btnSubmit.addEventListener('click', async () => {
        await submitAnswer();
        location.reload();
    });

    if (btnComplete) btnComplete.addEventListener('click', async () => {
        await toggleCompleting();
    });

    if (btnCopy) btnCopy.addEventListener('click', async () => {
        await copyToClipboard();
    });

    if (btnClear) btnClear.addEventListener('click', () => {
        const logEl = getEl(UI_IDS.log);
        if (logEl) logEl.textContent = '';
    });

    if (menuAbout) menuAbout.addEventListener('click', () => {
        alert('Froster GUI\nUse on drfrost.org question pages to extract answers.');
    });

    if (menuOpenConsole) menuOpenConsole.addEventListener('click', () => {
        uiLog('Open console requested — press F12 to open devtools in most browsers.');
    });

    if (menuClose) menuClose.addEventListener('click', () => {
        let min = root.classList.toggle('frost-minimized');
        uiLog("Minimzed status: " + !min);
    });
}

function ensureGui() {
    buildGui();
    makeGuiDraggable();
    bindGuiEvents();
    flushLogQueue();
    uiSetAnswer(lastAnswer || '(no answer yet)');
}

async function showAnswerPopup() {
    await fetchAnswer();
    const existing = document.querySelector('.frost-answer-popup');
    if (existing) existing.remove();

    const answer = lastAnswer || getEl(UI_IDS.answer)?.textContent || '';

    if (!answer || answer === '(no answer yet)') {
        return;
    }

    const popup = document.createElement('div');
    popup.className = 'frost-answer-popup';
    popup.textContent = answer;
    popup.setAttribute("style", `
    position:fixed;
    right:18px;
    bottom:18px;
    text-align: center;
    min-width: 100px;
    padding:12px 15px;
    border-radius:12px;
    background:rgba(15,23,42,.96);
    border:1px solid rgba(45,212,191,.3);
    color:#f8fafc;
    font-size:26px;
    font-weight:600;
    line-height:1.4;
    box-shadow:
        0 12px 35px rgba(0,0,0,.4),
        0 0 20px rgba(45,212,191,.08);
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    z-index:100000;
    cursor:pointer;
    user-select:none;
    content:"Answer";
    display:block;
    margin-bottom:4px;
    font-size:10px;
    text-transform:uppercase;
    letter-spacing:.7px;
    color:#5eead4;
    `);

    document.body.appendChild(popup);
}

function onReady(fn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

onReady(async () => {
    ensureGui();
    installSetQNumOverride();
    uiLog('GUI ready');
    document.querySelector("#froster-menu-close").click()
    window.addEventListener("keydown", (event) => {
        if (event.key == "[") {
            document.querySelector("#froster-menu-close").click();
        }
        if (event.key == "'") {
            fetchAnswer();
            setTimeout(() => {
                copyToClipboard();
            }, 500);
        }
        if (event.key === "]") {
            let popup = document.querySelector('.frost-answer-popup');

            if (popup) {
                popup.remove();
            } else {
                showAnswerPopup();
            }
        }
        if (event.key == ";") {
            if (event.ctrlKey) {
                toggleCompleting();
            } else {
                submitAnswer();
                setTimeout(() => {
                    location.reload();
                }, 750);
            }
        }
        if (event.key === "\\") {
            const logEl = getEl(UI_IDS.log);
            const clearLog = getEl(UI_IDS.btnClear);
            if (logEl.style.display == "none") {
                logEl.style.display = "block";
                clearLog.style.display = "block";
            } else {
                logEl.style.display = "none";
                clearLog.style.display = "none";
            }
        }
    });
    const root = getEl(UI_IDS.root);
    const logEl = getEl(UI_IDS.log);
    const clearLog = getEl(UI_IDS.btnClear);
    const bar = root.querySelector('.frost-menu');
    bar.style.display = "none";
    logEl.style.display = "none";
    clearLog.style.display = "none";
    clearLog.style.marginTop = "10px";
    if (localStorage.getItem("running") == "true") {
        getEl(UI_IDS.btnComplete).innerText = "Stop Completing";
        getEl(UI_IDS.btnComplete).title = "Stop Completing - ctrl + ;";

        try {
            uiLog("Auto-answer: waiting for question...");

            await waitForTaskState();

            uiLog("Auto-answer: question found");

            await submitAnswer();

            const delay = Math.random() * 6000 + 4000;
            uiLog(`Auto-answer: next question in ${Math.round(delay)}ms`);

            setTimeout(() => {
                location.reload();
            }, delay);

        } catch (err) {
            uiLog("Auto-answer failed:", err?.message || err);
        }
    }
    if (!localStorage.getItem('firstTime')) {
        alert("Froster injected! Press [ for menu, ] for answer, ' for copy answer to clipboard, ; for skip question, ctrl + ; for complete task (you can leave the tab but not close it) and \\ for debug. This message will only be show once.");
        localStorage.setItem('firstTime', "no");
    }
});