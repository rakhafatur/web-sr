import React from "react";

interface SmartChatBoxProps {
  sender: "ai" | "user";
  message: string;
}

const SmartChatBox: React.FC<SmartChatBoxProps> = ({ sender, message }) => {
  const isUser = sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm break-words shadow-sm transition ${
          isUser
            ? "bg-[var(--color-green)] text-[var(--color-white)] rounded-br-none"
            : "bg-[var(--color-green-light)] text-[var(--color-dark)] rounded-bl-none"
        }`}
      >
        {message}
      </div>
    </div>
  );
};

export default SmartChatBox;