import { useState } from "react";
import { X, Play, Pause, Square, ChevronLeft, Copy, Check, FileText, Terminal, ListTodo, ScrollText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentType, AGENT_CATALOG, Agent } from "@/hooks/useAgents";
import AgentCard from "./AgentCard";
import LiveTerminal from "./LiveTerminal";
import { Button } from "@/components/ui/button";

type AgentTab = "preview" | "plan" | "terminal" | "log";

interface AgentPanelProps {
    isOpen: boolean;
    onClose: () => void;
    agents: Agent[];
    activeAgentId: string | null;
    onSelectAgent: (id: string) => void;
    onDeploy: (type: AgentType, target: string) => void;
    onPause: (id: string) => void;
    onResume: (id: string) => void;
    onStop: (id: string) => void;
}

const AgentPanel = ({
    isOpen,
    onClose,
    agents,
    activeAgentId,
    onSelectAgent,
    onDeploy,
    onPause,
    onResume,
    onStop,
}: AgentPanelProps) => {
    const [selectedType, setSelectedType] = useState<AgentType | null>(null);
    const [target, setTarget] = useState("");
    const [activeTab, setActiveTab] = useState<AgentTab>("terminal");
    const [config, setConfig] = useState({
        rate: "normal" as "normal" | "fast" | "aggressive",
        stealth: false,
    });

    const activeAgent = agents.find((a) => a.id === activeAgentId);
    const selectedCatalogItem = AGENT_CATALOG.find((a) => a.type === selectedType);

    const handleDeploy = () => {
        if (selectedType && target.trim()) {
            onDeploy(selectedType, target.trim());
            setTarget("");
            setSelectedType(null);
            setActiveTab("terminal");
        }
    };

    const getAgentStatus = (type: AgentType) => {
        const agent = agents.find((a) => a.type === type);
        return agent?.status || "idle";
    };

    const getAgentProgress = (type: AgentType) => {
        const agent = agents.find((a) => a.type === type);
        return agent?.progress || 0;
    };

    const tabs: { id: AgentTab; label: string; icon: React.ReactNode }[] = [
        { id: "preview", label: "Preview", icon: <FileText className="w-4 h-4" /> },
        { id: "plan", label: "Plan", icon: <ListTodo className="w-4 h-4" /> },
        { id: "terminal", label: "Terminal", icon: <Terminal className="w-4 h-4" /> },
        { id: "log", label: "Log", icon: <ScrollText className="w-4 h-4" /> },
    ];

    // Generate plan steps based on agent type
    const getPlanSteps = (agent: Agent) => {
        const plans: Record<AgentType, string[]> = {
            web_scanner: [
                "✅ Initialize scanner",
                "✅ Load payload database (500+ vectors)",
                `${agent.progress >= 30 ? "✅" : agent.progress >= 10 ? "🔄" : "⬜"} Phase 1: Reconnaissance (nmap, headers)`,
                `${agent.progress >= 50 ? "✅" : agent.progress >= 30 ? "🔄" : "⬜"} Phase 2: Directory enumeration`,
                `${agent.progress >= 80 ? "✅" : agent.progress >= 50 ? "🔄" : "⬜"} Phase 3: Vulnerability scanning`,
                `${agent.progress >= 100 ? "✅" : agent.progress >= 80 ? "🔄" : "⬜"} Phase 4: Generate PoCs`,
                `${agent.progress >= 100 ? "✅" : "⬜"} Phase 5: Create report`,
            ],
            binary_reverser: [
                "✅ Load binary into analyzer",
                `${agent.progress >= 30 ? "✅" : agent.progress >= 10 ? "🔄" : "⬜"} Phase 1: Static analysis`,
                `${agent.progress >= 50 ? "✅" : agent.progress >= 30 ? "🔄" : "⬜"} Phase 2: Import analysis`,
                `${agent.progress >= 80 ? "✅" : agent.progress >= 50 ? "🔄" : "⬜"} Phase 3: Behavior analysis`,
                `${agent.progress >= 100 ? "✅" : agent.progress >= 80 ? "🔄" : "⬜"} Phase 4: Extract shellcode`,
                `${agent.progress >= 100 ? "✅" : "⬜"} Phase 5: Generate verdict`,
            ],
            phishing_forge: [
                "✅ Initialize forge",
                `${agent.progress >= 30 ? "✅" : agent.progress >= 10 ? "🔄" : "⬜"} Phase 1: OSINT gathering`,
                `${agent.progress >= 60 ? "✅" : agent.progress >= 30 ? "🔄" : "⬜"} Phase 2: Template generation`,
                `${agent.progress >= 80 ? "✅" : agent.progress >= 60 ? "🔄" : "⬜"} Phase 3: Email template`,
                `${agent.progress >= 100 ? "✅" : agent.progress >= 80 ? "🔄" : "⬜"} Phase 4: Deployment`,
            ],
            custom_builder: [
                "✅ Load workflow engine",
                `${agent.progress >= 50 ? "✅" : agent.progress >= 20 ? "🔄" : "⬜"} Initialize nodes`,
                `${agent.progress >= 100 ? "✅" : agent.progress >= 50 ? "🔄" : "⬜"} Ready for interaction`,
            ],
        };
        return plans[agent.type] || [];
    };

    // Generate preview content
    const getPreviewContent = (agent: Agent) => {
        if (agent.status === "running") {
            return `🔄 Agent đang chạy...\n\nTarget: ${agent.target}\nProgress: ${agent.progress}%\nConfig: ${agent.config.rate} mode${agent.config.stealth ? " (stealth)" : ""}`;
        }
        if (agent.status === "completed") {
            const summaries: Record<AgentType, string> = {
                web_scanner: `✅ Scan hoàn tất!\n\n📊 Kết quả:\n- 4 lỗ hổng phát hiện\n- 1 Critical (SQLi)\n- 1 High (XSS)\n- 2 Medium (CSRF, Open Redirect)\n\n📁 Files:\n- xss_payload.html\n- sqli_payload.txt`,
                binary_reverser: `✅ Phân tích hoàn tất!\n\n🔍 Verdict: MALICIOUS\n📛 Family: Generic RAT\n\n📊 Phát hiện:\n- C2 Server: c2.malware.com:4444\n- Persistence: Registry Run key\n- Injection: Process injection\n\n📁 Files:\n- shellcode.bin (1,247 bytes)`,
                phishing_forge: `✅ Campaign ready!\n\n📧 Email template created\n🌐 Landing page cloned\n🔗 Hosted on: secure-verify.onion\n\n📁 Files:\n- phishing_email.html\n- login_clone.html\n- harvester.php`,
                custom_builder: `✅ Builder ready!\n\n🔧 Workflow engine loaded\n📦 All agents available\n🔗 Chaining enabled`,
            };
            return summaries[agent.type] || "Completed";
        }
        return `⏸️ Agent paused\n\nProgress: ${agent.progress}%`;
    };

    // Generate log entries
    const getLogEntries = (agent: Agent) => {
        const startTime = agent.startTime?.toLocaleTimeString() || "N/A";
        const logs = [
            `[${startTime}] Agent ${agent.name} started`,
            `[${startTime}] Target: ${agent.target}`,
            `[${startTime}] Config: rate=${agent.config.rate}, stealth=${agent.config.stealth}`,
        ];

        if (agent.progress > 0) {
            logs.push(`[${startTime}] Progress: ${agent.progress}%`);
        }
        if (agent.status === "completed") {
            logs.push(`[${new Date().toLocaleTimeString()}] Agent completed successfully`);
        }
        if (agent.status === "paused") {
            logs.push(`[${new Date().toLocaleTimeString()}] Agent paused by user`);
        }

        return logs;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-card border-l border-border z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                {selectedType && (
                                    <button
                                        onClick={() => setSelectedType(null)}
                                        className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                )}
                                <div>
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        🚀 Agent Mode
                                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                                            v3.0
                                        </span>
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        {activeAgent
                                            ? `${activeAgent.icon} ${activeAgent.name} → ${activeAgent.target}`
                                            : selectedType
                                                ? selectedCatalogItem?.name
                                                : "Select an agent to deploy"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {!selectedType && !activeAgent ? (
                                /* Agent Grid */
                                <div className="p-4 grid grid-cols-2 gap-4">
                                    {AGENT_CATALOG.map((agent) => (
                                        <AgentCard
                                            key={agent.type}
                                            agent={agent}
                                            status={getAgentStatus(agent.type)}
                                            progress={getAgentProgress(agent.type)}
                                            onDeploy={() => setSelectedType(agent.type)}
                                            onSelect={() => {
                                                const existingAgent = agents.find(
                                                    (a) => a.type === agent.type
                                                );
                                                if (existingAgent) {
                                                    onSelectAgent(existingAgent.id);
                                                } else {
                                                    setSelectedType(agent.type);
                                                }
                                            }}
                                            isActive={
                                                agents.some((a) => a.type === agent.type && a.status === "running")
                                            }
                                        />
                                    ))}
                                </div>
                            ) : selectedType && !activeAgent ? (
                                /* Deploy Form */
                                <div className="p-4 space-y-6">
                                    {/* Agent Info */}
                                    <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                                        <div className="text-4xl">{selectedCatalogItem?.icon}</div>
                                        <div>
                                            <h3 className="font-bold text-lg">{selectedCatalogItem?.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedCatalogItem?.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Target Input */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Target
                                        </label>
                                        <input
                                            type="text"
                                            value={target}
                                            onChange={(e) => setTarget(e.target.value)}
                                            placeholder={
                                                selectedType === "web_scanner"
                                                    ? "https://target.com"
                                                    : selectedType === "binary_reverser"
                                                        ? "./malware.exe"
                                                        : selectedType === "phishing_forge"
                                                            ? "Company Name"
                                                            : "Workflow name"
                                            }
                                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                                            onKeyDown={(e) => e.key === "Enter" && handleDeploy()}
                                        />
                                    </div>

                                    {/* Config Options */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Scan Rate
                                            </label>
                                            <div className="flex gap-2">
                                                {(["normal", "fast", "aggressive"] as const).map((rate) => (
                                                    <button
                                                        key={rate}
                                                        onClick={() => setConfig({ ...config, rate })}
                                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${config.rate === rate
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-secondary hover:bg-muted"
                                                            }`}
                                                    >
                                                        {rate.charAt(0).toUpperCase() + rate.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                            <div>
                                                <div className="font-medium text-sm">Stealth Mode</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Slower but less detectable
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    setConfig({ ...config, stealth: !config.stealth })
                                                }
                                                className={`w-12 h-6 rounded-full transition-all ${config.stealth ? "bg-primary" : "bg-muted"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded-full bg-white transition-all ${config.stealth ? "translate-x-6" : "translate-x-0.5"
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Deploy Button */}
                                    <Button
                                        onClick={handleDeploy}
                                        disabled={!target.trim()}
                                        className="w-full py-6 text-lg font-bold"
                                    >
                                        🚀 Deploy {selectedCatalogItem?.name}
                                    </Button>
                                </div>
                            ) : activeAgent ? (
                                /* Active Agent View with Tabs */
                                <div className="flex flex-col h-full">
                                    {/* Agent Header */}
                                    <div className="p-4 border-b border-border">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onSelectAgent("")}
                                                    className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <span className="text-2xl">{activeAgent.icon}</span>
                                                <div>
                                                    <span className="font-medium">{activeAgent.name}</span>
                                                    <div className="text-xs text-muted-foreground">
                                                        {activeAgent.target}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {activeAgent.status === "running" ? (
                                                    <button
                                                        onClick={() => onPause(activeAgent.id)}
                                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                        title="Pause"
                                                    >
                                                        <Pause className="w-4 h-4" />
                                                    </button>
                                                ) : activeAgent.status === "paused" ? (
                                                    <button
                                                        onClick={() => onResume(activeAgent.id)}
                                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                        title="Resume"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                ) : null}
                                                {activeAgent.status !== "completed" && (
                                                    <button
                                                        onClick={() => onStop(activeAgent.id)}
                                                        className="p-2 hover:bg-muted rounded-lg transition-colors text-red-400"
                                                        title="Stop"
                                                    >
                                                        <Square className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <span className={`w-2 h-2 rounded-full ${activeAgent.status === "running" ? "bg-primary animate-pulse" :
                                                        activeAgent.status === "completed" ? "bg-green-400" :
                                                            activeAgent.status === "paused" ? "bg-yellow-400" : "bg-muted"
                                                        }`} />
                                                    {activeAgent.status.charAt(0).toUpperCase() + activeAgent.status.slice(1)}
                                                </span>
                                                <span className="text-primary font-mono font-bold">
                                                    {activeAgent.progress}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${activeAgent.progress}%` }}
                                                    className="h-full bg-gradient-to-r from-primary to-cyan-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Tabs */}
                                        <div className="flex gap-1 bg-secondary p-1 rounded-lg">
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                                        ? "bg-background text-foreground shadow-sm"
                                                        : "text-muted-foreground hover:text-foreground"
                                                        }`}
                                                >
                                                    {tab.icon}
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="flex-1 overflow-y-auto p-4">
                                        {activeTab === "preview" && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-secondary rounded-xl font-mono text-sm whitespace-pre-wrap">
                                                    {getPreviewContent(activeAgent)}
                                                </div>
                                                {activeAgent.status === "completed" && (
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" className="flex-1 gap-2">
                                                            <Copy className="w-4 h-4" />
                                                            Copy Report
                                                        </Button>
                                                        <Button className="flex-1 gap-2">
                                                            📥 Download Files
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === "plan" && (
                                            <div className="space-y-2">
                                                {getPlanSteps(activeAgent).map((step, i) => (
                                                    <div
                                                        key={i}
                                                        className={`p-3 rounded-lg border ${step.startsWith("✅")
                                                            ? "border-green-500/30 bg-green-500/10"
                                                            : step.startsWith("🔄")
                                                                ? "border-primary/30 bg-primary/10 animate-pulse"
                                                                : "border-border bg-secondary"
                                                            }`}
                                                    >
                                                        <span className="font-mono text-sm">{step}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {activeTab === "terminal" && (
                                            <LiveTerminal
                                                output={activeAgent.output}
                                                title={`${activeAgent.icon} ${activeAgent.name}`}
                                                className="h-full"
                                            />
                                        )}

                                        {activeTab === "log" && (
                                            <div className="space-y-1 font-mono text-xs">
                                                {getLogEntries(activeAgent).map((log, i) => (
                                                    <div
                                                        key={i}
                                                        className="p-2 bg-secondary rounded border-l-2 border-muted hover:border-primary transition-colors"
                                                    >
                                                        {log}
                                                    </div>
                                                ))}
                                                {activeAgent.output.slice(-5).filter(Boolean).map((line, i) => (
                                                    <div
                                                        key={`output-${i}`}
                                                        className={`p-2 bg-secondary rounded border-l-2 ${line?.startsWith("[+]") ? "border-green-500" :
                                                            line?.startsWith("[!]") ? "border-red-500" :
                                                                line?.startsWith("[*]") ? "border-blue-500" :
                                                                    "border-muted"
                                                            }`}
                                                    >
                                                        {line || "\u00A0"}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border bg-secondary/50">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                    {agents.filter((a) => a.status === "running").length} agent(s) running
                                </span>
                                <span className="text-primary font-medium">All agents FREE</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AgentPanel;
