import http from "./index";

export const chatApi = {
  // Search registered users
  searchUsers: (search) =>
    http.get("/api/chat/users", {
      params: { search },
    }),

  // Get all conversations
  getConversations: () =>
    http.get("/api/chat/conversations"),

  // Create a conversation
  createConversation: (receiverId) =>
    http.post("/api/chat/conversations", {
      receiverId,
    }),

  // Get conversation messages
  getMessages: (conversationId, page = 1) =>
    http.get(`/api/chat/conversations/${conversationId}/messages`, {
      params: { page, limit: 30 },
    }),

  // Mark messages as read
  markRead: (conversationId) =>
    http.patch(`/api/chat/conversations/${conversationId}/read`),
};

export const getResponseData = (response) => {
  return response?.data?.data ?? response?.data ?? {};
};

export const getList = (response, key) => {
  const data = getResponseData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data[key])) return data[key];

  return [];
};