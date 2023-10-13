import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { google } from "googleapis";
dotenv.config();


const app = express();
const PORT = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function cleanData(message){
  const d = message.data;
  const buff = Buffer.from(d, 'base64');
  const text = buff.toString('ascii');
  return text;
}


// Refresh access token
async function refreshAccToken() {
  const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "http://localhost:3000/oauth2callback"
);
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});
const newToken = await oauth2Client.refreshAccessToken();
console.log(newToken);
return newToken;
}

// use refresh_token to get new access_token
let REFRESH_TOKEN = "";
let ACCESS_TOKEN = "";



app.get("/", async(req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "http://localhost:3000/oauth2callback"
    
  );
  const scopes = ["https://www.googleapis.com/auth/gmail.readonly"];
  // This generates a url that asks for permission for the mail activity.readonly scope
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", 
    scope: scopes,
    include_granted_scopes: true,
  });
  res.writeHead(301, { Location: authorizationUrl });
  console.log(authorizationUrl);
  res.end();
});


app.get('/oauth2callback', async(req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "http://localhost:3000/oauth2callback"
  );

  const { tokens } = await oauth2Client.getToken(req.query.code);
  console.log(req.query,tokens);
  oauth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10,
  });
  // console.log(response.data);
  ACCESS_TOKEN = tokens.access_token;
  REFRESH_TOKEN = tokens.refresh_token;
  res.send(response.data);
})


app.get('/list',async (req, res)=>{  
  let messages = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages', {
    "method": "GET",
    "headers": {
      authorization: `Bearer ${ACCESS_TOKEN}`
    }
  })
  if(messages.status ==401){
    ACCESS_TOKEN = (await refreshAccToken()).credentials.access_token;
    messages = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages', {
    "method": "GET",
    "headers": {
      authorization: `Bearer ${ACCESS_TOKEN}`
    }
  })
}
  messages = await messages.json();
  console.log(messages);
  const arr = await Object.values(messages)[0].map((message)=>{
        message.link = `http://localhost:3000/message/${message.id}`;
        return message;
  })
  res.json({arr});
})
// ---------------------------------
app.get('/message/:id',async (req, res)=>{
  const {id} = req.params;
  let message = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${id}`,{
    "method": "GET",
    "headers": {
      authorization: `Bearer ${ACCESS_TOKEN}`
    }
  });
  // if(message.status==401){
  //   res.send("Sorry")
  // }
  // create a function to get message with url and ACCESS_TOKEN
  // console.log(await message.json());
  if((message.status ==401)){
    ACCESS_TOKEN = (await refreshAccToken()).credentials.access_token;
    message = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${id}`,{
    "method": "GET",
    "headers": {
      authorization: `Bearer ${ACCESS_TOKEN}`
    }
  });
  }

  const mess = await message.json();
console.log(mess);
  // Data is in either parts or body
  let messageText = '';
  if(mess.payload.body.data){
    messageText+=cleanData(mess.payload.body);
  }
  else if(mess.payload.parts){
    messageText+=cleanData(mess.payload.parts[mess.payload.parts.length-1].body);
  }
  // messageText+=cleanData(mess.raw);
  res.send(messageText);
})



app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

