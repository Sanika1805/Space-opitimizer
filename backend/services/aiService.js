const axios = require("axios");

async function getPriority(data) {
  const response = await axios.post(
    "http://127.0.0.1:8000/predict",
    data
  );
  return response.data;
}

module.exports = { getPriority };
