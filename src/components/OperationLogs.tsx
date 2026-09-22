import React, { useState } from 'react';
import {
  History,
  Terminal,
  Trash2,
  Filter,
  CheckCircle2,
  Search,
  PlusCircle,
  XCircle,
  ArrowLeftRight,
  Clock,
} from 'lucide-react';
import { OperationLog } from '../types';

interface OperationLogsProps {
  logs: OperationLog[];
  onClearLogs: () => void;
}

export const OperationLogs: React.FC<OperationLogsProps> = ({
  logs,
  onClearLogs,
}) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  const getActionBadge = (action: OperationLog['action']) => {
    switch (action) {
      case 'INSERT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
            <PlusCircle className="w-3 h-3" /> INSERT
          </span>
        );
      case 'LOOKUP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
            <Search className="w-3 h-3" /> LOOKUP
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" /> DELETE
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
            <CheckCircle2 className="w-3 h-3" /> UPDATE
          </span>
        );
      case 'REORDER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
            <ArrowLeftRight className="w-3 h-3" /> REORDER
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Filter and Clear */}
      <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-700" />
          <h2 className="text-sm font-bold text-zinc-900">
            Algorithm Execution Tracer & Data Structure Logs
          </h2>
          <span className="text-xs text-zinc-400">({logs.length} operations)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs">
            <Filter className="w-3 h-3 text-zinc-500" />
            <select
              id="select-log-filter"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              aria-label="Filter execution logs by action"
              className="bg-transparent border-none text-zinc-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Operations</option>
              <option value="INSERT">INSERT</option>
              <option value="LOOKUP">LOOKUP</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="REORDER">REORDER</option>
            </select>
          </div>

          <button
            id="btn-clear-logs"
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-xs">
            No operations logged yet. Perform a search, add a product, or adjust stock to see real-time algorithm execution traces.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                id={`log-entry-${log.id}`}
                className="p-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getActionBadge(log.action)}
                    <span className="font-mono font-bold text-xs text-zinc-900">
                      [{log.sku}]
                    </span>
                    <span className="text-xs font-medium text-zinc-800">
                      {log.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-zinc-900 text-white">
                      {log.timeComplexity}
                    </span>
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  {log.details}
                </p>

                {log.hashInfo && (
                  <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center flex-wrap gap-3 font-mono text-[11px] text-zinc-500">
                    <span>
                      Raw Hash: <strong className="text-zinc-800">{log.hashInfo.computedHash.toLocaleString()}</strong>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Bucket Index:{' '}
                      <strong className="text-zinc-800">#{log.hashInfo.bucketIndex}</strong>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Chain Depth Examined:{' '}
                      <strong className="text-zinc-800">{log.hashInfo.chainDepth}</strong>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Table Size: <strong className="text-zinc-800">{log.hashInfo.tableSize}</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
