import request from "@/utils/request";

const SysLogAPI = {
  addSysLog(): Promise<any> {
    return request<any>({ url: "/sys-log/addSysLog", method: "POST" });
  },
};

export default SysLogAPI;
