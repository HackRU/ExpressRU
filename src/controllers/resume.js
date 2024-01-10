const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const multer = require('multer');
const { checkFileExists_s3Bucket, uploadBufferToS3 } = require('../util.js');

const file_filter = (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(null, false); // reject file
    }
};

const memoryStorage = multer.memoryStorage();
const upload = multer({
    storage: memoryStorage,
    fileFilter: file_filter,
    limits: { fileSize: 10 * 1024 * 1024 } // Limit to 10MB 
});


exports.upload_resume = [upload.single('resume'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // check to see if the user has already uploaded their resume
        if (await checkFileExists_s3Bucket(process.env.RESUME_BUCKET, req.user.email + ".pdf")) {
            return res.status(409).send("this user has already uploaded a resume.");
        } else {
            await uploadBufferToS3(process.env.RESUME_BUCKET, req.user.email + ".pdf", req.file.buffer, req.file.mimetype);

            // After processing, nullify the buffer reference
            req.file.buffer = null;

            return res.send('File uploaded successfully.');
        }
    } catch(err) {
        return res.status(500).send(err.message);
    }
}]