import { NextFunction, Request, Response } from "express";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: "Route not found" });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, error: `Invalid ID format: ${err.value}` });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, error: err.message });
  }
  console.error(err);
  res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
}
