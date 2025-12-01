import request from "@/utils/request";

const HealthAPI = {
  health(): Promise<any> {
    return request<any>({ url: "/health", method: "GET" });
  },
};

export default HealthAPI;
