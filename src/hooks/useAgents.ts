import { useState, useCallback, useRef } from "react";

export type AgentType = "web_scanner" | "binary_reverser" | "phishing_forge" | "custom_builder";
export type AgentStatus = "idle" | "running" | "paused" | "completed" | "error";

export interface AgentConfig {
    rate: "normal" | "fast" | "aggressive";
    stealth: boolean;
    output: "terminal" | "file" | "both";
}

export interface Agent {
    id: string;
    type: AgentType;
    name: string;
    icon: string;
    description: string;
    capabilities: string[];
    status: AgentStatus;
    progress: number;
    target: string;
    output: string[];
    config: AgentConfig;
    startTime?: Date;
}

export interface AgentCatalogItem {
    type: AgentType;
    name: string;
    icon: string;
    description: string;
    capabilities: string[];
    targets: string[];
}

export const AGENT_CATALOG: AgentCatalogItem[] = [
    {
        type: "web_scanner",
        name: "Web Vuln Scanner",
        icon: "🕷️",
        description: "OWASP Top 10 vulnerability scanner with auto PoC generation",
        capabilities: [
            "OWASP Top 10 (A1-A10)",
            "500+ custom payloads",
            "Auto PoC generation",
            "WAF bypass chains",
            "Remediation templates",
        ],
        targets: ["HTTP/HTTPS", "API endpoints"],
    },
    {
        type: "binary_reverser",
        name: "Binary Reverser",
        icon: "🔬",
        description: "Static and dynamic binary analysis with decompiler",
        capabilities: [
            "Static analysis (strings, imports)",
            "Dynamic analysis (behavior)",
            "Decompiler (Ghidra integration)",
            "Shellcode extraction",
        ],
        targets: [".exe", ".elf", ".dll", "APKs"],
    },
    {
        type: "phishing_forge",
        name: "Phishing Forge",
        icon: "📧",
        description: "Advanced phishing template and payload generator",
        capabilities: [
            "Template generation",
            "Payload embedding",
            "Hosting (onion/tor)",
            "Credential harvesting",
        ],
        targets: ["Social engineering"],
    },
    {
        type: "custom_builder",
        name: "Custom Builder",
        icon: "⚙️",
        description: "Build custom workflows with drag-drop interface",
        capabilities: [
            "Drag-drop workflow builder",
            "Custom payloads",
            "Agent chaining",
            "Pro features unlocked",
        ],
        targets: ["Any target"],
    },
];

// Simulated terminal output for each agent type
const SIMULATED_OUTPUTS: Record<AgentType, (target: string) => string[]> = {
    web_scanner: (target) => [
        `[*] Initializing Web Vulnerability Scanner...`,
        `[*] Target: ${target}`,
        `[*] Loading 500+ payloads...`,
        `[+] Payloads loaded successfully`,
        ``,
        `[*] Phase 1: Reconnaissance`,
        `$ nmap -sV -sC ${target}`,
        `PORT     STATE SERVICE  VERSION`,
        `22/tcp   open  ssh      OpenSSH 8.4`,
        `80/tcp   open  http     nginx 1.18.0`,
        `443/tcp  open  ssl/http nginx 1.18.0`,
        `3306/tcp open  mysql    MySQL 8.0.26`,
        ``,
        `[*] Phase 2: Directory Enumeration`,
        `$ gobuster dir -u https://${target} -w common.txt`,
        `/admin          (Status: 302) [Size: 0]`,
        `/api            (Status: 200) [Size: 1234]`,
        `/login          (Status: 200) [Size: 2456]`,
        `/uploads        (Status: 403) [Size: 162]`,
        ``,
        `[*] Phase 3: Vulnerability Scanning`,
        `[!] XSS Detected: /search?q=<script>alert(1)</script>`,
        `[!] SQLi Detected: /api/users?id=1' OR '1'='1`,
        `[!] CSRF Token Missing: /admin/settings`,
        `[+] Open Redirect: /redirect?url=https://evil.com`,
        ``,
        `[*] Phase 4: Generating PoCs`,
        `[+] PoC saved: xss_payload.html`,
        `[+] PoC saved: sqli_payload.txt`,
        ``,
        `[✓] Scan complete!`,
        `[*] Summary: 4 vulnerabilities found`,
        `    - Critical: 1 (SQLi)`,
        `    - High: 1 (XSS)`,
        `    - Medium: 2 (CSRF, Open Redirect)`,
    ],
    binary_reverser: (target) => [
        `[*] Initializing Binary Reverser...`,
        `[*] Target: ${target}`,
        `[*] Loading analysis engines...`,
        ``,
        `[*] Phase 1: Static Analysis`,
        `$ file ${target}`,
        `PE32+ executable (console) x86-64, for MS Windows`,
        ``,
        `$ strings ${target} | head -20`,
        `!This program cannot be run in DOS mode`,
        `cmd.exe /c`,
        `powershell -enc`,
        `http://c2.malware.com:4444`,
        `HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`,
        ``,
        `[*] Phase 2: Import Analysis`,
        `[+] Suspicious imports detected:`,
        `    - kernel32.dll: VirtualAlloc, WriteProcessMemory`,
        `    - advapi32.dll: RegSetValueExA`,
        `    - ws2_32.dll: connect, send, recv`,
        ``,
        `[*] Phase 3: Behavior Analysis`,
        `[!] Persistence mechanism: Registry Run key`,
        `[!] C2 Communication: http://c2.malware.com:4444`,
        `[!] Process injection detected`,
        ``,
        `[*] Phase 4: Shellcode Extraction`,
        `[+] Extracted shellcode: 1,247 bytes`,
        `[+] Saved to: shellcode.bin`,
        ``,
        `[✓] Analysis complete!`,
        `[*] Verdict: MALICIOUS`,
        `[*] Family: Generic RAT`,
    ],
    phishing_forge: (target) => [
        `[*] Initializing Phishing Forge...`,
        `[*] Target Organization: ${target}`,
        `[*] Loading templates...`,
        ``,
        `[*] Phase 1: OSINT Gathering`,
        `[+] Found official website: ${target.toLowerCase().replace(/\s/g, '')}.com`,
        `[+] Extracted brand colors: #1a4f8c, #ffffff`,
        `[+] Downloaded logo and assets`,
        ``,
        `[*] Phase 2: Template Generation`,
        `[+] Creating login page clone...`,
        `[+] Injecting credential harvester...`,
        `[+] Adding SSL certificate...`,
        ``,
        `[*] Phase 3: Email Template`,
        `Subject: Important Security Update - Action Required`,
        `From: security@${target.toLowerCase().replace(/\s/g, '')}-verify.com`,
        ``,
        `[+] Email template saved: phishing_email.html`,
        `[+] Landing page saved: login_clone.html`,
        ``,
        `[*] Phase 4: Deployment`,
        `[+] Hosting on: https://secure-verify.onion`,
        `[+] Tracking pixel embedded`,
        `[+] Credential logger active`,
        ``,
        `[✓] Phishing campaign ready!`,
        `[*] Files generated:`,
        `    - phishing_email.html`,
        `    - login_clone.html`,
        `    - harvester.php`,
    ],
    custom_builder: (target) => [
        `[*] Initializing Custom Builder...`,
        `[*] Workflow: ${target}`,
        ``,
        `[*] Loading workflow engine...`,
        `[+] Drag-drop interface ready`,
        `[+] All agents available for chaining`,
        ``,
        `[*] Available Nodes:`,
        `    📥 Input: Target URL, File, IP`,
        `    🕷️ Web Scanner`,
        `    🔬 Binary Reverser`,
        `    📧 Phishing Forge`,
        `    📤 Output: Report, Terminal, File`,
        ``,
        `[*] Example Workflow:`,
        `    Target → Web Scanner → Binary Analyzer → Report`,
        ``,
        `[+] Builder interface opened`,
        `[*] Drag nodes to canvas to build workflow`,
        ``,
        `[✓] Custom Builder ready!`,
    ],
};

export const useAgents = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({});

    const getActiveAgent = useCallback(() => {
        return agents.find((a) => a.id === activeAgentId) || null;
    }, [agents, activeAgentId]);

    const deployAgent = useCallback(
        (type: AgentType, target: string, config: Partial<AgentConfig> = {}) => {
            const catalogItem = AGENT_CATALOG.find((a) => a.type === type);
            if (!catalogItem) return null;

            const newAgent: Agent = {
                id: crypto.randomUUID(),
                type,
                name: catalogItem.name,
                icon: catalogItem.icon,
                description: catalogItem.description,
                capabilities: catalogItem.capabilities,
                status: "running",
                progress: 0,
                target,
                output: [],
                config: {
                    rate: config.rate || "normal",
                    stealth: config.stealth ?? false,
                    output: config.output || "terminal",
                },
                startTime: new Date(),
            };

            setAgents((prev) => [...prev, newAgent]);
            setActiveAgentId(newAgent.id);
            setIsPanelOpen(true);

            // Simulate output
            const outputs = SIMULATED_OUTPUTS[type](target);
            let outputIndex = 0;
            const totalOutputs = outputs.length;

            const interval = setInterval(() => {
                if (outputIndex >= totalOutputs) {
                    clearInterval(interval);
                    delete intervalRefs.current[newAgent.id];
                    setAgents((prev) =>
                        prev.map((a) =>
                            a.id === newAgent.id
                                ? { ...a, status: "completed", progress: 100 }
                                : a
                        )
                    );
                    return;
                }

                setAgents((prev) =>
                    prev.map((a) =>
                        a.id === newAgent.id
                            ? {
                                ...a,
                                output: [...a.output, outputs[outputIndex]],
                                progress: Math.round(((outputIndex + 1) / totalOutputs) * 100),
                            }
                            : a
                    )
                );
                outputIndex++;
            }, 300);

            intervalRefs.current[newAgent.id] = interval;

            return newAgent;
        },
        []
    );

    const pauseAgent = useCallback((agentId: string) => {
        const interval = intervalRefs.current[agentId];
        if (interval) {
            clearInterval(interval);
            delete intervalRefs.current[agentId];
        }
        setAgents((prev) =>
            prev.map((a) => (a.id === agentId ? { ...a, status: "paused" } : a))
        );
    }, []);

    const resumeAgent = useCallback((agentId: string) => {
        // For simplicity, just mark as running (real impl would continue output)
        setAgents((prev) =>
            prev.map((a) => (a.id === agentId ? { ...a, status: "running" } : a))
        );
    }, []);

    const stopAgent = useCallback((agentId: string) => {
        const interval = intervalRefs.current[agentId];
        if (interval) {
            clearInterval(interval);
            delete intervalRefs.current[agentId];
        }
        setAgents((prev) =>
            prev.map((a) =>
                a.id === agentId
                    ? { ...a, status: "completed", output: [...a.output, "[!] Agent stopped by user"] }
                    : a
            )
        );
    }, []);

    const removeAgent = useCallback((agentId: string) => {
        const interval = intervalRefs.current[agentId];
        if (interval) {
            clearInterval(interval);
            delete intervalRefs.current[agentId];
        }
        setAgents((prev) => prev.filter((a) => a.id !== agentId));
        if (activeAgentId === agentId) {
            setActiveAgentId(null);
        }
    }, [activeAgentId]);

    const parseAgentCommand = useCallback(
        (input: string): { type: AgentType; target: string } | null => {
            const match = input.match(/^\/agents?\s+(\w+)\s+(.+)$/i);
            if (!match) return null;

            const [, typeStr, target] = match;
            const typeMap: Record<string, AgentType> = {
                web: "web_scanner",
                binary: "binary_reverser",
                phishing: "phishing_forge",
                custom: "custom_builder",
            };

            const type = typeMap[typeStr.toLowerCase()];
            if (!type) return null;

            return { type, target: target.trim() };
        },
        []
    );

    const togglePanel = useCallback(() => {
        setIsPanelOpen((prev) => !prev);
    }, []);

    return {
        agents,
        activeAgentId,
        setActiveAgentId,
        getActiveAgent,
        deployAgent,
        pauseAgent,
        resumeAgent,
        stopAgent,
        removeAgent,
        parseAgentCommand,
        isPanelOpen,
        setIsPanelOpen,
        togglePanel,
        catalog: AGENT_CATALOG,
    };
};
