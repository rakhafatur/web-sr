import React from "react";
import {
  FiCpu,
  FiUser,
} from "react-icons/fi";

export type ChatStat = {
  icon?: React.ReactNode;
  label: string;
  value: string;
};

export type ChatRankItem = {
  name: string;
  sub?: string;
  value: string;
};

export type ChatRankGroup = {
  icon?: React.ReactNode;
  heading: string;
  items: ChatRankItem[];
};

export type ChatReport = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  stats?: ChatStat[];
  groups?: ChatRankGroup[];
};

interface SmartChatBoxProps {
  sender: "ai" | "user";
  message: string;
  report?: ChatReport;
}

const SmartChatBox: React.FC<SmartChatBoxProps> = ({
  sender,
  message,
  report,
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
          maxWidth: report ? "96%" : "92%",
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
              ? "linear-gradient(135deg, var(--color-green), var(--color-accent))"
              : "linear-gradient(135deg, var(--color-medical), var(--color-accent))",
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
              ? "rgba(var(--color-bg-rgb),0.82)"
              : "linear-gradient(135deg, var(--color-green), var(--color-accent))",
            color: isAI ? "var(--color-dark)" : "white",
            backdropFilter: "blur(16px)",
            border: isAI
              ? "1px solid var(--color-gray-200)"
              : "none",
            boxShadow: isAI
              ? "0 10px 30px rgba(0,0,0,0.3)"
              : "0 12px 30px rgba(var(--color-primary-rgb),0.3)",
            overflow: "hidden",
            width: report ? "100%" : undefined,
          }}
        >
          {/* GLOW */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: isAI
                ? "linear-gradient(to bottom right, rgba(255,255,255,0.06), transparent)"
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
              position: "relative",
              zIndex: 2,
            }}
          >
            {isAI ? "SR ASSISTANT" : "ANDA"}
          </div>

          {report ? (
            <div
              style={{
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* REPORT TITLE */}
              <div
                className="d-flex align-items-center gap-2"
                style={{ marginBottom: report.stats || report.groups ? 12 : 0 }}
              >
                {report.icon && (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      background: "rgba(var(--color-primary-rgb), 0.16)",
                      color: "var(--color-green)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 15,
                    }}
                  >
                    {report.icon}
                  </div>
                )}

                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.98rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {report.title}
                  </div>

                  {report.subtitle && (
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--color-gray-500)",
                        marginTop: 1,
                      }}
                    >
                      {report.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* STAT GRID */}
              {report.stats && (
                <div
                  style={{
                    display: "grid",
                    // minmax(0, 1fr) — bukan minmax(120px, 1fr) — supaya kolom
                    // boleh menyusut mengikuti lebar bubble yang tersedia,
                    // bukan malah memaksa grid lebih lebar dari bubble lalu
                    // kepotong oleh overflow:hidden di bubble pada layar sempit.
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 8,
                    marginBottom: report.groups ? 14 : 0,
                  }}
                >
                  {report.stats.map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-gray-200)",
                        borderRadius: 14,
                        padding: "10px 12px",
                        minWidth: 0,
                      }}
                    >
                      <div
                        className="d-flex align-items-center gap-1"
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          color: "var(--color-gray-500)",
                          marginBottom: 4,
                          textTransform: "uppercase",
                          letterSpacing: 0.2,
                          minWidth: 0,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {stat.icon}
                        <span>{stat.label}</span>
                      </div>

                      <div
                        style={{
                          fontSize: "0.92rem",
                          fontWeight: 700,
                          color: "var(--color-dark)",
                          wordBreak: "break-word",
                        }}
                      >
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* RANK GROUPS */}
              {report.groups && (
                <div className="d-flex flex-column gap-3">
                  {report.groups.map((group, gi) => (
                    <div key={gi}>
                      <div
                        className="d-flex align-items-center gap-2"
                        style={{
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          color: "var(--color-green)",
                          marginBottom: 6,
                        }}
                      >
                        {group.icon}
                        <span>{group.heading}</span>
                      </div>

                      <div className="d-flex flex-column gap-1">
                        {group.items.map((item, ii) => (
                          <div
                            key={ii}
                            className="d-flex align-items-center justify-content-between gap-2"
                            style={{
                              background: "var(--color-surface-2)",
                              border: "1px solid var(--color-gray-200)",
                              borderRadius: 12,
                              padding: "8px 12px",
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                  color: "var(--color-dark)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {item.name}
                              </div>

                              {item.sub && (
                                <div
                                  style={{
                                    fontSize: "0.72rem",
                                    color: "var(--color-gray-500)",
                                  }}
                                >
                                  {item.sub}
                                </div>
                              )}
                            </div>

                            <div
                              style={{
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                color: "var(--color-green)",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}
                            >
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* MESSAGE */
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartChatBox;
