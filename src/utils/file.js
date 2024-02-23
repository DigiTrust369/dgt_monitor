const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const zlib = require('zlib');
const AWS = require('aws-sdk');
const { env, rsaKeys, awsCfg } = require('@config/vars');
const gzip = util.promisify(zlib.gzip);
const unzip = util.promisify(zlib.unzip);
const s3 = new AWS.S3({
    accessKeyId: awsCfg.accessKey,
    secretAccessKey: awsCfg.secret
});

/** Cipher data using random password and nonce, this password will be encrypted with RSA pubkey
  * @params data in Buffer.
  * @outputs encrypted data in Buffer
**/
const encrypt = async (data) => {
  let compress = await gzip(data);
  let key = crypto.randomBytes(24);
  let nonce = crypto.randomBytes(16);
  let secret = crypto.publicEncrypt(Buffer.from(rsaKeys.public, 'hex'), key);
  let cipher = crypto.createCipheriv('aes-192-cbc', key, nonce);
  let encrypted = Buffer.concat([secret, nonce, cipher.update(compress), cipher.final()]);
  return encrypted;
}

/** Decipher data, password is decrypted using RSA private key.
  * @params data in Buffer.
  * @outputs encrypted data in Buffer
**/
const decrypt = async (data) => {
  let secret = data.slice(0, 256);
  let nonce = data.slice(256, 272);
  let encrypted = data.slice(272);
  let key = crypto.privateDecrypt(Buffer.from(rsaKeys.private, 'hex'), secret);
  let cipher = crypto.createDecipheriv('aes-192-cbc', key, nonce);
  let decrypted = await unzip(Buffer.concat([cipher.update(encrypted), cipher.final()]));
  return decrypted;
}

/** Upload the encrypted data to aws s3
  * @params fileName: name of file, data: object
  * @outputs file path
**/
const upload = async (fileName, data) => {
  let body = await encrypt(Buffer.from(JSON.stringify(data)));
  if (env === 'development') {
    fs.writeFileSync('./public/files/' + fileName + '.encrypted', body);
    fs.writeFileSync('./public/files/' + fileName + '.json', Buffer.from(JSON.stringify(data)));
  }

  let params = {
     Bucket : awsCfg.bucket,
     Key    : fileName,
     Body   : body
   };

   let res = await s3.upload(params).promise();
   return {
     fileName : fileName,
     path     : res.Location
   }
}

/** Download file from s3 and decrypt to buffer
  * @params fileName: name of file
  * @outputs file data Buffer
**/
const download = async (fileName) => {
  let params = {
    Bucket: awsCfg.bucket,
    Key   : fileName
  }

  let data = await s3.getObject(params).promise();
  return decrypt(data.Body);
}

module.exports = {
  encrypt : encrypt,
  decrypt : decrypt,
  upload  : upload,
  download: download
};
