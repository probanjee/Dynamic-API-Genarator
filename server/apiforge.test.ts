import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openapi",
    email: "test@apiforge.dev",
    name: "Test Architect",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("APIForge Backend Integration Tests", () => {
  it("creates and retrieves API projects successfully", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const createRes = await caller.projects.create({
      name: "Payment Service",
      description: "Handles secure transactions",
      version: "1.0.0",
      baseUrl: "https://api.payments.com",
      tags: ["Finance", "Core"],
    });

    expect(createRes.success).toBe(true);
    expect(createRes.id).toBeDefined();

    const projects = await caller.projects.list();
    expect(projects.length).toBeGreaterThan(0);
    const target = projects.find(p => p.id === createRes.id);
    expect(target?.name).toBe("Payment Service");
  });

  it("exports OpenAPI 3.0 specification successfully", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const createRes = await caller.projects.create({
      name: "User Service",
      version: "2.0.0",
      baseUrl: "https://api.users.com",
    });

    const exportRes = await caller.generator.exportOpenAPI({
      projectId: createRes.id,
      format: "json",
    });

    expect(exportRes.url).toBeDefined();
    expect(exportRes.spec.openapi).toBe("3.0.3");
    expect(exportRes.spec.info.title).toBe("User Service");
  });

  it("generates FastAPI backend code scaffold", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const createRes = await caller.projects.create({
      name: "Order Service",
      version: "1.0.0",
    });

    const genRes = await caller.generator.generateCode({
      projectId: createRes.id,
      runtime: "fastapi",
    });

    expect(genRes.url).toBeDefined();
    expect(genRes.code).toContain("from fastapi import FastAPI");
    expect(genRes.code).toContain("Order Service");
  });
});
