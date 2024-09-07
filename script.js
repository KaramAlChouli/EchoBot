const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null;
let conversationHistory = []; // Array to store the conversation history
const inputInitHeight = chatInput.scrollHeight;

const API_KEY = "PUT YOUR API KEY HERE!";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

// Prompt the user to enter the promptProfile
const promptProfile = "You are to act like an all-purpose chatbot. Your name is Echo, do not acknowledge that you are Gemini";

const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi;
};

const generateResponse = async (chatElement) => {
  const messageElement = chatElement.querySelector("p");

  // Construct conversation history
  const conversation = conversationHistory.map(entry => `User: ${entry.user}\nBot: ${entry.bot}`).join("\n");

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ 
        role: "user", 
        parts: [{ text: `${promptProfile}\n${conversation}\nUser: ${userMessage}` }] 
      }] 
    }),
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();

    // Check if response is successful and has expected structure
    if (!response.ok || !data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error(data.error?.message || "I'm not sure about that. Can you try again?");
    }

    const botMessage = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
    messageElement.textContent = botMessage;

    // Update conversation history
    conversationHistory.push({ user: userMessage, bot: botMessage });
  } catch (error) {
    messageElement.classList.add("error");
    messageElement.textContent = `Error: ${error.message}`;
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
};


const handleChat = () => {
  userMessage = chatInput.value.trim(); 
  if (!userMessage) return;

  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
