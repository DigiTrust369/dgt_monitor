const express = require('express');
const addressCtrl = require('@controllers/address.controller');

const router = express.Router();

router
  .route('/validate/:network/:address')
  /**
   * @api {get} v1/address/validate/:network/:address Validate an address
   * @apiDescription Check if an address is valid or not
   * @apiVersion 1.0.0
   * @apiName ValidateAddress
   * @apiGroup address
   *
   * @apiSuccess {Number}  code               Status code
   * @apiSuccess {Object}  data               Address info
   * @apiSuccess  {Boolean} data.valid        Address validate status
   *
   * @apiError (Not Found 404)    NotFound     Blockchain's network not found in support list
   */
  .get(addressCtrl.validate);

router
  .route('/:network/:account_id/:address_id?')
  /**
   * @api {get} v1/address/:network/:account_id/:address_id Generate new deposit address
   * @apiDescription Generate a new address for :network
   * @apiVersion 1.0.0
   * @apiName GenerateDepositAddress
   * @apiGroup address
   *
   * @apiSuccess {Number}  code               Status code
   * @apiSuccess {Object}  data               Address info
   * @apiSuccess  {String}  data.address      Address
   * @apiSuccess  {String}  data.pubkey       PublicKey
   * @apiSuccess  {String}  data.path         HD Wallet Path
   * @apiSuccess  {String}  data.tag          Address's tag
   *
   * @apiError (Not Found 404)    NotFound     Blockchain's network not found in support list
   */
  .get(addressCtrl.generateAddress);

module.exports = router;
