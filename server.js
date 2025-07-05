import express from 'express'
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose'
import cors from 'cors'

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    // Start your app only after DB is connected
    app.listen(process.env.PORT || 5000, () => {
      console.log('Server started');
      

    });
  })
  .catch(err => console.error('Connection error:', err));

import ShortUrl from './models/shortUrl.js';
import { body, validationResult } from 'express-validator';
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet';


const app = express()
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.set('view engine','ejs')



const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 10, 
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	
})

//  middlewares 
app.use(helmet(),limiter) // using these middle ware to limit the users to miss use it 



//  -------------     APIS 

app.get('/',(req,res)=>{
  res.send("working")
})
  

app.get('/Short',async (req,res)=>{
    const shortUrls = await ShortUrl.find()
   //res.render('index',{shortUrls: shortUrls})
  res.send({shortUrls: shortUrls});
})

app.post('/shortUrls',async(req,res) => {
  const url = req.body.fullUrl
  if(!url) return res.send("url is required")

  await ShortUrl.create({full: url})
   res.redirect('/Short')
})



app.get('/:shortUrl',async(req,res) => {
   const shortUrl = await  ShortUrl.findOne( {short: req.params.shortUrl} );

   if(shortUrl == null) return res.sendStatus(404)

    shortUrl.clicks++ 
    shortUrl.save()

    res.redirect(shortUrl.full)
})

