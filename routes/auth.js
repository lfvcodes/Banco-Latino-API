const express = require("express");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const router = express.Router();
const dbConnect = require("../dbConnect");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Usuario y contraseña requeridos" });
  }

  try {
    const db = await dbConnect();
    let user;

    switch (process.env.DATABASE_TYPE) {
      case "mysql": {
        const query = `SELECT id_user,account, username, psw,p.name,p.lastname,
        saldo FROM user u 
        JOIN people p ON u.id_people = p.id_people
         WHERE username = ?`;
        const [rows] = await db.execute(
          query,
          [username]
        );
        user = rows[0];
        break;
      }
      case "postgresql": {
        const query = `SELECT id_user,account, username, psw,p.name,p.lastname,
        saldo FROM user u 
        JOIN people p ON u.id_people = p.id_people
         WHERE username = $1`;
        const result = await db.query(
          query,
          [username]
        );
        user = result.rows[0];
        break;
      }
      case "sqlserver": {
        const query = `SELECT id_user,account, username, psw,p.name,p.lastname,
        saldo FROM user u 
        JOIN people p ON u.id_people = p.id_people
         WHERE username = @username`;
        const result = await db
          .request()
          .input("username", username)
          .query(query);
        user = result.recordset[0];
        break;
      }
      default:
        return res.status(500).json({ message: "Tipo de base de datos no soportado" });
    }

    if (!user || !user.psw) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isValidPassword = await argon2.verify(user.psw, password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const payload = { 
      id: user.id_user,
      username: user.username,
      name:user.name,
      saldo:user.saldo,
      lastname:user.lastname,
      pid:0
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "Lax",
      maxAge: 3600000, // 1 hora
    });

    return res.json({
      access:true
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
});

module.exports = router;