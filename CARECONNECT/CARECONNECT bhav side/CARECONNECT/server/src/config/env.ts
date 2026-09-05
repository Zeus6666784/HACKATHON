import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/careconnect",
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  nodeEnv: process.env.NODE_ENV ?? "development",
  nvidiaApiKey: process.env.NVIDIA_API_KEY ?? "",
  nvidiaModel: process.env.NVIDIA_MODEL ?? "meta/llama-3.1-405b-instruct"
};
