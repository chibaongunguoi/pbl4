"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "../admin.css";

export default function ChatbotAdmin() {
  const [chatHistories, setChatHistories] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const chatHistoryRef = useRef(chatHistory);

  const displayMessages = useMemo(
    () => chatHistory.filter((msg) => msg.role === "user" || msg.role === "assistant"),
    [chatHistory]
  );

  const setChatHistoryWithRef = (updater) => {
    setChatHistory((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      chatHistoryRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    const initialize = async () => {
      const histories = await fetchChatHistories();
      if (histories.length) {
        await selectChat(histories[0].id);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const fetchChatHistories = async () => {
    try {
      const response = await fetch("/api/chatbot/chat_histories");
      const data = await response.json();
      const histories = data.chat_histories || [];
      setChatHistories(histories);
      return histories;
    } catch (error) {
      console.error("Error fetching chat histories:", error);
      return [];
    }
  };

  const selectChat = async (chatId) => {
    if (!chatId) return;
    try {
      const response = await fetch(`/api/chatbot/chat_histories/${chatId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCurrentChatId(chatId);
      setChatHistoryWithRef(data.chat_history || []);
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const response = await fetch(`/api/chatbot/chat_histories/${chatId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const histories = await fetchChatHistories();
      if (currentChatId === chatId) {
        if (histories.length) {
          await selectChat(histories[0].id);
        } else {
          setCurrentChatId(null);
          setChatHistoryWithRef([]);
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const newChat = async () => {
    try {
      const response = await fetch("/api/chatbot/new_chat", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      await fetchChatHistories();
      if (data?.chat_id) {
        await selectChat(data.chat_id);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const saveChatHistory = async (chatId) => {
    if (!chatId) return;
    try {
      await fetch("/api/chatbot/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          messages: chatHistoryRef.current,
        }),
      });
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !currentChatId) return;

    const userMessage = { role: "user", content: input.trim() };
    const assistantPlaceholder = { role: "assistant", content: "" };
    const historyToSend = [...chatHistoryRef.current, userMessage, assistantPlaceholder];
    setChatHistoryWithRef(historyToSend);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chatbot/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_history: historyToSend, chat_id: currentChatId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Streaming body not available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let pending = "";

      const appendChatHistory = (newDialogs) => {
        setChatHistoryWithRef((prev) => {
          const cleanedPrev = prev.length && prev[prev.length - 1].role === "assistant" && prev[prev.length - 1].content === ""
            ? prev.slice(0, -1)
            : prev;
          return [...cleanedPrev, ...newDialogs, { role: "assistant", content: "" }];
        });
        buffer = "";
      };

      const consumeJsonChunks = (source) => {
        let depth = 0;
        let inString = false;
        let escape = false;
        let chunkStart = -1;
        let lastProcessedEnd = 0;

        for (let i = 0; i < source.length; i++) {
          const char = source[i];
          if (inString) {
            if (escape) {
              escape = false;
            } else if (char === "\\") {
              escape = true;
            } else if (char === '"') {
              inString = false;
            }
            continue;
          }

          if (char === '"') {
            inString = true;
            continue;
          }

          if (char === "{") {
            if (depth === 0) {
              chunkStart = i;
            }
            depth++;
          } else if (char === "}") {
            depth--;
            if (depth === 0 && chunkStart !== -1) {
              const chunk = source.slice(chunkStart, i + 1);
              try {
                const msg = JSON.parse(chunk);
                if (msg.type === "token" && msg.token) {
                  buffer += msg.token;
                  setChatHistoryWithRef((prev) => {
                    if (!prev.length) return prev;
                    const lastIndex = prev.length - 1;
                    const lastEntry = prev[lastIndex];
                    if (lastEntry.role !== "assistant") return prev;
                    const updated = { ...lastEntry, content: buffer };
                    return [...prev.slice(0, lastIndex), updated];
                  });
                } else if (msg.type === "chat_history" && msg.new_chat_history?.length) {
                  appendChatHistory(msg.new_chat_history);
                }
              } catch (err) {
                console.error("Error parsing JSON chunk:", err, chunk);
              }
              lastProcessedEnd = i + 1;
              chunkStart = -1;
            }
          }
        }

        return source.slice(lastProcessedEnd).trimStart();
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        pending += decoder.decode(value, { stream: true });
        pending = consumeJsonChunks(pending);
      }

      pending = consumeJsonChunks(pending);

      void saveChatHistory(currentChatId);
      void fetchChatHistories();
    } catch (error) {
      console.error("Error streaming response:", error);
      setChatHistoryWithRef((prev) => {
        if (!prev.length) return prev;
        const lastIndex = prev.length - 1;
        const lastEntry = prev[lastIndex];
        if (lastEntry.role !== "assistant") return prev;
        const updated = { ...lastEntry, content: "Error: Failed to get response" };
        return [...prev.slice(0, lastIndex), updated];
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div>
      <div className="admin-content-header">
        <h1 className="admin-content-title">Trợ lí ảo</h1>
        <p className="admin-content-subtitle">Tra cứu việc làm</p>
      </div>

      <div className="chatbot-layout">
        <div className="chat-sidebar">
          <button onClick={newChat} className="new-chat-btn">
            Hội thoại mới
          </button>
          <div className="chat-list">
            {chatHistories.map((chat) => (
              <div key={chat.id} className={`chat-item ${currentChatId === chat.id ? "active" : ""}`}>
                <button onClick={() => selectChat(chat.id)} className="chat-select">
                  {chat.title || `Chat ${chat.id}`}
                </button>
                <button onClick={() => deleteChat(chat.id)} className="chat-delete">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-messages">
            {displayMessages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`message ${msg.role}`}>
                <div className="message-role">{msg.role === "user" ? "You" : "Assistant"}:</div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={isStreaming || !currentChatId}
              className="chat-input"
            />
            <button type="submit" disabled={isStreaming || !input.trim()} className="chat-submit-btn">
              {isStreaming ? "Đang gửi..." : "Gửi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}