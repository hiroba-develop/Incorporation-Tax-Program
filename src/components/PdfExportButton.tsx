import { useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { DetailFormInputs, SimulationResult } from "../types/simulation";
import PdfDocument from "./PdfDocument";

interface PdfExportButtonProps {
  result: SimulationResult;
  inputs: DetailFormInputs;
}

async function buildPdf(result: SimulationResult, inputs: DetailFormInputs): Promise<jsPDF> {
  const container = document.createElement("div");
  container.style.cssText = [
    "position:fixed",
    "top:-9999px",
    "left:-9999px",
    "width:794px",
    "background:#ffffff",
    "z-index:-1",
  ].join(";");
  document.body.appendChild(container);

  const root = createRoot(container);
  try {
    await new Promise<void>((resolve) => {
      root.render(<PdfDocument result={result} inputs={inputs} />);
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: 794,
      windowWidth: 794,
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const contentW = pageW;
    const pxToMm = contentW / canvas.width;

    const breakEls = Array.from(container.querySelectorAll<HTMLElement>("[data-pdf-pagebreak]"));
    const breakPxList = breakEls.map((el) => el.offsetTop * 2);

    const splitPoints = [0, ...breakPxList, canvas.height];
    const segments: Array<{ startPx: number; endPx: number }> = [];

    for (let i = 0; i < splitPoints.length - 1; i++) {
      let segStart = splitPoints[i];
      const segEnd = splitPoints[i + 1];
      while (segStart < segEnd) {
        const maxPx = Math.round(pageH / pxToMm);
        const end = Math.min(segStart + maxPx, segEnd);
        segments.push({ startPx: segStart, endPx: end });
        segStart = end;
      }
    }

    segments.forEach(({ startPx, endPx }, idx) => {
      const sliceH = endPx - startPx;
      if (sliceH <= 0) return;
      const sc = document.createElement("canvas");
      sc.width = canvas.width;
      sc.height = sliceH;
      const ctx = sc.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, sc.width, sc.height);
        ctx.drawImage(canvas, 0, startPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      }
      if (idx > 0) pdf.addPage();
      pdf.addImage(sc.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, contentW, sliceH * pxToMm);
    });

    return pdf;
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

interface PreviewModalProps {
  blobUrl: string;
  fileName: string;
  onDownload: () => void;
  onClose: () => void;
}

function PreviewModal({ blobUrl, fileName, onDownload, onClose }: PreviewModalProps) {
  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        position: "absolute",
        inset: "24px",
        backgroundColor: "#1e293b",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
      }}>
        {/* ツールバー */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          backgroundColor: "#0f172a",
          borderBottom: "1px solid #334155",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600 }}>{fileName}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onDownload}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                backgroundColor: "#2563eb", color: "#fff",
                border: "none", borderRadius: 8,
                padding: "8px 16px", fontSize: 13, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              保存
            </button>
            <button
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                backgroundColor: "#475569", color: "#fff",
                border: "none", borderRadius: 8,
                padding: "8px 14px", fontSize: 13, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              閉じる
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <iframe
          src={blobUrl}
          style={{ flex: 1, border: "none", backgroundColor: "#525659" }}
          title="PDFプレビュー"
        />
      </div>
    </div>,
    document.body
  );
}

export default function PdfExportButton({ result, inputs }: PdfExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<{ blobUrl: string; fileName: string; pdf: jsPDF } | null>(null);

  const fileName = `法人化シミュレーション_${new Date().toISOString().slice(0, 10)}.pdf`;

  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      const pdf = await buildPdf(result, inputs);
      const blob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      setPreview({ blobUrl, fileName, pdf });
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!preview) return;
    preview.pdf.save(preview.fileName);
  };

  const handleClose = () => {
    if (preview) {
      URL.revokeObjectURL(preview.blobUrl);
      setPreview(null);
    }
  };

  return (
    <>
      <button
        onClick={handlePreview}
        disabled={isGenerating}
        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        {isGenerating ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>生成中...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>PDF出力</span>
          </>
        )}
      </button>

      {preview && (
        <PreviewModal
          blobUrl={preview.blobUrl}
          fileName={preview.fileName}
          onDownload={handleDownload}
          onClose={handleClose}
        />
      )}
    </>
  );
}
