const { DocumentProcessorServiceClient } = require("@google-cloud/documentai").v1;
const vision = require("@google-cloud/vision");
const fs = require("fs");

const docClient = new DocumentProcessorServiceClient();
const visionClient = new vision.ImageAnnotatorClient();

exports.processDocAI = async (filePath) => {
  const file = fs.readFileSync(filePath);

  const [result] = await docClient.processDocument({
    name: `projects/${process.env.PROJECT_ID}/locations/us/processors/${process.env.PROCESSOR_ID}`,
    rawDocument: {
      content: file.toString("base64"),
      mimeType: "application/pdf"
    }
  });

  return result.document.text;
};

exports.processVision = async (filePath) => {
  const [res] = await visionClient.textDetection(filePath);
  return res.fullTextAnnotation.text;
};