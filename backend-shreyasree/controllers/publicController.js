// controllers/publicController.js: open data the landing and guide pages need. No login required.
const asyncHandler = require("../utils/asyncHandler");
const Category = require("../models/Category");
const Rate = require("../models/Rate");

exports.categories = asyncHandler(async (req, res) => res.json(await Category.find().sort({ id: 1 })));

exports.rates = asyncHandler(async (req, res) => res.json(await Rate.find().sort({ id: 1 })));
