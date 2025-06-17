export default function handler(req, res) {
  if (req.method === "GET") {
    const mockData = {
      id: 1,
      event: "order_created",
      status: "received",
    };
    return res.status(200).json({
      success: true,
      message: "Webhook data fetched",
      data: mockData,
    });
  } else {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed",
    });
  }
}
