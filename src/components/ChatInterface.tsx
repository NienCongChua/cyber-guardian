import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, ChevronDown, Bot, User, Copy, Check, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Message, ChatMode } from "@/hooks/useChat";
import { AgentType } from "@/hooks/useAgents";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

// Code block with copy button
const CodeBlock = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(() => {
    if (codeRef.current) {
      const code = codeRef.current.textContent || "";
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return (
    <div className="relative group/code my-3">
      <pre
        ref={codeRef}
        className={`bg-[#0d1117] rounded-lg p-4 overflow-x-auto text-sm ${className || ""}`}
      >
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/80 hover:bg-muted transition-all opacity-0 group-hover/code:opacity-100"
        title="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-primary" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
};

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (input: string) => void;
  onClearMessages?: () => void;
  mode: ChatMode;
  onSetMode: (mode: ChatMode) => void;
  onAgentCommand?: (type: AgentType, target: string) => void;
  parseAgentCommand?: (input: string) => { type: AgentType; target: string } | null;
}

const ChatInterface = ({
  messages,
  isLoading,
  onSendMessage,
  mode,
  onSetMode,
  onAgentCommand,
  parseAgentCommand
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Check for /agents command
    if (parseAgentCommand && onAgentCommand) {
      const agentCmd = parseAgentCommand(input);
      if (agentCmd) {
        onAgentCommand(agentCmd.type, agentCmd.target);
        setInput("");
        return;
      }
    }

    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative bg-secondary rounded-2xl border border-border focus-within:border-primary/50 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask, learn, or type /agents web target.com"
              rows={1}
              className="w-full bg-transparent px-4 pt-4 pb-14 resize-none outline-none text-foreground placeholder:text-muted-foreground font-mono text-sm min-h-[60px] max-h-[200px]"
              disabled={isLoading}
            />

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm"
                    >
                      {mode === "agent" ? (
                        <Zap className="w-4 h-4 text-primary" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      {mode === "ask" ? "Ask" : "Agent"}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => onSetMode("ask")}>
                      <Bot className="w-4 h-4 mr-2" />
                      <span className="font-medium">Ask</span>
                      <span className="text-muted-foreground text-xs ml-2">Quick Q&A</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSetMode("agent")}>
                      <Zap className="w-4 h-4 mr-2 text-primary" />
                      <span className="font-medium">Agent</span>
                      <span className="text-muted-foreground text-xs ml-2">/agents</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="rounded-full w-9 h-9"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Agent command hint */}
          {input.startsWith("/agents") && (
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-primary font-mono">/agents</span>{" "}
              <span className="text-foreground">[web|binary|phishing|custom]</span>{" "}
              <span className="text-muted-foreground">[target]</span>
              <span className="ml-2">• Example: /agents web target.com</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-4">
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-4xl md:text-5xl font-bold mb-3"
    >
      <span className="text-foreground">Hacker</span>
      <span className="text-primary neon-text">AI</span>
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="text-muted-foreground text-lg mb-6"
    >
      Your AI pentest assistant
    </motion.p>

    {/* Quick actions */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap gap-2 justify-center"
    >
      <div className="px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">
        <span className="text-primary font-mono">/agents web</span> target.com
      </div>
      <div className="px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">
        <span className="text-primary font-mono">/agents binary</span> malware.exe
      </div>
    </motion.div>
  </div>
);

const MessageBubble = ({ message }: { message: { role: string; content: string } }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-primary/30">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      <div
        className={`relative group max-w-[80%] rounded-2xl px-4 py-3 ${isUser
          ? "chat-bubble-user rounded-tr-md"
          : "chat-bubble-ai rounded-tl-md"
          }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom code block with copy button
                pre: ({ children, className }) => (
                  <CodeBlock className={className}>{children}</CodeBlock>
                ),
                // Inline code
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code
                        className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                // Headings
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mt-6 mb-3 text-foreground">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold mt-5 mb-2 text-foreground">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-semibold mt-3 mb-1 text-foreground">{children}</h4>
                ),
                // Paragraphs
                p: ({ children }) => (
                  <p className="mb-3 leading-relaxed">{children}</p>
                ),
                // Lists
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                // Links
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {children}
                  </a>
                ),
                // Blockquotes
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/50 pl-4 my-3 italic text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                // Tables
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full border border-border rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left font-semibold border-b border-border">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 border-b border-border">{children}</td>
                ),
                // Horizontal rule
                hr: () => <hr className="my-4 border-border" />,
                // Strong/Bold
                strong: ({ children }) => (
                  <strong className="font-bold text-foreground">{children}</strong>
                ),
                // Emphasis/Italic
                em: ({ children }) => (
                  <em className="italic">{children}</em>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && (
          <button
            onClick={copyToClipboard}
            className="absolute -right-10 top-2 p-1.5 rounded-md bg-secondary hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-primary" />
        </div>
      )}
    </motion.div>
  );
};

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex gap-3"
  >
    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-primary/30">
      <Bot className="w-4 h-4 text-primary" />
    </div>
    <div className="chat-bubble-ai rounded-2xl rounded-tl-md px-4 py-3">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </motion.div>
);

export default ChatInterface;
