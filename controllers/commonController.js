const path = require('path');
const dbManager = require('../config/db');
const { sendEnquiryEmailHelper } = require('../utils/emailservices');

const insertInquiry = async (req, res) => {
  const { name, mail, phone, message } = req.body;
  const input = [name, mail, phone, message];

  let dbResult = null;
  let dbError = null;

  // Attempt database operation, but don't fail response if it errors
  try {
    dbResult = await dbManager.executeProcedure('insert_inquiry', input, 'lumora');
  } catch (err) {
    dbError = err.message;
    console.error('DB insert error:', dbError);
  }

  // Email or brochure logic
  try {
    if (phone && message !== 'Brochure request') {
      await sendEnquiryEmailHelper({ name, mail, phone, message });
      console.log('Enquiry email sent.');

      return res.status(200).json({
        message: 'Enquiry submitted successfully',
        success: true,
        dbSuccess: !dbError,
        dbMessage: dbError || 'Inserted to DB successfully',
        data: dbResult,
      });
    } else {
      await sendEnquiryEmailHelper({ name, mail, phone, message });
      console.log('Brochure request email sent.');

      return res.status(200).json({
        message: 'Enquiry submitted successfully',
        success: true,
        dbSuccess: !dbError,
        dbMessage: dbError || 'Inserted to DB successfully',
        data: dbResult,
      });
    }
  } catch (emailErr) {
    console.error('Email error:', emailErr.message);

    // Respond even if email fails
    return res.status(200).json({
      message: 'Enquiry processed with email error',
      success: false,
      emailError: emailErr.message,
      dbSuccess: !dbError,
      dbMessage: dbError || 'Inserted to DB successfully',
      data: dbResult,
    });
  }
};

module.exports = { insertInquiry };
