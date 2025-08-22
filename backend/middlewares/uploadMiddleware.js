const multer = require('multer');

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads/");        
    },
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req,file,cb)=>{
    const allowTypes = ['image/jpeg','image/jpg','image/png'];
    if(allowTypes.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(Error('Only jpeg, jpg, png formats are allowed'),false);
    }
}

const upload = multer({storage,fileFilter});

module.exports = upload;
