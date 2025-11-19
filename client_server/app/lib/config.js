const SCRAPER_HOST = process.env.SCRAPER_HOST || "localhost";
const SCRAPER_PORT = process.env.SCRAPER_PORT || "37001";
const CHATBOT_SYSTEM_HOST = process.env.CHATBOT_SYSTEM_HOST || "localhost";
const CHATBOT_SYSTEM_PORT = process.env.CHATBOT_SYSTEM_PORT || "37002";

export default function getConfigs() {
  return {
    SCRAPER_HOST, SCRAPER_PORT, CHATBOT_SYSTEM_HOST, CHATBOT_SYSTEM_PORT
  }
}
