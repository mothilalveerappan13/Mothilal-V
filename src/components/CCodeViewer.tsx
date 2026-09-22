import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Archive,
  Loader2,
} from 'lucide-react';
import { C_CODE_SOURCE } from '../data/cCodeSource';
import { exportProjectAsZip } from '../utils/zipExporter';

export const CCodeViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(C_CODE_SOURCE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([C_CODE_SOURCE], { type: 'text/x-csrc;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory_system.c';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      await exportProjectAsZip();
    } catch (err) {
      console.error('Failed to generate ZIP', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-zinc-900 text-white">
                <Code2 className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-zinc-900">
                Complete C Language Implementation (Hash Table + Doubly Linked List)
              </h2>
            </div>
            <p className="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
              Standalone, production-grade ANSI/C99 code implementing separate chaining hash table with DJB2 rolling hash algorithm, combined with a bidirectional Doubly Linked List for sequential traversal and O(1) pointer updates in Indian Rupees (₹).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-c-code"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Copy C Code</span>
                </>
              )}
            </button>

            <button
              id="btn-download-c-code"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-600" />
              <span>Download inventory_system.c</span>
            </button>

            <button
              id="btn-download-full-project-zip"
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Packaging ZIP...</span>
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5" />
                  <span>Download Full Project (.ZIP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* How to Compile & Run */}
      <div className="bg-zinc-900 text-white rounded-lg p-5 border border-zinc-800 space-y-3 font-mono text-xs shadow-xs">
        <div className="flex items-center gap-2 text-zinc-300 font-bold">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>How to Compile & Run (GCC / Clang):</span>
        </div>
        <div className="bg-black/50 p-3 rounded border border-zinc-800 text-zinc-200 space-y-1 text-[11px]">
          <div className="text-zinc-400"># 1. Compile with GCC:</div>
          <div className="text-emerald-400">gcc -O2 -Wall inventory_system.c -o inventory_system</div>
          <div className="text-zinc-400 pt-1"># 2. Execute binary:</div>
          <div className="text-emerald-400">./inventory_system</div>
        </div>
      </div>

      {/* Code Display Card */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs text-zinc-600 font-mono">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-zinc-500" />
            <span className="font-semibold text-zinc-800">inventory_system.c</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700">ANSI C / C99</span>
          </div>
          <span className="text-zinc-400 text-[11px]">~400 lines &bull; Clean malloc/free cleanup</span>
        </div>

        <div className="p-4 bg-zinc-950 overflow-x-auto text-[12px] leading-relaxed font-mono text-zinc-200 selection:bg-zinc-700 selection:text-white max-h-[600px] overflow-y-auto">
          <pre>{C_CODE_SOURCE}</pre>
        </div>
      </div>
    </div>
  );
};
