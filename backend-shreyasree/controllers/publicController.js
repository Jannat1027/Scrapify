const asyncHandler = require("../utils/asyncHandler");
const Category = require("../models/Category");
const Rate = require("../models/Rate");

exports.categories = asyncHandler(async (req, res) => res.json(await Category.find().sort({ id: 1 })));

exports.rates = asyncHandler(async (req, res) => res.json(await Rate.find().sort({ id: 1 })));
