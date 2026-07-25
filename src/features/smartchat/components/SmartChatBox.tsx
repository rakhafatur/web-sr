import React from "react";
import {
  FiCpu,
  FiUser,
} from "react-icons/fi";

interface SmartChatBoxProps {
  sender: "ai" | "user";
  message: string;
}

const SmartChatBox: React.FC<SmartChatBoxProps> = ({
  sender,
  message,
}) => {
  const isAI = sender === "ai";

  return (
    <div
      className={`d-flex w-100 ${
        isAI
          ? "justify-content-start"
          : "justify-content-end"
      }`}
    >
      <div
        className={`d-flex gap-2 align-items-end ${
          isAI ? "" : "flex-row-reverse"
        }`}
        style={{
          maxWidth: "92%",
        }}
      >
        {/* AVATAR */}
        <div
          style={{
            width: 38,
            height: 38,
            minWidth: 38,
            borderRadius: 14,
            background: isAI
              ? "linear-gradient(135deg, #22c55e, #86efac)"
              : "linear-gradient(135deg, #3b82f6, #60a5fa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow:
              "0 8px 18px rgba(0,0,0,0.08)",
            marginBottom: 2,
          }}
        >
          {isAI ? (
            <FiCpu size={17} />
          ) : (
            <FiUser size={17} />
          )}
        </div>

        {/* BUBBLE */}
        <div
          style={{
            position: "relative",
            padding: "14px 16px",
            borderRadius: isAI
              ? "24px 24px 24px 8px"
              : "24px 24px 8px 24px",
            background: isAI
              ? "rgba(255,255,255,0.82)"
              : "linear-gradient(135deg, #16a34a, #22c55e)",
            color: isAI ? "#1f2937" : "white",
            backdropFilter: "blur(16px)",
            border: isAI
              ? "1px solid rgba(255,255,255,0.8)"
              : "none",
            boxShadow: isAI
              ? "0 10px 30px rgba(0,0,0,0.06)"
              : "0 12px 30px rgba(34,197,94,0.25)",
            overflow: "hidden",
          }}
        >
          {/* GLOW */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: isAI
                ? "linear-gradient(to bottom right, rgba(255,255,255,0.7), transparent)"
                : "linear-gradient(to bottom right, rgba(255,255,255,0.18), transparent)",
              pointerEvents: "none",
            }}
          />

          {/* LABEL */}
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              marginBottom: 6,
              opacity: 0.72,
              letterSpacing: 0.3,
            }}
          >
            {isAI ? "SR ASSISTANT" : "ANDA"}
          </div>

          {/* MESSAGE */}
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.6,
              fontSize: "0.93rem",
              position: "relative",
              zIndex: 2,
            }}
          >
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartChatBox;