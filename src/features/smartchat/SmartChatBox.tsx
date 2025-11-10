import React from "react";

interface SmartChatBoxProps {
  sender: "ai" | "user";
  message: string;
}

const SmartChatBox: React.FC<SmartChatBoxProps> = ({ sender, message }) => {
  return (
    <div
      className={`px-4 py-2 rounded-2xl text-sm sm:text-base break-words shadow-sm transition-all duration-200
        ${
          sender === "ai"
            ? "bg-[#E6F4EA] text-green-800 self-start"
            : "bg-green-500 text-white self-end"
        }`}
      style={{
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        maxWidth: "100%",
      }}
    >
      {message}
    </div>
  );
};

export default SmartChatBox;