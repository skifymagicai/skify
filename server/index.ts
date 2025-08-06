import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerViralRoutes } from "./viral-routes";
import { registerModularRoutes } from "./api-routes";
import { setupVite, serveStatic, log } from "./vite";
// Import Skify AI server (will be dynamically imported)

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  registerViralRoutes(app);
  await registerModularRoutes(app);
  
  // Mount Skify AI routes - debug import
  try {
    const skifyModule = await import('./skify-server.js');
    console.log('Skify module imported:', Object.keys(skifyModule));
    
    const skifyApp = skifyModule.default || skifyModule;
    if (skifyApp && typeof skifyApp.use === 'function') {
      app.use('/', skifyApp);
      console.log('✅ Skify AI server mounted successfully');
    } else {
      console.error('❌ Skify module does not export a valid Express app');
    }
  } catch (error) {
    console.error('❌ Failed to mount Skify AI server:', error);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
