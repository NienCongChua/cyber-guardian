import { PanelLeft, SquarePen, Search, Plus, Settings, Zap, Trash2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Agent } from "@/hooks/useAgents";
import { ChatSession } from "@/hooks/useChat";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onOpenAgents: () => void;
  agents?: Agent[];
  onSelectAgent?: (id: string) => void;
  chatSessions?: ChatSession[];
  currentChatId?: string | null;
  onSelectChat?: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  onClearHistory?: () => void;
}

const Sidebar = ({
  isOpen,
  onToggle,
  onNewChat,
  onOpenAgents,
  agents = [],
  onSelectAgent,
  chatSessions = [],
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onClearHistory,
}: SidebarProps) => {
  const runningAgents = agents.filter((a) => a.status === "running");

  const formatTime = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch {
      return "";
    }
  };

  return (
    <>
      {/* Collapsed sidebar (always visible) */}
      <div className="fixed left-0 top-0 bottom-0 w-14 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 z-40">
        <button
          onClick={onToggle}
          className="p-2.5 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <button
          onClick={onNewChat}
          className="p-2.5 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground mt-2"
        >
          <SquarePen className="w-5 h-5" />
        </button>

        <button className="p-2.5 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground mt-2">
          <Search className="w-5 h-5" />
        </button>

        {/* Agents Button */}
        <button
          onClick={onOpenAgents}
          className="relative p-2.5 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground mt-2"
          title="Agents"
        >
          <Zap className="w-5 h-5" />
          {runningAgents.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {runningAgents.length}
            </span>
          )}
        </button>

        <div className="flex-1" />

        <button
          onClick={onNewChat}
          className="p-2.5 bg-primary hover:bg-primary/90 rounded-lg transition-colors text-primary-foreground"
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="w-8 h-8 mt-4 rounded-full bg-gradient-to-br from-primary/50 to-cyber/50 flex items-center justify-center text-xs font-bold">
          H
        </div>
      </div>

      {/* Expanded sidebar overlay */}
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onToggle}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border z-50 flex flex-col"
          >
            <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold font-mono">H</span>
                </div>
                <span className="font-semibold">
                  Hacker<span className="text-primary">AI</span>
                </span>
              </div>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              <Button
                onClick={onNewChat}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <SquarePen className="w-4 h-4" />
                New Chat
              </Button>

              <Button
                onClick={() => {
                  onOpenAgents();
                  onToggle();
                }}
                variant="outline"
                className="w-full justify-start gap-2 border-primary/50 hover:bg-primary/10"
              >
                <Zap className="w-4 h-4 text-primary" />
                Agent Mode
                <span className="ml-auto px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded">
                  NEW
                </span>
              </Button>
            </div>

            {/* Running Agents */}
            {agents.length > 0 && (
              <div className="px-3 py-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  Active Agents
                </div>
                <div className="space-y-1">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => onSelectAgent?.(agent.id)}
                      className="w-full flex items-center gap-2 px-2 py-2 hover:bg-sidebar-accent rounded-lg transition-colors text-left"
                    >
                      <span className="text-lg">{agent.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{agent.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {agent.target}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${agent.status === "running"
                              ? "bg-primary animate-pulse"
                              : agent.status === "completed"
                                ? "bg-green-400"
                                : agent.status === "paused"
                                  ? "bg-yellow-400"
                                  : "bg-muted-foreground"
                            }`}
                        />
                        {agent.status === "running" && (
                          <span className="text-xs text-primary font-mono">
                            {agent.progress}%
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Chat History
                </div>
                {chatSessions.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                    title="Clear all history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {chatSessions.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No chat history yet
                </div>
              ) : (
                <div className="space-y-1">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group relative flex items-start gap-2 px-2 py-2 rounded-lg transition-colors cursor-pointer ${currentChatId === session.id
                          ? "bg-sidebar-accent"
                          : "hover:bg-sidebar-accent/50"
                        }`}
                      onClick={() => onSelectChat?.(session.id)}
                    >
                      <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {session.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(session.updatedAt)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat?.(session.id);
                        }}
                        className="absolute right-2 top-2 p-1 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-sidebar-border">
              <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground text-sm">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

export default Sidebar;
