import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Button, Frog } from 'frog';
import { devtools } from 'frog/dev';
import { neynar } from 'frog/middlewares';
import dotenv from "dotenv";

dotenv.config();

const AIRSTACK_API_KEY = process.env.AIRSTACK_API_KEY;
if (!AIRSTACK_API_KEY) {
  console.error("AIRSTACK_API_KEY is not defined in the environment variables");
  throw new Error("AIRSTACK_API_KEY is missing");
}

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
if (!NEYNAR_API_KEY) {
  console.error("NEYNAR_API_KEY is not defined in the environment variables");
  throw new Error("NEYNAR_API_KEY is missing");
}

export const app = new Frog({
  title: 'Moxie Maxi',
  imageOptions: {
    fonts: [
      { name: "Lilita One", weight: 400, source: "google" },
      { name: "Knewave", weight: 400, source: "google" },
      { name: "Poetsen One", weight: 400, source: "google" },
      { name: "Poppins", weight: 400, source: "google" },
    ],
  },
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": AIRSTACK_API_KEY,
      },
    },
  },
}).use(
  neynar({
    apiKey: 'NEYNAR_FROG_FM',
    features: ['interactor'],
  })
);

app.use('/*', serveStatic({ root: './public' }));

app.frame('/', async (c) => {
  let fid = c.var.interactor?.fid || "";
  let username = c.var.interactor?.username || "";
  let pfpUrl = c.var.interactor?.pfpUrl || "";

  const urlParams = new URL(c.req.url).searchParams;
  fid = urlParams.get("fid") || fid;
  username = urlParams.get("username") || username;
  pfpUrl = urlParams.get("pfpUrl") || pfpUrl;

  fid = fid || "Unknown";
  username = username || "Anonymous";
  pfpUrl = pfpUrl || "";

  const hashId = `${Date.now()}-${fid}-${Math.random().toString(36).substr(2, 9)}`;

  const safeFid = encodeURIComponent(fid);
  const safeUsername = encodeURIComponent(username);
  const safePfpUrl = encodeURIComponent(pfpUrl);

  const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
    "🔥Ⓜ️ I AM MOXIE MAXI!\n\nFrame by @jeyloo.eth"
  )}&embeds[]=${encodeURIComponent(
    `https://9d7d-109-61-80-200.ngrok-free.app/?hashid=${hashId}&fid=${safeFid}&username=${safeUsername}&pfpUrl=${safePfpUrl}`
  )}`;

  return c.res({
    image: (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <img
          src="https://i.ibb.co/4Rm0GVnh/BG.png"
          alt="Background"
          width={1200}
          height={675}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {pfpUrl && (
          <img
            src={pfpUrl}
            alt="User Profile"
            width={245}
            height={245}
            style={{
              position: "absolute",
              top: "22.5%",
              left: "13.2%",
              transform: "translate(-50%, -50%)",
              borderRadius: "20%",
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
            }}
          />
        )}

        <p
          style={{ 
            fontSize: "70px", 
            fontWeight: "bold", 
            color: "white",
            position: "absolute",
            top: "16%", 
            left: "56%", 
            transform: "translate(-50%, -50%)",
            margin: "0",
            fontFamily: "'Poetsen One', cursive",
            textAlign: "center",
          }}
        >
          {username}
        </p>

        <p
          style={{
            fontSize: "45px",
            fontWeight: "400",
            color: "#ffd500",
            position: "absolute",
            top: "30%",
            left: "56%",
            transform: "translate(-50%, -50%)",
            margin: "0",
            fontFamily: "'Lilita One', sans-serif",
            textAlign: "center",
          }}
        >
          {fid}
        </p>
      </div>
    ),
    intents: [
      <Button value="im_in">I'm In</Button>,
      <Button.Link href={shareUrl}>📤 Share</Button.Link>,
    ],
  });
});

const port = Number(process.env.PORT) || 3000;
serve({
  fetch: app.fetch,
  port,
});

console.log(`🚀 Server is running on http://localhost:${port}`);
