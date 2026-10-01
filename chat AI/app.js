const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

const API_KEY = CONFIG.API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${API_KEY}`;

// Formatear markdown
function formatText(text) {
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedText = formattedText.replace(/\n/g, '<br>');
    return formattedText;
}

// mostrar mensajes en la pantalla
function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(sender === 'user' ? 'user-msg' : (sender === 'error' ? 'error-msg' : 'ai-msg'));
    msgDiv.innerHTML = formatText(text);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Función API
async function askAI(question) {
    addMessage(question, 'user');
    userInput.value = '';

    const loadingMsgId = Date.now();
    addMessage('Escribiendo...', 'ai');

    if (!API_KEY || API_KEY === "pegar clave aqui") {
        chatBox.lastChild.textContent = "Error: Por favor, configura tu API Key en config.js.";
        chatBox.lastChild.classList.replace('ai-msg', 'error-msg');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: question }]
                }]
            })
        });

        // Gestionar respuesta incorrecta
        if (!response.ok) {
            const errorData = await response.json();
            const apiMessage = errorData.error?.message || response.statusText;
            throw new Error(`Error de la API: ${apiMessage}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        chatBox.lastChild.innerHTML = formatText(aiResponse);

    } catch (error) {
        console.error("Error:", error);
        chatBox.lastChild.textContent = error.message;
        chatBox.lastChild.classList.replace('ai-msg', 'error-msg');
    }
}
sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text) askAI(text);
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = userInput.value.trim();
        if (text) askAI(text);
    }
});
