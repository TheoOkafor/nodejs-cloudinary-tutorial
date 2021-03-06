const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const DataUri = require('datauri');

cloudinary = require('cloudinary').v2;

dotenv.config();
const dataUri = new DataUri();

const {
  CLOUDINARY_API_KEY,
  CLOUDINARY_AUTHORIZATION,
  CLOUDINARY_CLOUD_NAME,
} = process.env;

cloudinary.config({ 
  cloud_name: CLOUDINARY_CLOUD_NAME, 
  api_key: CLOUDINARY_API_KEY, 
  api_secret: CLOUDINARY_AUTHORIZATION
});

const upload = multer();
const app = express();

app.use(express.json());
app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  next();
});

const whitelist = [ 'http://localhost:5000' ];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.post('/cloud-upload', upload.single('file'), (request, response) => {
  let image = request.file;
  if (image) {
    image = dataUri.format(path.extname(image.originalname).toString(), image.buffer).content;
    cloudinary.uploader.upload(image, (error, result) => {
      if (error) {
        return response.status(500)
        .json({
          error: 'Failed to upload to the cloud',
          details: error,
        })
      }
      return response.status(200)
        .json({
          data: result,
        });
    });
  } else {
    return response.status(400)
      .json({
        error: 'Please add the image to be uploaded',
      });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Express server is running on ${PORT}`)
);
