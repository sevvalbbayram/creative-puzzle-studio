import QRCode from "react-qr-code";

interface JoinQRCodeProps {
  /** Full URL to open to join the game (e.g. https://example.com/?code=ABC123) */
  value: string;
  /** Optional label below the QR (e.g. "Scan to join") */
  label?: string;
  /** Size in pixels; default 160 for mobile-friendly scan */
  size?: number;
  className?: string;
}

/**
 * QR code for the join link so students can scan to open the game and enter the code.
 * Rendered with a light background (quiet zone) for reliable scanning.
 */
export function JoinQRCode({ value, label = "Scan to join", size = 160, className = "" }: JoinQRCodeProps) {
  if (!value) return null;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className="inline-flex items-center justify-center rounded-xl bg-white p-3 shadow-md"
        aria-hidden
      >
        <QRCode
          value={value}
          size={size}
          level="M"
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          viewBox={`0 0 ${size} ${size}`}
        />
      </div>
      {label && (
        <p className="text-center text-xs font-medium text-muted-foreground">
          {label}
        </p>
      )}
    </div>
  );
}
