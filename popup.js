document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const saveBtn = document.getElementById('save');
    const clearBtn = document.getElementById('clear');
    const boldBtn = document.getElementById('bold');
    const italicBtn = document.getElementById('italic');
    const underlineBtn = document.getElementById('underline');
    const fontSizeSelect = document.getElementById('fontSize');
    const saveModal = document.getElementById('saveModal');
    const fileNameInput = document.getElementById('fileName');
    const fileFormatSelect = document.getElementById('fileFormat');
    const confirmSaveBtn = document.getElementById('confirmSave');
    const cancelSaveBtn = document.getElementById('cancelSave');

    // Завантаження збереженого тексту
    chrome.storage.local.get(['notes'], (result) => {
        if (result.notes) editor.innerHTML = result.notes;
    });

    // Форматування
    boldBtn.onclick = () => document.execCommand('bold');
    italicBtn.onclick = () => document.execCommand('italic');
    underlineBtn.onclick = () => document.execCommand('underline');

    // Зміна розміру шрифту для виділеного тексту
    fontSizeSelect.onchange = (e) => {
        const size = e.target.value + 'px';
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.toString().length > 0) { // Якщо є виділення
                const span = document.createElement('span');
                span.style.fontSize = size;
                range.surroundContents(span);
            } else {
                // Якщо немає виділення, застосовуємо до наступного введення
                document.execCommand('styleWithCSS', false, true);
                document.execCommand('fontSize', false, '4'); // Базовий розмір
                const spans = editor.getElementsByTagName('span');
                for (let span of spans) {
                    if (span.style.fontSize === 'medium') { // Виправляємо розмір
                        span.style.fontSize = size;
                    }
                }
            }
        }
    };

    // Показати модальне вікно для збереження
    saveBtn.onclick = () => {
        saveModal.style.display = 'block';
    };

    // Підтвердження збереження
    confirmSaveBtn.onclick = () => {
        const content = editor.innerHTML;
        const fileName = fileNameInput.value || 'notes';
        const format = fileFormatSelect.value;

        chrome.storage.local.set({ notes: content });

        let blob;
        switch (format) {
            case 'txt':
                blob = new Blob([editor.innerText], { type: 'text/plain' });
                break;
            case 'html':
                blob = new Blob([editor.innerHTML], { type: 'text/html' });
                break;
            case 'css':
                blob = new Blob([editor.innerText], { type: 'text/css' });
                break;
            case 'rtf':
                blob = new Blob([editor.innerHTML], { type: 'application/rtf' });
                break;
        }
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: `${fileName}.${format}`
        });
        saveModal.style.display = 'none';
    };

    // Скасування збереження
    cancelSaveBtn.onclick = () => {
        saveModal.style.display = 'none';
    };

    // Очищення
    clearBtn.onclick = () => {
        editor.innerHTML = '';
        chrome.storage.local.remove('notes');
    };

    // Збереження при змінах
    editor.oninput = () => {
        chrome.storage.local.set({ notes: editor.innerHTML });
    };
});