const express = require("express");
const commonController = require("../controllers/commonController");
const { ValidationEnquiry, handleValidationErrors } = require("../validators/inpurValidator");
const commonroutes = express.Router();

commonroutes.post("/enquiry", commonController.insertInquiry);

module.exports = commonroutes;