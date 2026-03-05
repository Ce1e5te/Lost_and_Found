const express = require("express");
const { pool } = require("./db");
const { expandQuery } = require("./synonyms");

const router = express.Router();

function pick(obj, keys) {
  const out = {};
  for (const k of keys) out[k] = obj[k];
  return out;
}

function badRequest(res, message) {
  return res.status(400).json({ ok: false, message });
}

router.get("/items", async (req, res) => {
  try {
    const type = req.query.type ? String(req.query.type) : "";
    const category = req.query.category ? String(req.query.category) : "";
    const q = req.query.q ? String(req.query.q) : "";

    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 30)));
    const offset = (page - 1) * pageSize;

    const where = [];
    const params = [];

    if (type) {
      where.push("type = ?");
      params.push(type);
    }
    if (category) {
      where.push("category = ?");
      params.push(category);
    }

    const terms = expandQuery(q);
    if (terms.length) {
      const likes = [];
      for (const t of terms.slice(0, 12)) {
        likes.push("(title LIKE ? OR location LIKE ? OR description LIKE ?)");
        const like = `%${t}%`;
        params.push(like, like, like);
      }
      where.push(`(${likes.join(" OR ")})`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
        SELECT
          id,
          type,
          title,
          category,
          DATE_FORMAT(time, '%Y-%m-%d') AS time,
          location,
          description,
          contact_name AS contactName,
          contact,
          image_url AS imageUrl,
          created_at AS createdAt
        FROM items
        ${whereSql}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...params, pageSize, offset]
    );

    res.json({ ok: true, data: rows, page, pageSize });
  } catch (err) {
    res.status(500).json({ ok: false, message: "服务器错误", error: String(err) });
  }
});

router.post("/items", async (req, res) => {
  try {
    const body = req.body || {};
    const payload = pick(body, [
      "type",
      "title",
      "category",
      "time",
      "location",
      "description",
      "contactName",
      "contact",
      "imageUrl",
    ]);

    const required = [
      ["type", "信息类型"],
      ["title", "物品名称"],
      ["category", "物品类别"],
      ["time", "时间"],
      ["location", "地点"],
      ["contactName", "联系人"],
      ["contact", "联系方式"],
    ];

    for (const [key, label] of required) {
      if (!payload[key] || String(payload[key]).trim() === "") {
        return badRequest(res, `${label}不能为空`);
      }
    }

    if (!["lost", "found"].includes(payload.type)) {
      return badRequest(res, "type 必须是 lost 或 found");
    }

    if (!["card", "digital", "daily", "other"].includes(payload.category)) {
      return badRequest(res, "category 不合法");
    }

    const [result] = await pool.query(
      `
        INSERT INTO items
          (type, title, category, time, location, description, contact_name, contact, image_url)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.type,
        payload.title,
        payload.category,
        payload.time,
        payload.location,
        payload.description || null,
        payload.contactName,
        payload.contact,
        payload.imageUrl || null,
      ]
    );

    const insertedId = result.insertId;
    const [rows] = await pool.query(
      `
        SELECT
          id,
          type,
          title,
          category,
          DATE_FORMAT(time, '%Y-%m-%d') AS time,
          location,
          description,
          contact_name AS contactName,
          contact,
          image_url AS imageUrl,
          created_at AS createdAt
        FROM items
        WHERE id = ?
        LIMIT 1
      `,
      [insertedId]
    );

    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, message: "服务器错误", error: String(err) });
  }
});

module.exports = { itemsRouter: router };

