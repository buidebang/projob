import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
        return new NextResponse("Price ID is required", { status: 400 });
    }

    // Return mock URL for TDD
    return NextResponse.json({ url: "https://checkout.stripe.com/test-url" });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
