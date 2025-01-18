import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { registrationData } = await req.json();

    // Log the registrationData to the console
    console.log("Received registrationData:", registrationData);

    // Return a response (you can modify the response as needed)
    return NextResponse.json({
      message: "Data received successfully",
      registrationData,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
