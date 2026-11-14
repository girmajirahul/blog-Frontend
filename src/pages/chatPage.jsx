
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageCircle,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  chatApi,
  getList,
  getResponseData,
} from "../api/chat";

import { createChatSocket } from "../services/chatSocket";

const getId = (value) =>
  String(value?._id || value?.id || value || "");

const getOtherUser = (conversation, currentUserId) => {
  const participants = conversation?.participants || [];

  return participants.find(
    (participant) => getId(participant) !== currentUserId
  ) || {};
};

const getMessageText = (message) =>
  message?.text || message?.content || "";

const getInitials = (name = "User") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const formatTime = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Avatar({ user, online = false }) {
  return (
    <div className="relative h-11 w-11 shrink-0">
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name || "User"}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
          {getInitials(user?.name)}
        </div>
      )}

      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
      )}
    </div>
  );
}

function MessageBubble({ message, mine }) {
  const status = String(message.status || "").toLowerCase();

  const read =
    status === "read" ||
    Boolean(message.readAt || message.read_at);

  const delivered =
    status === "delivered" ||
    read ||
    Boolean(message.deliveredAt || message.delivered_at);

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          mine
            ? "rounded-br-sm bg-indigo-600 text-white"
            : "rounded-bl-sm border border-slate-100 bg-white text-slate-800"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {getMessageText(message)}
        </p>

        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
            mine ? "text-indigo-200" : "text-slate-400"
          }`}
        >
          <span>
            {formatTime(
              message.createdAt ||
              message.created_at ||
              message.timestamp
            )}
          </span>

          {mine && (
            read ? (
              <CheckCheck size={14} className="text-sky-200" />
            ) : delivered ? (
              <CheckCheck size={14} />
            ) : (
              <Check size={14} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { user, accessToken } = useAuth();

  const currentUserId = getId(user);

  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);

  const [draft, setDraft] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [showSearch, setShowSearch] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const socketRef = useRef(null);
  const selectedRef = useRef(null);
  const typingTimer = useRef(null);
  const bottomRef = useRef(null);

  const selectedId = getId(selected);

  // Keep selected conversation available to socket listeners.
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Load conversations.
  const loadConversations = useCallback(async () => {
    try {
      const response = await chatApi.getConversations();

      setConversations(
        getList(response, "conversations")
      );
    } catch (error) {
      console.error(
        "Conversation loading failed:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Socket connection.
  useEffect(() => {
    if (!accessToken) return;

    const socket = createChatSocket(accessToken);

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);

      const conversationId = getId(selectedRef.current);

      if (conversationId) {
        socket.emit("conversation:join", {
          conversationId,
        });
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket error:", error.message);
      setConnected(false);
    });

    // New incoming message.
    socket.on("message:new", (payload) => {
      const message = payload?.message || payload;

      const conversationId = getId(
        payload?.conversationId ||
        message?.conversationId
      );

      if (
        conversationId &&
        conversationId === getId(selectedRef.current)
      ) {
        setMessages((previous) => {
          const exists = previous.some(
            (item) => getId(item) === getId(message)
          );

          return exists ? previous : [...previous, message];
        });

        socket.emit("messages:read", {
          conversationId,
        });

        chatApi.markRead(conversationId).catch(console.error);
      }

      loadConversations();
    });

    // Typing event.
    socket.on("typing:update", (payload) => {
      if (
        getId(payload?.conversationId) !==
        getId(selectedRef.current)
      ) {
        return;
      }

      setTyping(Boolean(payload?.isTyping));
    });

    // Presence event.
    socket.on("presence:update", (payload) => {
      const userId = getId(payload?.userId);

      if (!userId) return;

      setOnlineUsers((previous) => {
        if (payload?.isOnline) {
          return [...new Set([...previous, userId])];
        }

        return previous.filter((id) => id !== userId);
      });
    });

    // Read receipt event.
    socket.on("messages:read", (payload) => {
      if (
        getId(payload?.conversationId) !==
        getId(selectedRef.current)
      ) {
        return;
      }

      setMessages((previous) =>
        previous.map((message) => ({
          ...message,
          status: "read",
          readAt: payload?.readAt || new Date().toISOString(),
        }))
      );
    });

    socket.on("chat:error", (error) => {
      console.error("Chat server error:", error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;

      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, [accessToken, loadConversations]);

  // Load selected conversation messages.
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    setMobileChatOpen(true);
    setLoadingMessages(true);

    socketRef.current?.emit("conversation:join", {
      conversationId: selectedId,
    });

    const load = async () => {
      try {
        const response = await chatApi.getMessages(selectedId);

        setMessages(getList(response, "messages"));

        await chatApi.markRead(selectedId);

        socketRef.current?.emit("messages:read", {
          conversationId: selectedId,
        });
      } catch (error) {
        console.error(
          "Message loading failed:",
          error.response?.data || error.message
        );
      } finally {
        setLoadingMessages(false);
      }
    };

    load();
  }, [selectedId]);

  // Auto scroll to latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  // Search users.
  useEffect(() => {
    if (search.trim().length < 2) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await chatApi.searchUsers(search);

        setUsers(getList(response, "users"));
      } catch (error) {
        console.error("User search failed:", error);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // Start conversation.
  const startConversation = async (person) => {
    try {
      const response = await chatApi.createConversation(
        getId(person)
      );

      const data = getResponseData(response);

      const conversation =
        data.conversation ||
        data;

      await loadConversations();

      setSelected(conversation);
      setShowSearch(false);
      setSearch("");
      setUsers([]);
      setMobileChatOpen(true);
    } catch (error) {
      console.error(
        "Unable to start conversation:",
        error.response?.data || error.message
      );
    }
  };

  // Send message.
  const sendMessage = (event) => {
    event.preventDefault();

    const text = draft.trim();

    if (!text || !selectedId || !socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit("message:send", {
      conversationId: selectedId,
      text,
    });

    setDraft("");

    socketRef.current.emit("typing:stop", {
      conversationId: selectedId,
    });
  };

  // Typing indicator.
  const handleTyping = (value) => {
    setDraft(value);

    if (!selectedId || !socketRef.current?.connected) return;

    socketRef.current.emit("typing:start", {
      conversationId: selectedId,
    });

    clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit("typing:stop", {
        conversationId: selectedId,
      });
    }, 1200);
  };

  const conversationItems = conversations.map((conversation) => ({
    conversation,
    person: getOtherUser(conversation, currentUserId),
    lastMessage: conversation.lastMessage || conversation.last_message,
  }));

  const selectedUser = selected
    ? getOtherUser(selected, currentUserId)
    : null;

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-100">

      {/* Header */}
      {/* <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="rounded-xl bg-indigo-600 p-2 text-white">
            <MessageCircle size={20} />
          </div>

          <div>
            <h1 className="font-bold text-slate-900">
              Community Chat
            </h1>
            <p className="text-xs text-slate-500">
              Connect and share ideas
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
          connected
            ? "bg-green-50 text-green-700"
            : "bg-amber-50 text-amber-700"
        }`}>
          {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
          {connected ? "Connected" : "Connecting"}
        </div>
      </header> */}

      {/* Main layout */}
      <main className="mx-auto flex w-full max-w-[1500px] flex-1 overflow-hidden sm:p-4">

        <div className="flex w-full overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-slate-200">

          {/* Sidebar */}
          <aside className={`${
            mobileChatOpen ? "hidden" : "flex"
          } w-full flex-col border-r border-slate-100 md:flex md:w-[350px]`}>

            <div className="border-b p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Messages
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your conversations
                  </p>
                </div>

                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 hover:bg-indigo-100"
                >
                  {showSearch ? <X size={19} /> : <Plus size={19} />}
                </button>
              </div>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-3 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSearch(true);
                  }}
                  placeholder="Search conversations or users..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>
            </div>

            {/* Search results */}
            {showSearch && (
              <div className="border-b p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-400">
                  Community members
                </p>

                {users.map((person) => (
                  <button
                    key={getId(person)}
                    onClick={() => startConversation(person)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-slate-50"
                  >
                    <Avatar user={person} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {person.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {person.email}
                      </p>
                    </div>

                    <MessageCircle size={17} className="text-indigo-500" />
                  </button>
                ))}

                {search.length >= 2 && users.length === 0 && (
                  <p className="py-3 text-center text-xs text-slate-400">
                    No users found.
                  </p>
                )}
              </div>
            )}

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              <p className="px-4 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recent conversations
              </p>

              {loading ? (
                <p className="p-5 text-sm text-slate-400">
                  Loading conversations...
                </p>
              ) : conversationItems.length ? (
                conversationItems.map(({ conversation, person, lastMessage }) => {
                  const active =
                    getId(conversation) === selectedId;

                  return (
                    <button
                      key={getId(conversation)}
                      onClick={() => setSelected(conversation)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                        active
                          ? "bg-indigo-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <Avatar
                        user={person}
                        online={onlineUsers.includes(getId(person))}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {person?.name || "Community member"}
                          </p>

                          <span className="text-[10px] text-slate-400">
                            {formatTime(
                              lastMessage?.createdAt ||
                              lastMessage?.created_at
                            )}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {getMessageText(lastMessage) || "Start a conversation"}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <MessageCircle
                    size={30}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No conversations yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Search for a member to start chatting.
                  </p>
                </div>
              )}
            </div>

            {/* Logged in user */}
            <div className="border-t p-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <Avatar user={user} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Chat panel */}
          <section className={`${
            mobileChatOpen ? "flex" : "hidden"
          } min-w-0 flex-1 flex-col md:flex`}>

            {selected ? (
              <>
                {/* Chat header */}
                <div className="flex h-[76px] items-center justify-between border-b px-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMobileChatOpen(false)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
                    >
                      <ArrowLeft size={19} />
                    </button>

                    <Avatar
                      user={selectedUser}
                      online={onlineUsers.includes(getId(selectedUser))}
                    />

                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        {selectedUser?.name || "Conversation"}
                      </h2>

                      <p className="text-xs text-slate-500">
                        {typing
                          ? "Typing..."
                          : onlineUsers.includes(getId(selectedUser))
                            ? "Online"
                            : "Community member"}
                      </p>
                    </div>
                  </div>

                  {/* <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                    <MoreVertical size={19} />
                  </button> */}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-6">
                  <div className="mx-auto flex max-w-3xl flex-col gap-3">
                    {loadingMessages ? (
                      <p className="py-10 text-center text-sm text-slate-400">
                        Loading messages...
                      </p>
                    ) : messages.length ? (
                      messages.map((message) => {
                        const senderId = getId(
                          message.sender?._id ||
                          message.senderId ||
                          message.sender
                        );

                        return (
                          <MessageBubble
                            key={getId(message)}
                            message={message}
                            mine={senderId === currentUserId}
                          />
                        );
                      })
                    ) : (
                      <div className="py-20 text-center">
                        <MessageCircle
                          size={35}
                          className="mx-auto text-indigo-400"
                        />

                        <h3 className="mt-4 font-semibold text-slate-700">
                          Start a conversation
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Send your first message.
                        </p>
                      </div>
                    )}

                    {typing && (
                      <div className="self-start rounded-xl bg-white px-4 py-3 text-xs text-slate-500">
                        Typing...
                      </div>
                    )}

                    <div ref={bottomRef} />
                  </div>
                </div>

                {/* Message input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    const text = draft.trim();

                    if (
                      !text ||
                      !socketRef.current?.connected
                    ) return;

                    socketRef.current.emit("message:send", {
                      conversationId: selectedId,
                      text,
                    });

                    setDraft("");

                    socketRef.current.emit("typing:stop", {
                      conversationId: selectedId,
                    });
                  }}
                  className="border-t bg-white p-4"
                >
                  <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-indigo-300">
                    {/* <button
                      type="button"
                      className="rounded-xl p-2 text-slate-400 hover:text-indigo-600"
                      title="Attachments coming soon"
                    >
                      <Paperclip size={19} />
                    </button> */}

                    <textarea
                      value={draft}
                      onChange={(e) => {
                        setDraft(e.target.value);

                        socketRef.current?.emit("typing:start", {
                          conversationId: selectedId,
                        });

                        clearTimeout(typingTimer.current);

                        typingTimer.current = setTimeout(() => {
                          socketRef.current?.emit("typing:stop", {
                            conversationId: selectedId,
                          });
                        }, 1200);
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !e.shiftKey
                        ) {
                          e.preventDefault();
                          e.currentTarget.form.requestSubmit();
                        }
                      }}
                      rows={1}
                      placeholder="Write a message..."
                      className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
                    />

                    {/* <button
                      type="button"
                      className="rounded-xl p-2 text-slate-400 hover:text-indigo-600"
                      title="Emoji coming soon"
                    >
                      <Smile size={19} />
                    </button> */}

                    <button
                      type="submit"
                      disabled={!draft.trim() || !connected}
                      className="rounded-xl bg-indigo-600 p-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <Send size={17} />
                    </button>
                  </div>

                  <p className="mx-auto mt-2 max-w-3xl text-[10px] text-slate-400">
                    Enter to send · Shift + Enter for a new line
                  </p>
                </form>
              </>
            ) : (
              <div className="hidden flex-1 flex-col items-center justify-center text-center md:flex">
                <div className="rounded-3xl bg-indigo-50 p-6 text-indigo-600">
                  <MessageCircle size={40} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-800">
                  Welcome to Community Chat
                </h2>

                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Select a conversation or search for a community member to get started.
                </p>

                <button
                  onClick={() => setShowSearch(true)}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Start a conversation
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
