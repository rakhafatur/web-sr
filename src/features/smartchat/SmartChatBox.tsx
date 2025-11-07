import React from "react";

interface SmartChatBoxProps {
  sender: "ai" | "user";
  message: string;
}

const SmartChatBox: React.FC<SmartChatBoxProps> = ({ sender, message }) => {
  return (
    <div
      className={`px-3 py-2 rounded-lg break-words ${sender === "ai" ? "bg-gray-200 text-gray-900" : "bg-green-500 text-white"}`}
      style={{ whiteSpace: "pre-wrap" }} // <-- Ini biar \n muncul
    >
      {message}
    </div>
  );
};

export default SmartChatBox;