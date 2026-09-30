import React from "react";

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

/**
 * Isi bubble laporan (judul, daftar statistik, grup peringkat) di
 * SmartChatLayarPenuh.
 */
export const ChatReportBody: React.FC<{ report: ChatReport }> = ({ report }) => (
  <>
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

    {/* STAT LIST — daftar rata, bukan kartu di dalam kartu.
        Bubble sendiri sudah berfungsi sebagai "card"; baris di
        dalamnya cukup dipisah garis tipis, tanpa background/border
        sendiri-sendiri, supaya tidak berasa sempit di layar kecil. */}
    {report.stats && (
      <div
        style={{
          marginBottom: report.groups ? 10 : 0,
        }}
      >
        {report.stats.map((stat, i) => (
          <div
            key={i}
            className="d-flex align-items-center justify-content-between gap-2"
            style={{
              padding: "8px 0",
              borderBottom:
                i < report.stats!.length - 1
                  ? "1px solid var(--color-gray-200)"
                  : "none",
            }}
          >
            <div
              className="d-flex align-items-center gap-2"
              style={{ minWidth: 0 }}
            >
              {stat.icon && (
                <div
                  style={{
                    color: "var(--color-green)",
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </div>
              )}

              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-gray-500)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {stat.label}
              </span>
            </div>

            <div
              style={{
                fontSize: "0.92rem",
                fontWeight: 700,
                color: "var(--color-dark)",
                whiteSpace: "nowrap",
                flexShrink: 0,
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
                marginBottom: 4,
              }}
            >
              {group.icon}
              <span>{group.heading}</span>
            </div>

            <div>
              {group.items.map((item, ii) => (
                <div
                  key={ii}
                  className="d-flex align-items-center justify-content-between gap-2"
                  style={{
                    padding: "7px 0",
                    borderBottom:
                      ii < group.items.length - 1
                        ? "1px solid var(--color-gray-200)"
                        : "none",
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
  </>
);
