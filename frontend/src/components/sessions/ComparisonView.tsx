import type { ComparisonResult } from "../../types/sessions";

type ComparisonViewProps = {
  result: ComparisonResult;
  onClose: () => void;
};

export default function ComparisonView({ result, onClose }: ComparisonViewProps) {
  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return '—';
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const formatTTK = (num: number | null) => {
    if (num === null || num === undefined) return '—';
    return num.toFixed(3); // Always show 3 decimal places for TTK
  };

  const formatPercentage = (num: number | null) => {
    if (num === null || num === undefined) return '—';
    return `${num.toFixed(1)}%`;
  };

  const DiffChip = ({ value, pct, metric }: { value: number; pct: number | null; metric: string }) => {
    // For TTK, lower is better; for others, higher is better
    const isImprovement = metric === 'ttk' ? value < 0 : value > 0;
    const color = isImprovement ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-theme-muted';
    const arrow = value > 0 ? '↑' : value < 0 ? '↓' : '→';
    
    // Format value based on metric type
    const formattedValue = metric === 'ttk' ? formatTTK(value) : formatNumber(value);

    return (
      <div className={`flex items-center gap-1 ${color} font-medium`}>
        <span className="text-2xl">{arrow}</span>
        <div className="flex flex-col items-start">
          <span>{value > 0 ? '+' : ''}{formattedValue}</span>
          {pct !== null && !isNaN(pct) && (
            <span className="text-xs opacity-75">
              ({pct > 0 ? '+' : ''}{formatPercentage(pct)})
            </span>
          )}
        </div>
      </div>
    );
  };

  const leftLabel = result.labels?.left || 'Left';
  const rightLabel = result.labels?.right || 'Right';

  return (
    <div className="bg-theme-secondary border border-theme-primary rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{leftLabel} vs {rightLabel}</h2>
          <p className="text-theme-muted text-sm mt-1">
            {leftLabel}: {result.meta.leftRunCount} runs • {rightLabel}: {result.meta.rightRunCount} runs
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-theme-tertiary hover:bg-theme-primary border border-theme-primary rounded-lg text-white transition-colors"
        >
          Close
        </button>
      </div>

      {/* Overall Comparison Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Overall Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Score Card */}
          <div className="bg-theme-tertiary border border-theme-secondary rounded-lg p-5">
            <p className="text-xs text-theme-muted uppercase font-semibold mb-3 text-center">Score</p>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-xs text-theme-muted mb-1">{leftLabel}</p>
                <p className="text-2xl font-bold text-blue-300 opacity-60">
                  {formatNumber(result.overall.left.avg_score)}
                </p>
              </div>
              <DiffChip 
                value={result.overall.diffs.score}
                pct={result.overall.diffs.scorePct}
                metric="score"
              />
              <div className="text-center">
                <p className="text-xs text-theme-muted mb-1">{rightLabel}</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatNumber(result.overall.right.avg_score)}
                </p>
              </div>
            </div>
            <div className="text-xs text-theme-muted text-center space-y-1">
              <div 
                title="Median (50th percentile) - half of your runs scored above this value"
                className="cursor-help underline decoration-dotted"
              >
                P50: {formatNumber(result.overall.left.score_p50)} / {formatNumber(result.overall.right.score_p50)}
              </div>
              <div 
                title="95th percentile - only 5% of your runs scored above this value"
                className="cursor-help underline decoration-dotted"
              >
                P95: {formatNumber(result.overall.left.score_p95)} / {formatNumber(result.overall.right.score_p95)}
              </div>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className="bg-theme-tertiary border border-theme-secondary rounded-lg p-5">
            <p className="text-xs text-theme-muted uppercase font-semibold mb-3 text-center">Accuracy</p>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-xs text-theme-muted mb-1">{leftLabel}</p>
                <p className="text-2xl font-bold text-green-300 opacity-60">
                  {formatPercentage(result.overall.left.avg_accuracy)}
                </p>
              </div>
              <DiffChip 
                value={result.overall.diffs.accuracy}
                pct={result.overall.diffs.accuracyPct}
                metric="accuracy"
              />
              <div className="text-center">
                <p className="text-xs text-theme-muted mb-1">{rightLabel}</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatPercentage(result.overall.right.avg_accuracy)}
                </p>
              </div>
            </div>
            <div className="text-xs text-theme-muted text-center space-y-1">
              <div 
                title="Median (50th percentile) - half of your runs had accuracy above this value"
                className="cursor-help underline decoration-dotted"
              >
                P50: {formatPercentage(result.overall.left.accuracy_p50)} / {formatPercentage(result.overall.right.accuracy_p50)}
              </div>
              <div 
                title="95th percentile - only 5% of your runs had accuracy above this value"
                className="cursor-help underline decoration-dotted"
              >
                P95: {formatPercentage(result.overall.left.accuracy_p95)} / {formatPercentage(result.overall.right.accuracy_p95)}
              </div>
            </div>
          </div>

          {/* TTK Card */}
          <div className="bg-theme-tertiary border border-theme-secondary rounded-lg p-5">
            <p className="text-xs text-theme-muted uppercase font-semibold mb-3 text-center">Avg TTK</p>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-xs text-theme-muted mb-1">{leftLabel}</p>
                <p className="text-2xl font-bold text-orange-300 opacity-60">
                  {formatTTK(result.overall.left.avg_ttk)}s
                </p>
              </div>
              <DiffChip 
                value={result.overall.diffs.ttk}
                pct={result.overall.diffs.ttkPct}
                metric="ttk"
              />
              <div className="text-center">
                <p className="text-xs text-theme-muted mb-1">{rightLabel}</p>
                <p className="text-2xl font-bold text-orange-400">
                  {formatTTK(result.overall.right.avg_ttk)}s
                </p>
              </div>
            </div>
            <div className="text-xs text-theme-muted text-center space-y-1">
              <div 
                title="Median (50th percentile) - half of your runs had TTK above this value"
                className="cursor-help underline decoration-dotted"
              >
                P50: {formatTTK(result.overall.left.ttk_p50)}s / {formatTTK(result.overall.right.ttk_p50)}s
              </div>
              <div 
                title="95th percentile - only 5% of your runs had TTK above this value (lower is better)"
                className="cursor-help underline decoration-dotted"
              >
                P95: {formatTTK(result.overall.left.ttk_p95)}s / {formatTTK(result.overall.right.ttk_p95)}s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task-Specific Comparison Section */}
      {result.meta.hasSharedTasks ? (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">
            Task-Specific Breakdown
            <span className="text-sm font-normal text-theme-muted ml-2">
              ({result.meta.sharedTaskCount} shared tasks)
            </span>
          </h3>
          <div className="space-y-3">
            {result.tasks.map((task) => (
              <div key={task.taskId} className="bg-theme-tertiary border border-theme-secondary rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">{task.taskName}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Score */}
                  <div>
                    <p className="text-xs text-theme-muted mb-2">Score</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-300 opacity-60 font-medium text-lg">
                        {formatNumber(task.left.avgScore)}
                      </span>
                      <span className="text-theme-muted">→</span>
                      <span className="text-blue-400 font-bold text-lg">
                        {formatNumber(task.right.avgScore)}
                      </span>
                    </div>
                    <div className={`text-sm font-medium flex items-center gap-1 ${
                      task.diff.score > 0 ? 'text-green-400' : 
                      task.diff.score < 0 ? 'text-red-400' : 'text-theme-muted'
                    }`}>
                      <span>{task.diff.score > 0 ? '↑' : task.diff.score < 0 ? '↓' : '→'}</span>
                      <span>{task.diff.score > 0 ? '+' : ''}{formatNumber(task.diff.score)}</span>
                    </div>
                  </div>

                  {/* Accuracy */}
                  <div>
                    <p className="text-xs text-theme-muted mb-2">Accuracy</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-300 opacity-60 font-medium text-lg">
                        {formatPercentage(task.left.avgAccuracy)}
                      </span>
                      <span className="text-theme-muted">→</span>
                      <span className="text-green-400 font-bold text-lg">
                        {formatPercentage(task.right.avgAccuracy)}
                      </span>
                    </div>
                    <div className={`text-sm font-medium flex items-center gap-1 ${
                      task.diff.accuracy > 0 ? 'text-green-400' : 
                      task.diff.accuracy < 0 ? 'text-red-400' : 'text-theme-muted'
                    }`}>
                      <span>{task.diff.accuracy > 0 ? '↑' : task.diff.accuracy < 0 ? '↓' : '→'}</span>
                      <span>{task.diff.accuracy > 0 ? '+' : ''}{formatPercentage(task.diff.accuracy)}</span>
                    </div>
                  </div>

                  {/* TTK */}
                  <div>
                    <p className="text-xs text-theme-muted mb-2">Avg TTK</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-orange-300 opacity-60 font-medium text-lg">
                        {formatTTK(task.left.avgTtk)}s
                      </span>
                      <span className="text-theme-muted">→</span>
                      <span className="text-orange-400 font-bold text-lg">
                        {formatTTK(task.right.avgTtk)}s
                      </span>
                    </div>
                    <div className={`text-sm font-medium flex items-center gap-1 ${
                      task.diff.ttk < 0 ? 'text-green-400' : 
                      task.diff.ttk > 0 ? 'text-red-400' : 'text-theme-muted'
                    }`}>
                      <span>{task.diff.ttk < 0 ? '↓' : task.diff.ttk > 0 ? '↑' : '→'}</span>
                      <span>{task.diff.ttk > 0 ? '+' : ''}{formatTTK(task.diff.ttk)}s</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-theme-tertiary border border-theme-secondary rounded-lg p-8 text-center">
          <p className="text-theme-muted">
            No shared tasks between the two windows.
          </p>
          <p className="text-sm text-theme-muted mt-2">
            Overall statistics are still available above.
          </p>
        </div>
      )}
    </div>
  );
}
