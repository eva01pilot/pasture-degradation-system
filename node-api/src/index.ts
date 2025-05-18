import Fastify from "fastify";

const app = Fastify();
const PORT = 3000;

app.get("/api/hello", async () => {
  return { message: "Hello from Node API with TSX + Fastify!" };
});

app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${PORT}`);
});
