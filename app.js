const express = require('express');
const ejs = require('ejs');
const path = require('path');

// AWS
const multer = require('multer');
const aws = require('aws-sdk');
const  multerS3 = require('multer-s3');
const s3 = require('s3');

// AWS update for Keys
aws.config.update({
 accessKeyId: '', 
secretAccessKey:'',
region:' '
});


// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/uploadimagenow',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'uploadimagenow',
    acl: 'public-read',
    metadata: function(req, file, cb){
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  
  }),
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

module.exports = upload;

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init app
const app = express();

// EJS
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));

app.get('/', (req, res) => res.render('index'));

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.render('index', {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        res.render('index', {
          msg: 'Successfully uploaded photo.!',
          file: `uploads/${req.file.filename}`,
        });
      }
    }
  });
});



const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));