import { NextRequest, NextResponse } from "next/server";
import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";
import { SENDER_EMAIL, APP_NAME, RECIEVE_EMAIL } from "@/lib/constants";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { registrationData } = await req.json();
    const { phone, email, projectData } = registrationData;

    // Send an email using Resend
    const { error } = await resend.emails.send({
      from: `${APP_NAME} <${SENDER_EMAIL}>`,
      //to: [email, RECIEVE_EMAIL],
      to: [RECIEVE_EMAIL],
      subject: "새로운 프로젝트 등록!",
      react: EmailTemplate({ phone, email, projectData }),
    });

    // Handle email send errors
    if (error) {
      console.error("Failed to send email:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // Respond with success
    return NextResponse.json({
      message: "Data received and email sent successfully",
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
