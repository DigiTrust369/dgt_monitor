module.exports = Object.freeze({
    ETH_ERC20_METHOD          : '0xa9059cbb',
    ETH_ERC20_AMOUNT_SIZE     : 64,
    ETH_ERC20_ADDR_SIZE       : 40,
    ETH_ERC20_BALANCE         : '0x70a08231',
    BNB_BEP20_METHOD          : '0xa9059cbb',
    BNB_BEP20_AMOUNT_SIZE     : 64,
    BNB_BEP20_ADDR_SIZE       : 40,
    BNB_BEP20_BALANCE         : '0x70a08231',
    PREPARE_STATUS            : {
      SUCCESS                 : 'success',
      FAILED                  : 'failed',
      SEND                    : 'sent'
    },
    SEND_RAW_STATUS           : {
      SUCCESS                 : 'success',
      FAILED                  : 'failed'
    },
    TRANSACTION_TYPE          : {
      WITHDRAWAL              : 'withdrawal',
      CENTRALIZE              : 'centralize',
      // special transaction to transfer native coin from withdrawal wallet to centralized address
      // to paid for the centralize token transaction
      CENTRALIZE_FEE          : 'merge_fund_fee'
    },
    TRANSACTION_STATUS        : {
      SUCCESS                 : 'success',
      FAILED                  : 'failed'
    },
});
