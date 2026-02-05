import axios from "axios";

const API_URL = "http://localhost:3000/api/ai/priority";

export async function getPriority(data) {
  const response = await axios.post(API_URL, data);
  return response.data;
}
