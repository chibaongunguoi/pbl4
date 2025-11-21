const MONGODB_URI = process.env.DB_CONNECTION_STRING || "mongodb://localhost:27017/pbl4_db";
const SCRAPER_HOST = process.env.SCRAPER_HOST || "localhost";
const SCRAPER_PORT = process.env.SCRAPER_PORT || "37001";
const CHATBOT_SYSTEM_HOST = process.env.CHATBOT_SYSTEM_HOST || "localhost";
const CHATBOT_SYSTEM_PORT = process.env.CHATBOT_SYSTEM_PORT || "37002";
const FILE_SYSTEM_HOST = process.env.FILE_SYSTEM_HOST || "localhost";
const FILE_SYSTEM_PORT = process.env.FILE_SYSTEM_PORT || "37003";

export default function getConfigs() {
  return {
    MONGODB_URI,
    SCRAPER_HOST, SCRAPER_PORT,
    CHATBOT_SYSTEM_HOST, CHATBOT_SYSTEM_PORT,
    FILE_SYSTEM_HOST, FILE_SYSTEM_PORT,
  }
}
