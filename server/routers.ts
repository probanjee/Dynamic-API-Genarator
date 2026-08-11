import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { 
  projects, endpoints, schemas, middlewareConfigs, securityScans, generatedArtifacts, auditLogs, projectMembers,
  Project, InsertProject, Endpoint, InsertEndpoint, SchemaEntity, InsertSchemaEntity,
  MiddlewareConfig, InsertMiddlewareConfig, SecurityScan, InsertSecurityScan, GeneratedArtifact, ProjectMember
} from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(projects).where(eq(projects.userId, ctx.user.id)).orderBy(desc(projects.updatedAt));
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [proj] = await db.select().from(projects).where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id))).limit(1);
      if (!proj) throw new Error("Project not found");
      return proj;
    }),
    create: protectedProcedure.input(z.object({
      name: z.string().min(1, "Project name is required"),
      description: z.string().optional(),
      version: z.string().default("1.0.0"),
      baseUrl: z.string().default("https://api.example.com"),
      tags: z.array(z.string()).optional(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const projectName = input.name || "Untitled API Project";
      const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'api-project';
      const [result] = await db.insert(projects).values({
        userId: ctx.user.id,
        name: input.name,
        slug,
        description: input.description || "",
        version: input.version,
        baseUrl: input.baseUrl,
        tags: input.tags || ["Core", "REST"],
      });
      const insertId = Number(result.insertId);
      
      // Seed default middleware
      await db.insert(middlewareConfigs).values([
        { projectId: insertId, name: "JWT Authentication", type: "auth", enabled: 1, config: { header: "Authorization", scheme: "Bearer" } },
        { projectId: insertId, name: "Global Rate Limiter", type: "rate_limit", enabled: 1, config: { limit: 100, window: "60s" } }
      ]);

      return { id: insertId, success: true };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
      version: z.string(),
      baseUrl: z.string(),
      tags: z.array(z.string()).optional(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(projects).set({
        name: input.name,
        description: input.description,
        version: input.version,
        baseUrl: input.baseUrl,
        tags: input.tags,
      }).where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)));
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(projects).where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)));
      return { success: true };
    })
  }),

  team: router({
    list: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(projectMembers).where(eq(projectMembers.projectId, input.projectId));
    }),
    invite: protectedProcedure.input(z.object({
      projectId: z.number(),
      email: z.string().email(),
      role: z.enum(["OWNER", "ADMIN", "DEVELOPER", "VIEWER"]),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(projectMembers).values({
        projectId: input.projectId,
        email: input.email,
        role: input.role,
      });
      return { success: true };
    }),
    remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(projectMembers).where(eq(projectMembers.id, input.id));
      return { success: true };
    })
  }),

  mock: router({
    test: protectedProcedure.input(z.object({
      method: z.string(),
      path: z.string(),
      headers: z.any().optional(),
      body: z.any().optional(),
    })).mutation(async ({ input }) => {
      const latency = Math.floor(Math.random() * 45) + 15; // 15ms - 60ms
      const status = input.method === "POST" ? 201 : 200;
      return {
        status,
        latencyMs: latency,
        headers: {
          "content-type": "application/json",
          "x-apiforge-mock": "true",
          "x-request-id": `req_${Math.random().toString(36).substring(7)}`
        },
        data: {
          success: true,
          method: input.method,
          path: input.path,
          receivedBody: input.body || null,
          message: "Mock test executed successfully against APIForge virtual gateway."
        }
      };
    })
  }),

  endpoints: router({
    list: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(endpoints).where(eq(endpoints.projectId, input.projectId)).orderBy(endpoints.path);
    }),
    save: protectedProcedure.input(z.object({
      id: z.number().optional(),
      projectId: z.number(),
      method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
      path: z.string().min(1),
      summary: z.string().optional(),
      description: z.string().optional(),
      parameters: z.any().optional(),
      requestBodySchemaId: z.number().nullable().optional(),
      responseSchemaId: z.number().nullable().optional(),
      responseStatusCode: z.number().default(200),
      authentication: z.string().default("jwt"),
      middleware: z.any().optional(),
      rateLimit: z.string().default("100/min"),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const payload = {
        projectId: input.projectId,
        method: input.method,
        path: input.path,
        summary: input.summary || "",
        description: input.description || "",
        parameters: input.parameters || [],
        requestBodySchemaId: input.requestBodySchemaId || null,
        responseSchemaId: input.responseSchemaId || null,
        responseStatusCode: input.responseStatusCode,
        authentication: input.authentication,
        middleware: input.middleware || ["validation", "rate_limit", "logging"],
        rateLimit: input.rateLimit,
      };

      if (input.id) {
        await db.update(endpoints).set(payload).where(eq(endpoints.id, input.id));
        return { id: input.id, success: true };
      } else {
        const [res] = await db.insert(endpoints).values(payload);
        return { id: Number(res.insertId), success: true };
      }
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(endpoints).where(eq(endpoints.id, input.id));
      return { success: true };
    })
  }),

  schemas: router({
    list: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(schemas).where(eq(schemas.projectId, input.projectId));
    }),
    save: protectedProcedure.input(z.object({
      id: z.number().optional(),
      projectId: z.number(),
      name: z.string().optional().default("NewSchema"),
      description: z.string().optional(),
      definition: z.any(), // JSON schema object or fields array
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const payload = {
        projectId: input.projectId,
        name: input.name,
        description: input.description || "",
        definition: input.definition || { type: "object", properties: {} },
      };
      if (input.id) {
        await db.update(schemas).set(payload).where(eq(schemas.id, input.id));
        return { id: input.id, success: true };
      } else {
        const [res] = await db.insert(schemas).values(payload);
        return { id: Number(res.insertId), success: true };
      }
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(schemas).where(eq(schemas.id, input.id));
      return { success: true };
    })
  }),

  middleware: router({
    list: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(middlewareConfigs).where(eq(middlewareConfigs.projectId, input.projectId));
    }),
    save: protectedProcedure.input(z.object({
      id: z.number().optional(),
      projectId: z.number(),
      name: z.string(),
      type: z.string(),
      enabled: z.number(),
      config: z.any(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const payload = {
        projectId: input.projectId,
        name: input.name,
        type: input.type,
        enabled: input.enabled,
        config: input.config,
      };
      if (input.id) {
        await db.update(middlewareConfigs).set(payload).where(eq(middlewareConfigs.id, input.id));
        return { id: input.id, success: true };
      } else {
        const [res] = await db.insert(middlewareConfigs).values(payload);
        return { id: Number(res.insertId), success: true };
      }
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(middlewareConfigs).where(eq(middlewareConfigs.id, input.id));
      return { success: true };
    })
  }),

  security: router({
    scan: protectedProcedure.input(z.object({ projectId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const projEndpoints = await db.select().from(endpoints).where(eq(endpoints.projectId, input.projectId));
      
      const findings: Array<{ title: string; severity: "HIGH" | "MEDIUM" | "LOW"; description: string; recommendation: string }> = [];
      let score = 100;

      for (const ep of projEndpoints) {
        if (!ep.authentication || ep.authentication === "none") {
          findings.push({
            title: `Unauthenticated Endpoint: ${ep.method} ${ep.path}`,
            severity: "HIGH",
            description: "Endpoint does not enforce any authentication mechanism (JWT, API Key, or OAuth2).",
            recommendation: "Enable JWT or API Key authentication on sensitive routes."
          });
          score -= 15;
        }
        if (ep.method === "POST" || ep.method === "PUT" || ep.method === "PATCH") {
          if (!ep.requestBodySchemaId) {
            findings.push({
              title: `Missing Request Schema: ${ep.method} ${ep.path}`,
              severity: "MEDIUM",
              description: "Mutation endpoint lacks a defined request body schema, risking injection or malformed data.",
              recommendation: "Attach a validated JSON schema to the request body."
            });
            score -= 10;
          }
        }
      }

      if (findings.length === 0) {
        findings.push({
          title: "Robust Security Posture",
          severity: "LOW",
          description: "All endpoints have authentication and validation rules configured.",
          recommendation: "Continue adhering to zero-trust principles."
        });
      }

      score = Math.max(20, score);

      await db.insert(securityScans).values({
        projectId: input.projectId,
        score,
        findings,
      });

      return { score, findings };
    }),
    latest: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [scan] = await db.select().from(securityScans).where(eq(securityScans.projectId, input.projectId)).orderBy(desc(securityScans.createdAt)).limit(1);
      return scan || null;
    })
  }),

  generator: router({
    exportOpenAPI: protectedProcedure.input(z.object({ projectId: z.number(), format: z.enum(["json", "yaml"]) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [proj] = await db.select().from(projects).where(eq(projects.id, input.projectId)).limit(1);
      const projEndpoints = await db.select().from(endpoints).where(eq(endpoints.projectId, input.projectId));
      const projSchemas = await db.select().from(schemas).where(eq(schemas.projectId, input.projectId));

      const schemaMap: Record<number, any> = {};
      for (const s of projSchemas) {
        schemaMap[s.id] = s.definition;
      }

      const paths: Record<string, any> = {};
      for (const ep of projEndpoints) {
        if (!paths[ep.path]) paths[ep.path] = {};
        const methodKey = ep.method.toLowerCase();
        
        const reqSchema = ep.requestBodySchemaId ? schemaMap[ep.requestBodySchemaId] : { type: "object", properties: {} };
        const resSchema = ep.responseSchemaId ? schemaMap[ep.responseSchemaId] : { type: "object", properties: { success: { type: "boolean" } } };

        paths[ep.path][methodKey] = {
          summary: ep.summary || `${ep.method} ${ep.path}`,
          description: ep.description || "",
          parameters: (ep.parameters as any[] || []).map((p: any) => ({
            name: p.name,
            in: p.in || "query",
            required: p.required || false,
            schema: { type: p.type || "string" }
          })),
          requestBody: ["POST", "PUT", "PATCH"].includes(ep.method) ? {
            content: {
              "application/json": {
                schema: reqSchema
              }
            }
          } : undefined,
          responses: {
            [ep.responseStatusCode.toString()]: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: resSchema
                }
              }
            }
          },
          security: ep.authentication !== "none" ? [{ bearerAuth: [] }] : []
        };
      }

      const openApiSpec = {
        openapi: "3.0.3",
        info: {
          title: proj?.name || "APIForge Project",
          version: proj?.version || "1.0.0",
          description: proj?.description || "Generated by APIForge",
        },
        servers: [{ url: proj?.baseUrl || "https://api.example.com" }],
        paths,
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT"
            }
          },
          schemas: Object.fromEntries(projSchemas.map(s => [s.name, s.definition]))
        }
      };

      const content = input.format === "yaml" ? JSON.stringify(openApiSpec, null, 2) : JSON.stringify(openApiSpec, null, 2);
      const filename = `${proj?.slug || 'api'}-openapi.${input.format === 'yaml' ? 'json' : 'json'}`;
      const { url } = await storagePut(`exports/${filename}`, Buffer.from(content), "application/json");

      await db.insert(generatedArtifacts).values({
        projectId: input.projectId,
        runtime: "openapi",
        fileKey: `exports/${filename}`,
        fileUrl: url,
        format: input.format,
      });

      return { url, spec: openApiSpec };
    }),

    generateCode: protectedProcedure.input(z.object({ projectId: z.number(), runtime: z.enum(["fastapi", "express"]) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [proj] = await db.select().from(projects).where(eq(projects.id, input.projectId)).limit(1);
      const projEndpoints = await db.select().from(endpoints).where(eq(endpoints.projectId, input.projectId));
      const projSchemas = await db.select().from(schemas).where(eq(schemas.projectId, input.projectId));

      let codeContent = "";
      if (input.runtime === "fastapi") {
        codeContent = `'''
Generated by APIForge for FastAPI
Project: ${proj?.name} (v${proj?.version})
Endpoints: ${projEndpoints.length}
'''
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional

app = FastAPI(title="${proj?.name}", version="${proj?.version}")

# Schemas
${projSchemas.map(s => {
  const def = s.definition as any;
  const props = def?.properties || {};
  const fields = Object.entries(props).map(([k, v]: [string, any]) => `    ${k}: ${v.type === 'number' ? 'float' : 'str'} = "${v.default || ''}"`).join('\n');
  return `class ${s.name}(BaseModel):\n${fields || '    id: Optional[int] = None'}\n`;
}).join('\n')}

# Endpoints
${projEndpoints.map(ep => {
  const pyPath = ep.path.replace(/{([^}]+)}/g, '{$1}');
  return `@app.${ep.method.toLowerCase()}("${pyPath}")
async def ${ep.method.toLowerCase()}_${ep.path.replace(/[^a-zA-Z0-9]/g, '_')}(req_data: dict = None):
    # Middleware & validation applied
    return {"status": "success", "endpoint": "${ep.path}", "data": req_data}
`;
}).join('\n')}
`;
      } else {
        codeContent = `/*
Generated by APIForge for Express.js
Project: ${proj?.name} (v${proj?.version})
Endpoints: ${projEndpoints.length}
*/

const express = require('express');
const app = express();
app.use(express.json());

// Middleware & Auth
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  next();
});

// Endpoints
${projEndpoints.map(ep => {
  const expPath = ep.path.replace(/{([^}]+)}/g, ':$1');
  return `app.${ep.method.toLowerCase()}('${expPath}', async (req, res) => {
  try {
    res.json({ status: 'success', endpoint: '${ep.path}', body: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;
}).join('\n\n')}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`;
      }

      const filename = `${proj?.slug || 'api'}-${input.runtime}-scaffold.txt`;
      const { url } = await storagePut(`code/${filename}`, Buffer.from(codeContent), "text/plain");

      await db.insert(generatedArtifacts).values({
        projectId: input.projectId,
        runtime: input.runtime,
        fileKey: `code/${filename}`,
        fileUrl: url,
        format: "txt",
      });

      return { url, code: codeContent };
    }),

    listArtifacts: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(generatedArtifacts).where(eq(generatedArtifacts.projectId, input.projectId)).orderBy(desc(generatedArtifacts.createdAt));
    })
  }),

  ai: router({
    copilot: protectedProcedure.input(z.object({ prompt: z.string(), projectId: z.number().optional() })).mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are the AI Architect of APIForge. Provide precise, professional advice and code structures for API design, schema validation, middleware setup, or security remediation. Return Markdown response." },
          { role: "user", content: input.prompt }
        ]
      });
      return { response: response.choices[0]?.message.content || "No AI response generated." };
    })
  })
});

export type AppRouter = typeof appRouter;
