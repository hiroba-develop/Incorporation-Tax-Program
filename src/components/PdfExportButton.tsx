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
    const title = `法人化シミュレーション_${new Date().toISOString().slice(0, 10)}`;
    pdf.setProperties({ title });

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
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2} style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {fileName}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">保存</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 sm:gap-2 bg-slate-600 hover:bg-slate-700 text-white border-0 rounded-lg px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">閉じる</span>
            </button>
          </div>
        </div>

        {/* 注意書きバー */}
        <div style={{
          backgroundColor: "#1e3a5f",
          borderBottom: "1px solid #2563eb",
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" strokeWidth={2} style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ color: "#93c5fd", fontSize: 11 }}>
            ビューア内のダウンロードボタンはファイル名が文字化けします。上の
            <strong style={{ color: "#bfdbfe" }}>「保存」</strong>
            ボタンをご利用ください。
          </span>
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
        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white px-2 py-2 sm:px-4 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
        title="PDF出力"
      >
        {isGenerating ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="sm:hidden">...</span>
            <span className="hidden sm:inline">生成中...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">PDF出力</span>
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
