const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

const dbConnect = require('../dbConnect');

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validaciones básicas
    if (!username || !password) {
      return res.status(400).json({ message: "Usuario y contraseña requeridos" });
    }

    const db = await dbConnect();
    let user;
    if (process.env.DATABASE_TYPE === 'mysql') {
      const [rows] = await db.execute('SELECT account, username, psw FROM user WHERE username = ?', [username]);
      user = rows[0];
    } else if (process.env.DATABASE_TYPE === 'postgresql') {
      const result = await db.query('SELECT account, username, psw FROM user WHERE username = $1', [username]);
      user = result.rows[0];
    } else if (process.env.DATABASE_TYPE === 'sqlserver') {
      const result = await db.request().input('username', username).query('SELECT account, username, psw FROM user WHERE username = @username');
      user = result.recordset[0];
    }
  
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const valid = await bcrypt.compare(password, user.psw);
    if (!valid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.account, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(token);
    res.json({
      token,
      user: {
        account: user.account,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
