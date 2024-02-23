const express = require('express');
const monitorCtrl = require('@controllers/monitor.controller');
const router = express.Router();

router
  .route('/set-block')
  .post(monitorCtrl.setBlock);

router
  .route('/reports')
  .get(monitorCtrl.report);

module.exports = router;
