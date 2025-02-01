const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadBase64ToS3 = async (base64Data, fileName) => {
  try {
    const contentTypeMatch = base64Data.match(/^data:([^;]+);base64,/);

    let contentType = "";
    if (contentTypeMatch) {
      contentType = contentTypeMatch[1];
    }

    // Remove the data prefix based on content type
    let base64Content = "";
    if (contentType === "application/pdf") {
      base64Content = base64Data.replace(/^data:application\/pdf;base64,/, "");
      const removeExtension = (filename) => {
        return filename.replace(/\.pdf$/i, "");
      };
      fileName = removeExtension(fileName);
    } else if (contentType === "image/svg+xml") {
      base64Content = base64Data.replace(/^data:image\/svg\+xml;base64,/, "");
      // Ensure .svg extension for SVG files
      if (!fileName.toLowerCase().endsWith(".svg")) {
        fileName = `${fileName}.svg`;
      }
    } else {
      base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, "base64");

    // Replace spaces with underscores in the filename
    const sanitizedFileName = fileName.replace(/\s+/g, "_");
    const key = `projects/${Date.now()}_${sanitizedFileName}`;

    console.log(fileName, contentType);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentEncoding: "base64",
    });

    await s3Client.send(command);
    return {
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      key: key,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
};

const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("S3 delete error:", error);
    throw new Error("Failed to delete file from S3");
  }
};

module.exports = { uploadBase64ToS3, deleteFromS3 };
