import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Send, 
  Trash2, 
  User, 
  ChevronRight, 
  MessageSquare, 
  Pencil, 
  BrainCircuit,
  Settings2,
  Play,
  Square
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  command?: string;
  args?: string[];
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  isEditingTitle?: boolean;
  tools: Tool[];
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('ai-chats');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    const saved = localStorage.getItem('current-chat-id');
    return saved || '';
  });

  const [input, setInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editInputRefs = useRef<{ [key: string]: HTMLInputElement }>({});
  const { toast } = useToast();

  // Stop MCP server when component unmounts
  useEffect(() => {
    return () => {
      if (isServerRunning) {
        stopMcpServer();
      }
    };
  }, [isServerRunning]);

  // Stop MCP server when switching chats
  useEffect(() => {
    if (isServerRunning) {
      stopMcpServer();
    }
  }, [currentChatId]);

  // Stop MCP server when navigating away (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isServerRunning) {
        stopMcpServer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isServerRunning]);

  // Update available tools when MCP config changes
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'mcp-config') {
        // Force re-render when MCP config changes
        setChats(prevChats => [...prevChats]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('ai-chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('current-chat-id', currentChatId);
  }, [currentChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const generateChatTitle = (message: string) => {
    const words = message.trim().split(' ');
    let title = '';
    
    for (const word of words) {
      if ((title + word).length <= 25) {
        title += (title ? ' ' : '') + word;
      } else {
        break;
      }
    }
    
    return title + '...';
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      tools: [], // We'll load tools dynamically when needed
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    setShowSidebar(false);
  };

  const deleteChat = (chatId: string) => {
    setChats(chats.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(chats[0]?.id || '');
    }
  };

  const startEditingTitle = (chatId: string) => {
    setChats(prevChats =>
      prevChats.map(chat => ({
        ...chat,
        isEditingTitle: chat.id === chatId
      }))
    );
    setTimeout(() => {
      editInputRefs.current[chatId]?.focus();
      editInputRefs.current[chatId]?.select();
    }, 100);
  };

  const finishEditingTitle = (chatId: string, newTitle: string) => {
    if (newTitle.trim()) {
      setChats(prevChats =>
        prevChats.map(chat => 
          chat.id === chatId
            ? { ...chat, title: newTitle.trim(), isEditingTitle: false }
            : { ...chat, isEditingTitle: false }
        )
      );
    } else {
      setChats(prevChats =>
        prevChats.map(chat => ({ ...chat, isEditingTitle: false }))
      );
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentChatId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setInput('');

    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === currentChatId) {
          const isFirstMessage = chat.messages.length === 0;
          return {
            ...chat,
            title: isFirstMessage ? generateChatTitle(userMessage.content) : chat.title,
            messages: [...chat.messages, userMessage]
          };
        }
        return chat;
      })
    );

    const apiKey = JSON.parse(localStorage.getItem('user-settings') || '{}')?.openrouterKey;
    // @ts-ignore
    const aiResponse = await window.context.agentResponse([...chats.find(chat => chat.id === currentChatId)?.messages || [], userMessage], apiKey);
    const aiResponseMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse.response,
      timestamp: Date.now(),
    };

    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, userMessage, aiResponseMessage]
          };
        }
        return chat;
      })
    );
  };

  const getCurrentMcpTools = () => {
    try {
      const mcpConfig = localStorage.getItem('mcp-config');
      if (mcpConfig) {
        const config = JSON.parse(mcpConfig);
        if (config.mcpServers && typeof config.mcpServers === 'object') {
          return Object.entries(config.mcpServers).map(([name, serverConfig]: [string, any]) => ({
            id: name,
            name,
            description: `MCP Server: ${name}`,
            enabled: false,
            command: serverConfig.command,
            args: serverConfig.args
          }));
        }
      }
      return [];
    } catch (error) {
      console.error('Error loading MCP tools:', error);
      return [];
    }
  };

  const toggleTool = (toolId: string) => {
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === currentChatId) {
          // Find the tool in the current chat
          const existingTool = chat.tools.find(t => t.id === toolId);
          
          if (existingTool) {
            // If tool exists, toggle its enabled state
            return {
              ...chat,
              tools: chat.tools.map(t => 
                t.id === toolId ? { ...t, enabled: !t.enabled } : t
              )
            };
          } else {
            // If tool doesn't exist, add it from current MCP config
            const mcpTools = getCurrentMcpTools();
            const newTool = mcpTools.find(t => t.id === toolId);
            
            if (newTool) {
              return {
                ...chat,
                tools: [...chat.tools, { ...newTool, enabled: true }]
              };
            }
          }
        }
        return chat;
      })
    );
  };

  const enableAllTools = () => {
    const mcpTools = getCurrentMcpTools();
    
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === currentChatId) {
          // Create a map of existing tools by ID for quick lookup
          const existingToolsMap = new Map(
            chat.tools.map(tool => [tool.id, tool])
          );
          
          // Combine existing tools with new tools from MCP config
          const updatedTools = mcpTools.map(tool => {
            const existingTool = existingToolsMap.get(tool.id);
            return existingTool 
              ? { ...existingTool, enabled: true } 
              : { ...tool, enabled: true };
          });
          
          return {
            ...chat,
            tools: updatedTools
          };
        }
        return chat;
      })
    );
  };

  const disableAllTools = () => {
    const mcpTools = getCurrentMcpTools();
    
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === currentChatId) {
          // Create a map of existing tools by ID for quick lookup
          const existingToolsMap = new Map(
            chat.tools.map(tool => [tool.id, tool])
          );
          
          // Combine existing tools with new tools from MCP config
          const updatedTools = mcpTools.map(tool => {
            const existingTool = existingToolsMap.get(tool.id);
            return existingTool 
              ? { ...existingTool, enabled: false } 
              : { ...tool, enabled: false };
          });
          
          return {
            ...chat,
            tools: updatedTools
          };
        }
        return chat;
      })
    );
  };

  const startMcpServer = async () => {
    try {
      setIsServerRunning(true);
      const currentChat = chats.find(chat => chat.id === currentChatId);
      const enabledTools = currentChat?.tools.filter(tool => tool.enabled) || [];
      
      if (enabledTools.length === 0) {
        toast({
          title: "No tools selected",
          description: "Please select at least one tool to start the MCP server.",
          variant: "destructive",
        });
        return;
      }
      console.log('Enabled tools:', enabledTools);
      
      const mcpConfig = localStorage.getItem('mcp-config');
      const config = JSON.parse(mcpConfig || '{}');
      const apiKey = JSON.parse(localStorage.getItem('user-settings') || '{}')?.openrouterKey;
      // @ts-ignore
      await window.context.startMcpServer(config, apiKey);
    } catch (error) {
      console.error('Error starting MCP server:', error);
      toast({
        title: "Error starting MCP server",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const stopMcpServer = async () => {
    try {
      setIsServerRunning(false);
      // @ts-ignore
      await window.context.stopMcpServer();
    } catch (error) {
      console.log("Error stopping MCP server:", error);
    }
  };

  const toggleServer = async () => {
    if (!isServerRunning) {
      await startMcpServer();
    } else {
      await stopMcpServer();
    }
  };

  const getEnabledToolsConfig = () => {
    const currentChat = chats.find(chat => chat.id === currentChatId);
    if (!currentChat) return {};

    // Get the latest MCP tools configuration
    const mcpTools = getCurrentMcpTools();
    
    // Create a map of existing tools by ID for quick lookup
    const existingToolsMap = new Map(
      currentChat.tools.map(tool => [tool.id, tool])
    );
    
    // Combine existing tools with new tools from MCP config
    const allTools = mcpTools.map(tool => {
      const existingTool = existingToolsMap.get(tool.id);
      return existingTool || tool;
    });
    
    // Filter enabled tools
    const enabledTools = allTools.filter(tool => {
      const existingTool = existingToolsMap.get(tool.id);
      return existingTool ? existingTool.enabled : false;
    });

    if (enabledTools.length === 0) return {};

    const config: { [key: string]: any } = {};
    enabledTools.forEach(tool => {
      if (tool.command && tool.args) {
        config[tool.id] = {
          command: tool.command,
          args: tool.args
        };
      }
    });

    return { mcpServers: config };
  };

  const currentChat = chats.find(chat => chat.id === currentChatId);

  return (
    <div className="flex h-full relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-400/10 via-background to-background dark:from-indigo-800/20 dark:via-background dark:to-background" />

      <div className="flex-1 flex flex-col relative">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-20 border-b border-border/50 flex items-center justify-between px-6 bg-card/30 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="font-semibold text-lg">Sense AI</span>
              <p className="text-sm text-muted-foreground">Your intelligent assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={createNewChat}
              className="h-9 px-4 bg-card/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              className="relative h-9 w-9 hover:bg-primary/10"
            >
              <MessageSquare className="h-4 w-4" />
              {chats.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                  {chats.length}
                </span>
              )}
            </Button>
          </div>
        </motion.div>

        {currentChat ? (
          <>
            <ScrollArea className="flex-1 px-4 md:px-16 lg:px-32 xl:px-48 py-8">
              <div className="max-w-3xl mx-auto space-y-6">
                {currentChat.messages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="relative">
                      <BrainCircuit className="h-16 w-16 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mt-6 mb-3">
                      How can I help you today?
                    </h2>
                    <p className="text-muted-foreground max-w-lg text-lg">
                      I'm ready to assist you with anything you need. From answering questions to providing recommendations.
                    </p>
                  </motion.div>
                )}
                <AnimatePresence>
                  {currentChat.messages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex items-start gap-4 ${
                        message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      <div className={`shrink-0 rounded-xl p-2 ring-2 ${
                        message.role === 'assistant' 
                          ? 'bg-primary/10 ring-primary/20 text-primary' 
                          : 'bg-background ring-border'
                      }`}>
                        {message.role === 'assistant' ? (
                          <BrainCircuit className="h-5 w-5" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div 
                        className={`flex-1 rounded-2xl bg-opacity-80 backdrop-blur-sm ${
                          message.role === 'assistant' 
                            ? 'bg-card/30 border-2 border-primary/20 shadow-[0_0_15px_-3px_rgba(var(--primary),0.2)]' 
                            : 'bg-primary/90 text-primary-foreground border-2 border-primary/40'
                        }`}
                      >
                        <div className="p-6">{message.content}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="px-4 md:px-16 lg:px-32 xl:px-48 py-6 bg-gradient-to-t from-background to-transparent -mt-10">
              <div className="max-w-3xl mx-auto">
                <div className="rounded-2xl bg-card/30 backdrop-blur-sm border-2 border-primary/20 shadow-[0_0_15px_-3px_rgba(var(--primary),0.2)]">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-9 bg-white/5 border-2 border-primary/20 hover:bg-primary/10"
                            >
                              <Settings2 className="h-4 w-4 mr-2" />
                              Tools
                              {currentChat.tools.some(t => t.enabled) && (
                                <span className="ml-2 h-5 w-5 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                                  {currentChat.tools.filter(t => t.enabled).length}
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-80 p-3" 
                            side="top"
                            align="start"
                            sideOffset={5}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium">Available Tools</h4>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={enableAllTools}
                                  className="h-8 text-xs hover:bg-primary/10"
                                >
                                  Enable All
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={disableAllTools}
                                  className="h-8 text-xs hover:bg-destructive/10"
                                >
                                  Disable All
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {(() => {
                                // Get current MCP tools
                                const mcpTools = getCurrentMcpTools();
                                
                                // Get existing tools from current chat
                                const existingTools = currentChat.tools || [];
                                const existingToolsMap = new Map(
                                  existingTools.map(tool => [tool.id, tool])
                                );
                                
                                // If no tools available, show message
                                if (mcpTools.length === 0) {
                                  return (
                                    <div className="text-sm text-muted-foreground py-2">
                                      No MCP tools configured. Add tools in Settings.
                                    </div>
                                  );
                                }
                                
                                // Show all tools from MCP config
                                return mcpTools.map(tool => {
                                  // Check if tool exists in current chat
                                  const existingTool = existingToolsMap.get(tool.id);
                                  const isEnabled = existingTool ? existingTool.enabled : false;
                                  
                                  return (
                                    <div key={tool.id} className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={`tool-${tool.id}`} 
                                        checked={isEnabled}
                                        onCheckedChange={() => toggleTool(tool.id)}
                                      />
                                      <label
                                        htmlFor={`tool-${tool.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                      >
                                        {tool.name}
                                      </label>
                                    </div>
                                  );
                                });
                              })()}
                              
                              <div className="pt-2 flex justify-end">
                                {!isServerRunning && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => {
                                      setShowServerConfig(true);
                                    }}
                                  >
                                    Start Server
                                  </Button>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => isServerRunning==false? setShowServerConfig(true) : toggleServer()}
                        className={`h-9 bg-white/5 border-2 border-primary/20 hover:bg-primary/10 ${
                          isServerRunning ? 'text-yellow-500 hover:text-yellow-500' : ''
                        }`}
                      >
                        {isServerRunning ? (
                          <Square className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {isServerRunning ? 'Stop MCP Server' : 'Start MCP Server'}
                      </Button>
                    </div>

                    <div className="flex gap-3">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-white/5 border-2 border-primary/20 focus:border-primary/40 backdrop-blur-sm placeholder:text-muted-foreground dark:placeholder:text-white/50"
                      />
                      <Button 
                        type="submit" 
                        disabled={!input.trim()}
                        className="px-6 bg-primary/90 hover:bg-primary border-2 border-primary/40"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center flex-col gap-6 p-4"
          >
            <div className="relative">
              <BrainCircuit className="h-20 w-20 text-primary" />
            </div>
            <h2 className="text-4xl font-bold">
              Welcome to MCP Desk
            </h2>
            <p className="text-muted-foreground text-center max-w-lg text-lg">
              Start a new chat or select an existing one to begin your conversation.
            </p>
            <Button 
              onClick={createNewChat}
              size="lg"
              className="bg-primary/90 hover:bg-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Chat
            </Button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-80 bg-card/80 backdrop-blur-xl border-l border-border/50 shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg">Chat History</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createNewChat}
                    className="h-8 bg-card/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Chat
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSidebar(false)}
                    className="h-8 w-8 hover:bg-primary/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="space-y-2 pr-2">
                  <AnimatePresence>
                    {chats.map(chat => (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`group flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors ${
                          currentChatId === chat.id 
                            ? 'bg-primary/10 text-primary' 
                            : 'hover:bg-primary/5'
                        }`}
                        onClick={() => {
                          if (!chat.isEditingTitle) {
                            setCurrentChatId(chat.id);
                            setShowSidebar(false);
                          }
                        }}
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        {chat.isEditingTitle ? (
                          <Input
                            ref={el => {
                              if (el) editInputRefs.current[chat.id] = el;
                            }}
                            defaultValue={chat.title}
                            className="h-7 text-sm py-0 px-2 bg-white/5"
                            onBlur={e => finishEditingTitle(chat.id, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                finishEditingTitle(chat.id, e.currentTarget.value);
                              }
                            }}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <span className="flex-1 truncate text-sm">
                            {chat.title}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingTitle(chat.id);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showServerConfig} onOpenChange={setShowServerConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>MCP Server Configuration</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <pre className="p-4 rounded-lg bg-muted font-mono text-sm whitespace-pre-wrap break-all">
              {JSON.stringify(getEnabledToolsConfig(), null, 2)}
            </pre>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => {
                  setShowServerConfig(false);
                  toggleServer();
                }}
              >
                Start MCP Server
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}