const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const dbConnect = require("../dbConnect");

router.get("/", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const pageSize = parseInt(req.query.pageSize) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * pageSize;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const db = await dbConnect();
    const query = `SELECT id_movement AS id, amount,description,
      DATE(date_record) AS date,TIME(date_record) AS hour,
       IF(u.account = m.account_origin,'- Debito','+ Credito') AS movtype
      FROM movement m
      JOIN user u ON m.account_origin = u.account OR m.account_dest = u.account
      WHERE u.id_user = ? order BY m.date_record DESC LIMIT ?`;

    const [rows] = await db.execute(query, [decoded.id, pageSize]);

    return res.json(rows);
  } catch (error) {
    console.error("Error en obtener movimientos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});
module.exports = router;