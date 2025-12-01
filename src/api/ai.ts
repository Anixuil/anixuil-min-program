import request from "@/utils/request";

export interface DeepseekPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
}

const AiAPI = {
  deepseek(data: DeepseekPayload): Promise<any> {
    return request<any>({ url: "/ai/deepseek", method: "POST", data });
  },
};

export default AiAPI;
