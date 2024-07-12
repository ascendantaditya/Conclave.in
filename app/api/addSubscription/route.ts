import dotenv from "dotenv";
dotenv.config({ path: ".env.example" });

import mailchimp from "@mailchimp/mailchimp_marketing";

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_SERVER, // e.g. us1
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID!,
      { email_address: email, status: "subscribed" }
    );

    return new Response(JSON.stringify({ res }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error occurred:", error); // Log the error

    let errorMessage = "Internal Server Error";
    let status = 500;

    if (error.response) {
      try {
        const errorBody = JSON.parse(error.response.text);
        errorMessage = errorBody.title || errorMessage;
        status = error.response.status;
      } catch (jsonError) {
        console.error("Failed to parse error response", jsonError); // Log JSON parsing error
      }
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
