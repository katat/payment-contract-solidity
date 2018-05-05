const Payroll = artifacts.require('PayrollMock')
const moment = require('moment')

contract('Payroll', function([employer, employee]) {
  describe('standard interaction flow', function () {
    let payroll
    const timeframe = moment().add(4, 'weeks').unix()
    const trialPeriod = moment().add(2, 'weeks').unix()

    before(async () => {
      payroll = await Payroll.new(timeframe, trialPeriod);
      // payroll = await Payroll.new(1, 2);
    });
    it('deposit', async () => {
      const transferValue = web3.toWei(1, 'Ether')
      await payroll.deposit({ value: transferValue, from: employer })
      const balance = await payroll.getBalance()
      assert.equal(balance.valueOf(), transferValue)
    });
    it('hand shake', async () => {
      await payroll.handShake({ from: employee })
      const _startTime = await payroll.startTime.call()
      assert(_startTime)
      const _employee = await payroll.employee.call()
      assert.equal(_employee, employee)
      // console.log(startTime)
      // assert.equal(balance.valueOf(), transferValue)
    });
    it('request payment fails when it is in trial period', async () => {
      await payroll.pay({from: employee}).then(() => {
        assert.fail()
      }).catch(err => {
        assert.equal(err.message, 'VM Exception while processing transaction: revert')
      })
    });
    it('request payment when just passed trial period', async () => {
      const mocktime = trialPeriod
      await payroll.mockSetTimestamp(mocktime)
      const preAmount = await web3.eth.getBalance(employee)

      let balance = await payroll.getBalance()
      assert.equal(balance.valueOf(), 1e+18)

      await payroll.pay({from: employee})

      balance = await payroll.getBalance()
      assert.equal(balance.valueOf(), 5e+17)

      const postAmount = await web3.eth.getBalance(employee)
      const amount = postAmount - preAmount
      assert(amount > 0)
    });
    it('request payment after timeframe passed', async () => {
      const mocktime = moment().add(2, 'months').unix() + trialPeriod
      await payroll.mockSetTimestamp(mocktime)
      const preAmount = await web3.eth.getBalance(employee)

      let balance = await payroll.getBalance()
      assert.equal(balance.valueOf(), 5e+17)

      await payroll.pay({from: employee})

      balance = await payroll.getBalance()
      assert.equal(balance.valueOf(), 0)

      const postAmount = await web3.eth.getBalance(employee)
      const amount = postAmount - preAmount
      assert(amount > 0)

      const completed = await payroll.isCompleted()
      assert(completed)
    });
  });
  describe('terminate contract', function () {
    let payroll
    beforeEach(async function () {
      timeframe = moment().add(4, 'weeks').unix()
      trialPeriod = moment().add(2, 'weeks').unix()
      payroll = await Payroll.new(timeframe, trialPeriod)
      await payroll.deposit({ value: web3.toWei(1, 'Ether'), from: employer })
      await payroll.handShake({ from: employee })
    });
    it('complete contract', async () => {
      const preAmount = await web3.eth.getBalance(employee)

      const preBalance = await payroll.getBalance()
      assert.equal(preBalance.valueOf(), web3.toWei(1, 'Ether'))

      await payroll.complete()

      const postBalance = await payroll.getBalance()
      assert.equal(postBalance.valueOf(), 0)

      const postAmount = await web3.eth.getBalance(employee)
      assert.equal(postAmount.valueOf() > preAmount.valueOf(), true)

      const completed = payroll.markCompleted.call()
      assert(completed.valueOf())
    });
    it('cancel contract and refund', async () => {
      const preAmount = await web3.eth.getBalance(employer)

      const preBalance = await payroll.getBalance()
      assert.equal(preBalance.valueOf(), web3.toWei(1, 'Ether'))

      await payroll.cancel()

      const postBalance = await payroll.getBalance()
      assert.equal(postBalance.valueOf(), 0)

      const postAmount = await web3.eth.getBalance(employer)
      assert.equal(postAmount.valueOf() > preAmount.valueOf(), true)

      const completed = payroll.markCompleted.call()
      assert(completed.valueOf())
    });
  });
  it('exchange rate in usd', async () => {

  });
  it('get status', async () => {

  });
});
