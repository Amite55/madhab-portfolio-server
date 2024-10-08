const express = require('express');
const cors = require('cors');
const nodemailer = require("nodemailer");
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware ======
app.use(cors(
  {
    // origin: ['https://madhab-portfolio-client.vercel.app', 'http://localhost:5173']
    origin: "*"

  }
));
app.use(express.json());


// send email =============
const sendEmail =  (emailAddress, emailData) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.TRANSPORTER_EMAIL,
      pass: process.env.TRANSPORTER_PASS,
    },
  });

  // const mailBody = {
  //   from: `"MADHAB MOZUMDER" <${process.env.TRANSPORTER_EMAIL}>`, // sender address
  //   to: emailAddress, // list of receivers
  //   subject: emailData.subject, // Subject line
  //   html: emailData.message, // html body
  // }

  const mailBody = {
    from: `"${emailData.username}" <${process.env.TRANSPORTER_EMAIL}>`, 
    to: process.env.TRANSPORTER_EMAIL, 
    subject: `Message from ${emailData.username} (${emailAddress})`, 
    replyTo: emailAddress,
    html: `<p><strong>From:</strong> ${emailData.username} (${emailAddress})</p>
           <p><strong>Message:</strong> ${emailData.message}</p>
           <p><strong>Phone:</strong> ${emailData.phoneNumber}</p>`, 
  };

  transporter.sendMail(mailBody, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email Send :' + info.response);
    }
  });


}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g2fbusk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const contactCollection = client.db('madhabPortfolio').collection('contactInfo');


    // save contact info ================
    app.post("/contacts", async (req, res) => {
      const contactData = req.body;
      const result = await contactCollection.insertOne(contactData);
      sendEmail(contactData?.email, {
        subject: contactData?.subject,
        username: contactData?.username,
        phoneNumber: contactData?.phoneNumber,
        message:`Hello!  ${contactData?.message}.`
      })
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get("/", (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`Madhab Mazumder server is running ${port}`);
})