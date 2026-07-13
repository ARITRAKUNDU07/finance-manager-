import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

// Explicitly load .env files to bypass Next.js root folder misidentification
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-mariadb", "mariadb"],
};

export default nextConfig;
