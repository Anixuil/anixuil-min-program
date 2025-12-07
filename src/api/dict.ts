import request from "@/utils/request";
import { buildQuery } from "@/utils/query";

export interface DictTypeItem {
  id: string;
  dictTypeName: string;
  dictTypeCode: string;
}

export interface DictItem {
  id: string;
  dictTypeCode: string;
  label: string;
  value: string;
  sort?: number;
  remark?: string | null;
}

export interface PageResult<T> {
  list: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

const DictAPI = {
  listSysDictType(params: { page: number; pageSize: number }): Promise<PageResult<DictTypeItem>> {
    const query = buildQuery({ page: params.page, pageSize: params.pageSize });
    return request<PageResult<DictTypeItem>>({ url: `/sys-dict/listSysDictType${query}`, method: "GET" });
  },
  createSysDictType(data: { dictTypeName: string; dictTypeCode: string }): Promise<boolean> {
    return request<boolean>({ url: "/sys-dict/createSysDictType", method: "POST", data });
  },
  updateSysDictType(data: { id: string; dictTypeName: string; dictTypeCode: string }): Promise<boolean> {
    return request<boolean>({ url: "/sys-dict/updateSysDictType", method: "PUT", data });
  },
  deleteSysDictType(data: { ids: string[] }): Promise<boolean> {
    return request<boolean>({ url: "/sys-dict/deleteSysDictType", method: "DELETE", data });
  },

  createSysDict(data: {
    dictTypeCode: string;
    label: string;
    value: string;
    sort?: string;
    remark?: string;
  }): Promise<boolean> {
    return request<boolean>({ url: "/sys-dict/createSysDict", method: "POST", data });
  },
  listSysDict(params: { page: number; pageSize: number; dictTypeCode: string }): Promise<PageResult<DictItem>> {
    const query = buildQuery({ page: params.page, pageSize: params.pageSize, dictTypeCode: params.dictTypeCode });
    return request<PageResult<DictItem>>({ url: `/sys-dict/listSysDict${query}`, method: "GET" });
  },
  updateSysDict(data: { id: string; label?: string; value?: string; remark?: string }): Promise<boolean> {
    return request<boolean>({ url: "/sys-dict/updateSysDict", method: "PUT", data });
  },
  deleteSysDict(data: { ids: string[] }): Promise<boolean> {
    return request<boolean>({ url: "/sys-dict/deleteSysDict", method: "DELETE", data });
  },
  commonDictType(dictTypeCode: string): Promise<DictItem[]> {
    return request<DictItem[]>({ url: `/sys-dict/commonDictType/${dictTypeCode}`, method: "GET" });
  },
};

export default DictAPI;
