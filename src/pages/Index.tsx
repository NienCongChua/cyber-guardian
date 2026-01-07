import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import AgentPanel from "@/components/AgentPanel";
import { useAgents } from "@/hooks/useAgents";
import { useChat } from "@/hooks/useChat";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    agents,
    activeAgentId,
    setActiveAgentId,
    deployAgent,
    pauseAgent,
    resumeAgent,
    stopAgent,
    isPanelOpen,
    setIsPanelOpen,
    parseAgentCommand,
  } = useAgents();

  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    mode,
    setMode,
    sessions,
    currentSessionId,
    createNewSession,
    selectSession,
    deleteSession,
    clearAllHistory,
  } = useChat();

  const handleNewChat = useCallback(() => {
    createNewSession();
    setSidebarOpen(false);
  }, [createNewSession]);

  const handleOpenAgents = useCallback(() => {
    setIsPanelOpen(true);
  }, [setIsPanelOpen]);

  const handleSelectAgent = useCallback(
    (id: string) => {
      setActiveAgentId(id);
      setIsPanelOpen(true);
    },
    [setActiveAgentId, setIsPanelOpen]
  );

  const handleSelectChat = useCallback(
    (sessionId: string) => {
      selectSession(sessionId);
      setSidebarOpen(false);
    },
    [selectSession]
  );

  return (
    <div className="h-screen bg-background flex">
      <AnimatePresence>
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={handleNewChat}
          onOpenAgents={handleOpenAgents}
          agents={agents}
          onSelectAgent={handleSelectAgent}
          chatSessions={sessions}
          currentChatId={currentSessionId}
          onSelectChat={handleSelectChat}
          onDeleteChat={deleteSession}
          onClearHistory={clearAllHistory}
        />
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 ml-14 flex flex-col min-h-0">
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onClearMessages={clearMessages}
          mode={mode}
          onSetMode={setMode}
          onAgentCommand={(type, target) => {
            deployAgent(type, target);
          }}
          parseAgentCommand={parseAgentCommand}
        />
      </main>

      {/* Agent Panel */}
      <AgentPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        agents={agents}
        activeAgentId={activeAgentId}
        onSelectAgent={setActiveAgentId}
        onDeploy={deployAgent}
        onPause={pauseAgent}
        onResume={resumeAgent}
        onStop={stopAgent}
      />
    </div>
  );
};

export default Index;
