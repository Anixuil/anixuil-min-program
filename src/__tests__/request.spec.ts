import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "@/utils/request";
const transport = vi.fn();
const emit = vi.fn(), remove = vi.fn(), relaunch = vi.fn();
beforeEach(() => {
  transport.mockReset(); emit.mockReset(); remove.mockReset(); relaunch.mockReset();
  vi.stubGlobal("getCurrentPages", () => []);
  vi.stubGlobal("uni", { request: transport, getStorageSync: () => "token", removeStorageSync: remove, $emit: emit, reLaunch: relaunch, setStorageSync: vi.fn() });
});
describe("API response boundary", () => {
  it("unwraps a successful response exactly once", async () => {
    transport.mockImplementation(opts => opts.success({ statusCode: 200, data: { code: 200, data: { id: "m" } } }));
    await expect(request({ url: "/matches/m", method: "GET" })).resolves.toEqual({ id: "m" });
  });
  it("clears session state and redirects on protected 401", async () => {
    transport.mockImplementation(opts => opts.success({ statusCode: 401, data: { code: 401, message: "expired" } }));
    relaunch.mockImplementation(opts => opts.complete());
    await expect(request({ url: "/me", method: "GET" })).rejects.toMatchObject({ code: 401 });
    expect(emit).toHaveBeenCalledWith("bm:unauthorized");
    expect(remove).toHaveBeenCalledWith("token");
    expect(relaunch).toHaveBeenCalledTimes(1);
  });
  it("keeps incorrect login credentials on the login form", async () => {
    transport.mockImplementation(opts => opts.success({ statusCode: 401, data: { code: 401, message: "wrong password" } }));
    await expect(request({ url: "/auth/login", method: "POST" })).rejects.toMatchObject({ code: 401 });
    expect(relaunch).not.toHaveBeenCalled();
  });
  it("preserves concurrency conflicts for caller recovery", async () => {
    transport.mockImplementation(opts => opts.success({ statusCode: 409, data: { code: 409, message: "refresh" } }));
    await expect(request({ url: "/matches/m", method: "PUT" })).rejects.toMatchObject({ code: 409 });
    expect(emit).not.toHaveBeenCalled();
  });
});
