
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { FormulaEvaluator } from "./services/calculation/FormulaEvaluator.ts";

const router = new Router();
const evaluator = new FormulaEvaluator();

router.post("/api/calculate", async (ctx) => {
  const body = await ctx.request.body.json();
  const { formula, cells } = body;

  if (formula && cells) {
    const result = evaluator.evaluate(formula, cells);
    ctx.response.body = { result };
  } else {
    ctx.response.body = { error: "Invalid request body" };
    ctx.response.status = 400;
  }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
