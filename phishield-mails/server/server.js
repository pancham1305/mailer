import express from "express";
import dotenv from "dotenv";
import { google } from "googleapis";
import fetch from "node-fetch"; // If using node-fetch
import cors from "cors";

dotenv.config();
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Function to decode base64 Gmail message data
function cleanData(data) {
  const buff = Buffer.from(data, "base64");
  return buff.toString("ascii");
}

// Function to refresh access token using refresh token
async function refreshAccessToken(refreshToken) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "http://localhost:3000/oauth2callback"
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials.access_token;
}

// Route to generate Google OAuth URL
app.get("/", (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "http://localhost:3000/oauth2callback"
  );
  const scopes = ["https://www.googleapis.com/auth/gmail.readonly"];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
  });
  res.json({ url: authUrl });
});

// OAuth callback route to handle access and refresh tokens
app.get("/oauth2callback", async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "http://localhost:3000/oauth2callback"
  );
  const { tokens } = await oauth2Client.getToken(req.query.code);
  oauth2Client.setCredentials(tokens);
  res.json({ tokens });
});

// List Gmail messages using access token
app.post("/list", async (req, res) => {
  let { ACCESS_TOKEN, REFRESH_TOKEN } = req.body;

  let messages = await fetch(
    "https://www.googleapis.com/gmail/v1/users/me/messages",
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    }
  );

  if (messages.status === 401) {
    ACCESS_TOKEN = await refreshAccessToken(REFRESH_TOKEN);
    messages = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/messages",
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
  }

  const messagesData = await messages.json();
  const messageArray = messagesData.messages.map((message) => ({
    ...message,
    link: `http://localhost:3000/message/${message.id}`,
  }));

  res.json({ messages: messageArray });
});

// Fetch specific Gmail message using ID
app.post("/message/:id", async (req, res) => {
  const { id } = req.params;
  let { ACCESS_TOKEN, REFRESH_TOKEN } = req.body;

  let message = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages/${id}`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    }
  );

  if (message.status === 401) {
    ACCESS_TOKEN = await refreshAccessToken(REFRESH_TOKEN);
    message = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${id}`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
  }

  const messageData = await message.json();
  let messageText = "";

  if (messageData.payload.body.data) {
    messageText = cleanData(messageData.payload.body.data);
  } else if (messageData.payload.parts) {
    const lastPart = messageData.payload.parts.slice(-1)[0];
    messageText = cleanData(lastPart.body.data);
  }

  res.json({ data: messageText });
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
