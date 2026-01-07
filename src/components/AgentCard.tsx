import { AgentCatalogItem, AgentStatus } from "@/hooks/useAgents";

interface AgentCardProps {
    agent: AgentCatalogItem;
    status?: AgentStatus;
    progress?: number;
    onDeploy: () => void;
    onSelect?: () => void;
    isActive?: boolean;
}

const AgentCard = ({
    agent,
    status = "idle",
    progress = 0,
    onDeploy,
    onSelect,
    isActive = false,
}: AgentCardProps) => {
    const statusColors: Record<AgentStatus, string> = {
        idle: "bg-muted-foreground",
        running: "bg-primary animate-pulse",
        paused: "bg-yellow-400",
        completed: "bg-green-400",
        error: "bg-red-400",
    };

    const statusLabels: Record<AgentStatus, string> = {
        idle: "Idle",
        running: "Running",
        paused: "Paused",
        completed: "Done",
        error: "Error",
    };

    return (
        <div
            onClick={onSelect}
            className={`
        relative p-4 rounded-xl border transition-all cursor-pointer
        ${isActive
                    ? "border-primary bg-primary/10 neon-border"
                    : "border-border bg-secondary hover:border-primary/50 hover:bg-secondary/80"
                }
      `}
        >
            {/* FREE Badge */}
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                FREE
            </div>

            {/* Status Indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                <span className="text-xs text-muted-foreground">{statusLabels[status]}</span>
            </div>

            {/* Icon & Name */}
            <div className="flex items-center gap-3 mt-4 mb-3">
                <div className="text-3xl">{agent.icon}</div>
                <div>
                    <h3 className="font-semibold text-foreground">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{agent.description}</p>
                </div>
            </div>

            {/* Capabilities */}
            <div className="space-y-1 mb-3">
                {agent.capabilities.slice(0, 3).map((cap, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-primary">✓</span>
                        {cap}
                    </div>
                ))}
                {agent.capabilities.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                        +{agent.capabilities.length - 3} more
                    </div>
                )}
            </div>

            {/* Progress Bar (when running) */}
            {status === "running" && (
                <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-primary font-mono">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-cyber-blue transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Deploy Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDeploy();
                }}
                disabled={status === "running"}
                className={`
          w-full py-2 px-4 rounded-lg font-medium text-sm transition-all
          ${status === "running"
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                    }
        `}
            >
                {status === "running" ? "Running..." : status === "completed" ? "Run Again" : "🚀 Deploy"}
            </button>
        </div>
    );
};

export default AgentCard;
