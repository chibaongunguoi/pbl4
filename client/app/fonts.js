import { NextResponse } from "next/server";

export function GET() {
  return new NextResponse(
    `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  `,
    {
      headers: {
        "content-type": "text/html",
      },
    }
  );
}
