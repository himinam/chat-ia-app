const chat = document.getElementById("chat");
const input = document.getElementById("inputMensaje");
const btnEnviar = document.getElementById("btnEnviar");
const nuevoChat = document.getElementById("nuevoChat");
const listaChats = document.getElementById("listaChats");

// ==========================
// ESTADO GLOBAL
// ==========================

let chats = {};
let chatActual = "chat-1";
let usuarioActual = localStorage.getItem("usuario") || null;

chats[chatActual] = [];

// ==========================
// EVENTOS (LIMPIO Y SIN DUPLICADOS)
// ==========================

btnEnviar.addEventListener("click", enviarMensaje);

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") enviarMensaje();
});

nuevoChat.addEventListener("click", () => {

    if(!usuarioActual){
        loginUsuario();
    }

    crearNuevoChat();
});

// ==========================
// ENVIAR MENSAJE
// ==========================

async function enviarMensaje(){

    const texto = input.value.trim();
    if(!texto) return;

    agregarMensaje(texto, "usuario");
    input.value = "";

    mostrarEscribiendo();

    try {

        const respuesta = await obtenerRespuestaIA(texto);

        quitarEscribiendo();
        agregarMensaje(respuesta, "ia");

    } catch (error) {

        quitarEscribiendo();
        agregarMensaje("❌ Error del servidor", "ia");

        console.error(error);
    }
}

// ==========================
// UI MENSAJES (CON HISTORIAL PRO)
// ==========================

function agregarMensaje(texto, tipo){

    const div = document.createElement("div");
    div.classList.add("mensaje", tipo);
    if(tipo === "usuario" && usuarioActual){
    div.innerText = usuarioActual + ": " + texto;
} else {
    div.innerText = texto;
}

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    if(!chats[chatActual]){
        chats[chatActual] = [];
    }

    chats[chatActual].push({ tipo, texto });
}

// ==========================
// ESCRIBIENDO
// ==========================

function mostrarEscribiendo(){

    const div = document.createElement("div");
    div.id = "typing";
    div.classList.add("mensaje", "ia");
    div.innerText = "Escribiendo...";

    chat.appendChild(div);
}

function quitarEscribiendo(){
    const t = document.getElementById("typing");
    if(t) t.remove();
}

// ==========================
// IA BACKEND (PRO FIX IMPORTANTE)
// ==========================

async function obtenerRespuestaIA(mensaje){

    const historial = chats[chatActual] || [];

    const messages = [
        {
            role: "system",
            content: "Eres un asistente útil, claro y respondes en español."
        }
    ];

    historial.forEach(m => {
        messages.push({
            role: m.tipo === "usuario" ? "user" : "assistant",
            content: m.texto
        });
    });

    messages.push({
        role: "user",
        content: mensaje
    });

    const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages })
    });

    if(!res.ok){
        throw new Error("Error HTTP " + res.status);
    }

    const data = await res.json();
    return data.respuesta;
}

// ==========================
// NUEVO CHAT (PRO FIX)
// ==========================

function crearNuevoChat(){

    chatActual = "chat-" + Date.now();

    chats[chatActual] = [];

    chat.innerHTML = `
        <div class="mensaje ia">
            Nuevo chat iniciado 👋
        </div>
    `;
}
function loginUsuario(){

    let nombre = prompt("Ingresa tu nombre para iniciar sesión:");

    if(!nombre) return;

    usuarioActual = nombre;

    localStorage.setItem("usuario", nombre);

    alert("Bienvenido " + nombre + " 🚀");
}