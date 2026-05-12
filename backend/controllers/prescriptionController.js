const { processDocAI, processVision } = require("../services/googleService");

exports.upload = async (req, res) => {
  const filePath = req.file.path;

  let text;

  try {
    text = await processDocAI(filePath);
  } catch {
    text = await processVision(filePath);
  }

  const medicines = text.split("\n")
    .filter(l => l.match(/mg|tablet|capsule/i))
    .map(l => ({ name: l }));

  res.json({ medicines });
};