import api from "@/services/api";

export const LogService = {
  async GetRecentLogs(): Promise<string[]> {
    return await api.get("/log/recent");
  },
};
