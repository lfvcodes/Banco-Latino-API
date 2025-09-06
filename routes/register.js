const express = require("express");
const bcrypt = require("bcryptjs");
const dbConnect = require("../dbConnect");
const router = express.Router();

router.post("/registro", async (req, res) => {
	try {
		const {
			document_number,
			document_rif,
			first_name,
			last_name,
			email,
			birth_date,
			phone_number,
			password,
		} = req.body;

		// Validaciones básicas
		if (!document_number || !document_rif || !first_name || !last_name || !email || !birth_date || !phone_number || !password) {
			return res.status(400).json({ message: "Todos los campos son requeridos" });
		}

		const connection = await dbConnect();
		const hashedPassword = await bcrypt.hash(password, 10);

		// Insertar en people
		const [result] = await connection.execute(
			`INSERT INTO people (dni, fiscal_dni, name, lastname, birthdate, email, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[document_number, document_rif, first_name, last_name, birth_date, email, phone_number]
		);
		const id_people = result.insertId;

		// Generar username y account
		const username = email;
		const account = Math.floor(Math.random() * 1e20).toString();

		// Insertar en user
		await connection.execute(
			`INSERT INTO user (id_people, username, account, psw, status) VALUES (?, ?, ?, ?, 1)`,
			[id_people, username, account, hashedPassword]
		);

		res.json({
			message: "Registro exitoso",
			user: {
				id_people,
				username,
				account,
				document_number,
				document_rif,
				first_name,
				last_name,
				email,
				birth_date,
				phone_number,
			},
		});

	} catch (error) {
		console.error("Error en registro:", error);
		res.status(500).json({ message: "Error interno del servidor", error: error.message });
	}
});

module.exports = router;
