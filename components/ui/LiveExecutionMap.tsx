import React from 'react';

export type NodeStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface TaskNode {
  id: string;
  title: string;
  status: NodeStatus;
  entropy?: number; // Entropy score or similar metric to determine uncertainty
  errorMessage?: string;
  memoryAction?: string;
  toolExecutions?: any[];
}

export interface LiveExecutionMapProps {
  tasks: TaskNode[];
}

export const LiveExecutionMap: React.FC<LiveExecutionMapProps> = ({ tasks }) => {
  return (
    <div className="flex flex-col space-y-4 p-4">
      {tasks.map((task) => {
        let statusStyles = '';

        switch (task.status) {
          case 'PENDING':
            statusStyles = 'opacity-50 grayscale';
            break;
          case 'ACTIVE':
            statusStyles = 'animate-pulse ring-2 ring-indigo-500';
            break;
          case 'COMPLETED':
            statusStyles = 'opacity-100 shadow-[0_0_15px_rgba(79,70,229,0.8)]';
            break;
          case 'FAILED':
            statusStyles = 'opacity-100 ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]';
            break;
          default:
            statusStyles = 'opacity-50 grayscale';
            break;
        }

        const isHighEntropy = task.entropy && task.entropy > 0.8; // Example threshold
        const showHumanHandoff = task.status === 'FAILED' && isHighEntropy;

        return (
          <div
            key={task.id}
            className={`rounded-lg border p-4 transition-all duration-300 ${statusStyles}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <span className="text-sm font-medium uppercase tracking-wider text-gray-500">
                {task.status}
              </span>
            </div>

            {task.memoryAction && (
                <div className="mt-2 text-xs font-mono text-indigo-400">
                    [Graphiti Arbiter]: Memory Action - {task.memoryAction}
                </div>
            )}

            {task.toolExecutions && task.toolExecutions.length > 0 && (
                <div className="mt-2 text-xs font-mono text-green-400">
                    [FastMCP]: Tools Executed: {task.toolExecutions.map(t => t.name).join(', ')}
                </div>
            )}

            {showHumanHandoff && (
              <div className="mt-4 rounded bg-red-50 p-4 border border-red-200">
                <h4 className="text-sm font-bold text-red-800">Human Handoff Required</h4>
                <p className="mt-2 text-sm text-red-700">
                  I encountered high code uncertainty while trying to resolve this issue automatically.
                  Please provide manual guidance on how to proceed: {task.errorMessage || 'Unknown error.'}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
