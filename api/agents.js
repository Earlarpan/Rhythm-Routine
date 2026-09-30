export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  // This tells your website frontend that the backend is 100% configured!
  return res.status(200).json({ configured: true });
}
