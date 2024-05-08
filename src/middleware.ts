import { NextResponse } from "next/server";
import { BASE_PATH, auth } from "./auth";

export const config = {
  //regex. run the middleware for anything BESIDES these.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default auth((req) => {
  const reqUrl = new URL(req.url);
  if (!req.auth && reqUrl.pathname !== "/") {
    return NextResponse.redirect(
      new URL(
        //this string is case sensitive!
        `${BASE_PATH}/signin?callbackUrl=${encodeURIComponent(
          reqUrl.pathname
        )}`,
        req.url
      )
    );
  }
});
