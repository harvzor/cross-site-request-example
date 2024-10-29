import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import https from "https";
import fs from "fs";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    // Sets `Access-Control-Allow-Credentials: true` header
    credentials: true,
    // Otherwise error: Response body is not available to scripts (Reason: CORS No Allow Credentials)
    // Because * is not allowed to send cookies with requests cross origin.
    origin: 'https://attacker.local',
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type,custom-header'
};

// Requires for complex requests.
app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.cookie('secure-cookie', 'secure-cookie-value', {
        // Only 'none' seems to work with synchronous POST
        // Also, the Fetch docs say:
        // > Note that if a cookie's SameSite attribute is set to Strict or Lax, then the cookie will not be sent cross-site, even if credentials is set to include.
        sameSite: 'none',
        secure: true,
        maxAge: 86400000,
        domain: '.defender.local', // Does not seem to matter.
        // https://stackoverflow.com/a/67001424 claims that this is important, but in my testing, it did not make a difference.
        httpOnly: false,
    });
    
    res.send('Cookie set!');
});

app.get('/get', (req, res) => {
    res.json({
        cookies: req.cookies,
        requestQuery: req.query,
    });
});

app.post('/post', (req, res) => {
    res.json({
        cookies: req.cookies,
        requestBody: req.body,
    });
});

const httpsOptions = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem')
}

https.createServer(httpsOptions, app).listen(port, 'defender.local', () => {
    console.log('server running at ' + port)
});

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });