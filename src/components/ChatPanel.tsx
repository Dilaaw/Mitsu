import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { chatMessagesAtom, chatStreamCountAtom } from "../atoms/chatAtoms";
import { IpcClient } from "@/ipc/ipc_client";

import { ChatHeader } from "./chat/ChatHeader";
import { MessagesList } from "./chat/MessagesList";
import { ChatInput } from "./chat/ChatInput";
import { VersionPane } from "./chat/VersionPane";
import { ChatError } from "./chat/ChatError";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface ChatPanelProps {
  chatId?: number;
  isPreviewOpen: boolean;
  onTogglePreview: () => void;
}

export function ChatPanel({
  chatId,
  isPreviewOpen,
  onTogglePreview,
}: ChatPanelProps) {
  const [messages, setMessages] = useAtom(chatMessagesAtom);
  const [isVersionPaneOpen, setIsVersionPaneOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamCount = useAtomValue(chatStreamCountAtom);
  // Reference to store the processed prompt so we don't submit it twice

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const chatInputContainerRef = useRef<HTMLDivElement | null>(null);
  const [chatInputHeight, setChatInputHeight] = useState(0);

  // Scroll-related properties
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const userScrollTimeoutRef = useRef<number | null>(null);
  const lastScrollTopRef = useRef<number>(0);

  // Constants
  const NEAR_BOTTOM_THRESHOLD = 100;

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const checkNearBottom = (container: HTMLDivElement): boolean => {
    const { scrollTop, clientHeight, scrollHeight } = container;
    return scrollHeight - (scrollTop + clientHeight) <= NEAR_BOTTOM_THRESHOLD;
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const currentScrollTop = container.scrollTop;
    const isNearBottom = checkNearBottom(container);

    setShowScrollFab(!isNearBottom);

    if (currentScrollTop < lastScrollTopRef.current) {
      setIsUserScrolling(true);

      if (userScrollTimeoutRef.current) {
        window.clearTimeout(userScrollTimeoutRef.current);
      }

      userScrollTimeoutRef.current = window.setTimeout(() => {
        setIsUserScrolling(false);
      }, 1000);
    }

    lastScrollTopRef.current = currentScrollTop;
  };

  useEffect(() => {
    console.log("streamCount", streamCount);
    scrollToBottom();
  }, [streamCount]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      if (userScrollTimeoutRef.current) {
        window.clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, []);

  const fetchChatMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    const chat = await IpcClient.getInstance().getChat(chatId);
    setMessages(chat.messages);
  }, [chatId, setMessages]);

  useEffect(() => {
    fetchChatMessages();
  }, [fetchChatMessages]);

  // Observe chat input height so the FAB always sits above it
  useEffect(() => {
    const el = chatInputContainerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setChatInputHeight(rect.height || 0);
    };
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  // Auto-scroll effect when messages change
  useEffect(() => {
    if (
      !isUserScrolling &&
      messagesContainerRef.current &&
      messages.length > 0
    ) {
      const container = messagesContainerRef.current;
      const isNearBottom = checkNearBottom(container);

      // Update FAB visibility when new messages arrive
      setShowScrollFab(!isNearBottom);

      if (isNearBottom) {
        requestAnimationFrame(() => {
          scrollToBottom("instant");
        });
      }
    }
  }, [messages, isUserScrolling]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        isVersionPaneOpen={isVersionPaneOpen}
        isPreviewOpen={isPreviewOpen}
        onTogglePreview={onTogglePreview}
        onVersionClick={() => setIsVersionPaneOpen(!isVersionPaneOpen)}
      />
      <div className="flex flex-1 overflow-hidden">
        {!isVersionPaneOpen && (
          <div className="relative flex-1 flex flex-col min-w-0">
            <MessagesList
              messages={messages}
              messagesEndRef={messagesEndRef}
              ref={messagesContainerRef}
            />
            {showScrollFab && (
              <motion.div
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-10"
                style={{ bottom: Math.max(chatInputHeight + 12, 28) }}
                animate={{ y: [0, 3, 0], opacity: 1 }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="pointer-events-auto h-9 w-9 rounded-full shadow-md border bg-background/80 hover:bg-background"
                  aria-label="Scroll to bottom"
                  onClick={() => {
                    scrollToBottom("smooth");
                    setShowScrollFab(false);
                  }}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
            <ChatError error={error} onDismiss={() => setError(null)} />
            <div ref={chatInputContainerRef}>
              <ChatInput chatId={chatId} />
            </div>
          </div>
        )}
        <VersionPane
          isVisible={isVersionPaneOpen}
          onClose={() => setIsVersionPaneOpen(false)}
        />
      </div>
    </div>
  );
}
