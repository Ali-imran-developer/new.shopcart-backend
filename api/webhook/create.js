export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
  try {
    const event = req.headers["x-github-event"];
    const body = req.body;
    console.log("🔥 GitHub Webhook Event:", event);
    console.log("📦 Payload:", JSON.stringify(body, null, 2));
    return res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("❌ Error in webhook:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}
