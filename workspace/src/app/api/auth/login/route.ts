import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials format" }, { status: 400 });
    }
    const session = await login(parsed.data.username, parsed.data.password);
    if (!session) {
      return NextResponse.json({ error: "INVALID_LOGIN" }, { status: 401 });
    }
    return NextResponse.json({
      user: {
        id: session.id,
        username: session.username,
        fullName: session.fullName,
        role: session.role,
        locale: session.locale,
      },
    });
  } catch {
    return NextResponse.json({ error: "LOGIN_FAILED" }, { status: 500 });
  }
}
