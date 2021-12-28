require('dotenv').config();
const fs = require('fs');
const path = require('path');
const B2 = require('backblaze-b2');
const b2 = new B2({
    applicationKeyId: process.env.B2_KEY_ID,
    applicationKey: process.env.B2_KEY
});

module.exports.UploadResdisDatabaseSnapshot = async (request) => {
    try {
        const fileName = request.fileName;
        const filePath = path.join(process.cwd() + `${fileName}`);
        const contentBuffer = fs.readFileSync(filePath);

        await b2.authorize();
        let response = await b2.getUploadUrl({ bucketId: process.env.B2_REDIS_BACKUP_BUCKET_ID });
        let uploadURL = response.data.uploadURL;
        let authToken = response.data.authorizationToken;

        //upload
        await b2.uploadFile({
            uploadUrl: uploadURL,
            uploadAuthToken: authToken,
            fileName: fileName,
            data: contentBuffer
        });

        // remove the uploaded file from server 
        if(fs.existsSync(filePath), (err) => {
            if (err) {
                console.log('error while deleting file \n', error);
            }
            console.log('RDB file deleted Date:', Date.now() );
        });
    } catch (error) {
        console.log(error);
    }
}