// src/App.jsx
import React, { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Main from "./components/Main/Main";
import { exportChatToPDF } from "./utils/exportPdf";

function deriveTitle(messages) {
  const firstUser = messages.find(m => m.sender === "user");
  const raw = firstUser?.text || "Untitled Chat";
  const oneLine = raw.replace(/\s+/g, " ").trim();
  return oneLine.length > 28 ? oneLine.slice(0, 28) + "…" : oneLine;
}

const App = () => {
  const [messages, setMessages] = useState([]);        // aktif sohbet
  const [chatHistory, setChatHistory] = useState([]);  // geçmiş sohbetler

  const onNewChat = () => {
    if (messages.length > 0) {
      const item = {
        id: Date.now().toString(),
        title: deriveTitle(messages),
        messages: JSON.parse(JSON.stringify(messages)),
        createdAt: Date.now(),
      };
      setChatHistory(prev => [item, ...prev]);
    }
    setMessages([]); // yeni sohbet başlat
  };

  const onSelectChat = (chat) => {
    setMessages(JSON.parse(JSON.stringify(chat.messages)));
  };

  const onDeleteChat = (id) => {
    setChatHistory(prev => prev.filter(c => c.id !== id));
  };

  // ▼▼▼ YENİ: İndir (PDF)
const onDownloadChat = (chat) => {
  if (!chat?.messages?.length) {
    alert("Bu sohbette içerik yok.");
    return;
  }

  // HTML içerik oluştur
  const htmlContent = `
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f9f9f9;
          padding: 20px;
        }
        .chat-message {
          margin-bottom: 10px;
          padding: 10px 15px;
          border-radius: 8px;
          max-width: 80%;
        }
        .user-message {
          background: #007bff;
          color: white;
          margin-left: auto;
          text-align: right;
        }
        .ai-message {
          background: #e5e5ea;
          color: black;
          margin-right: auto;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <h2>${chat.title || "Untitled Chat"}</h2>
      ${chat.messages
        .map(m => 
          `<div class="chat-message ${m.sender === "user" ? "user-message" : "ai-message"}">
            ${m.text.replace(/\n/g, "<br>")}
          </div>`
        )
        .join("")}
    </body>
    </html>
  `;

  // PDF ayarları
  const opt = {
    margin: 10,
    filename: `${(chat.title || "chat").replace(/[^\w\-]+/g, "_")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  window.html2pdf().set(opt).from(htmlContent).save();
};


  return (
    <>
      <Sidebar
        onNewChat={onNewChat}
        onSelectChat={onSelectChat}
        onDeleteChat={onDeleteChat}
        onDownloadChat={onDownloadChat}
        chatHistory={chatHistory}
      />
      <Main
        messages={messages}
        setMessages={setMessages}
      />
    </>
  );
};

export default App;