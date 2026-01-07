import { useEffect, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface LiveTerminalProps {
    output: string[];
    title?: string;
    className?: string;
}

const LiveTerminal = ({ output, title = "Terminal", className = "" }: LiveTerminalProps) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [output]);

    const copyOutput = () => {
        navigator.clipboard.writeText(output.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatLine = (line: string | undefined, index: number) => {
        // Handle undefined or null lines
        if (line === undefined || line === null) {
            return <div key={index} className="text-foreground/80">&nbsp;</div>;
        }

        // Color coding for different line types
        let lineClassName = "text-foreground/80";

        if (line.startsWith("[+]") || line.startsWith("[✓]")) {
            lineClassName = "text-green-400";
        } else if (line.startsWith("[!]") || line.startsWith("[-]")) {
            lineClassName = "text-red-400";
        } else if (line.startsWith("[*]")) {
            lineClassName = "text-blue-400";
        } else if (line.startsWith("$")) {
            lineClassName = "text-primary font-semibold";
        } else if (line.includes("Critical") || line.includes("MALICIOUS")) {
            lineClassName = "text-red-400 font-semibold";
        } else if (line.includes("High")) {
            lineClassName = "text-orange-400";
        } else if (line.includes("Medium")) {
            lineClassName = "text-yellow-400";
        } else if (line.match(/^\s*(PORT|\/\w+|HKEY)/)) {
            lineClassName = "text-muted-foreground";
        }

        return (
            <div key={index} className={`${lineClassName} leading-relaxed`}>
                {line || "\u00A0"}
            </div>
        );
    };

    return (
        <div className={`terminal-window flex flex-col ${className}`}>
            {/* Terminal Header */}
            <div className="terminal-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="terminal-dot terminal-dot-red" />
                        <div className="terminal-dot terminal-dot-yellow" />
                        <div className="terminal-dot terminal-dot-green" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono ml-2">{title}</span>
                </div>
                <button
                    onClick={copyOutput}
                    className="p-1.5 hover:bg-muted rounded-md transition-colors"
                    title="Copy output"
                >
                    {copied ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                    ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                </button>
            </div>

            {/* Terminal Body */}
            <div
                ref={terminalRef}
                className="flex-1 p-4 overflow-y-auto font-mono text-sm bg-[hsl(var(--terminal-bg))] min-h-[200px] max-h-[400px]"
            >
                {output.length === 0 ? (
                    <div className="text-muted-foreground animate-pulse">
                        Waiting for output...
                    </div>
                ) : (
                    output.map((line, i) => formatLine(line, i))
                )}

                {/* Typing cursor on last line */}
                {output.length > 0 && (
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                )}
            </div>
        </div>
    );
};

export default LiveTerminal;
