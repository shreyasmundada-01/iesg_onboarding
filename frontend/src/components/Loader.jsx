/**
 * components/Loader.jsx
 * ----------------------
 * Reusable loading indicator. Two variants:
 *  - "spinner" (default): full-area or inline Ant spinner, used for
 *    auth bootstrap / route guards where there's no layout to preview.
 *  - "skeleton": content-shaped placeholder blocks, used inside pages
 *    that know their eventual layout (e.g. stat cards, table rows) so
 *    the screen doesn't jump when real data arrives.
 */

import { Spin, Skeleton } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function Loader({ tip = "Loading...", fullScreen = true, variant = "spinner", rows = 4 }) {
  if (variant === "skeleton") {
    return (
      <div className="eport-card" style={{ padding: 24 }}>
        <Skeleton active title={{ width: "30%" }} paragraph={{ rows }} />
      </div>
    );
  }

  const antIcon = <LoadingOutlined style={{ fontSize: 32, color: "var(--eport-primary)" }} spin />;

  const style = fullScreen
    ? {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
        gap: 12,
      }
    : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 0",
        gap: 12,
      };

  return (
    <div style={style}>
      <Spin indicator={antIcon} />
      <span style={{ color: "var(--eport-text-tertiary)", fontSize: 13 }}>{tip}</span>
    </div>
  );
}
