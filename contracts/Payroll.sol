pragma solidity 0.4.21;


contract Payroll {
    address public owner;
    address public employee;
    uint256 public timeframe;
    uint256 public trialPeriod;
    uint256 public startTime;
    uint256 public endTimestamp;
    uint256 public endTrialTimestamp;
    bool public cancelled = false;
    bool public markCompleted = false;

    event _deposit(uint amount);
    event _handshake(address employee);
    event _completed();
    event _cancelled();
    event _pay(uint amount);

    function Payroll (uint256 _endTimestamp, uint256 _trialEndTimestamp) public {
      owner = msg.sender;
      endTimestamp = _endTimestamp;
      endTrialTimestamp = _trialEndTimestamp;
      startTime = getTimestamp();
      timeframe = _endTimestamp - getTimestamp();
      trialPeriod = _trialEndTimestamp - getTimestamp();
    }

    modifier onlyStarted() {
      require(startTime > 0);
      _;
    }

    modifier onlyOwner() {
      require(owner == msg.sender);
      _;
    }

    modifier onlyEmployee() {
      require(employee == msg.sender);
      _;
    }

    modifier notOwner() {
      require(owner != msg.sender);
      _;
    }

    modifier notTrialPeriod() {
      require(getTimestamp() >= startTime + trialPeriod);
      _;
    }

    modifier onlyTrialPeriod() {
      require(getTimestamp() < startTime + trialPeriod);
      _;
    }

    function handShake () notOwner public {
      employee = msg.sender;
      // startTime = now;
      emit _handshake(msg.sender);
    }

    function deposit() onlyOwner payable public {
      emit _deposit(msg.value);
    }

    function getBalance() constant public returns (uint) {
      return address(this).balance;
    }

    function getTimestamp() constant internal returns (uint256) {
      return now;
    }

    function isCompleted() constant public returns (bool) {
      if (markCompleted || passedTimeFrame()) {
        return true;
      }

      return false;
    }

    function passedTimeFrame() constant public returns (bool) {
      return getTimestamp() - startTime > timeframe;
    }

    function pay() onlyEmployee notTrialPeriod public {
      uint balance = address(this).balance;
      if (passedTimeFrame()) {
        employee.transfer(balance);
        emit _pay(balance);
      } else {
        uint amount = balance * (getTimestamp() - startTime) / timeframe;
        employee.transfer(amount);
        emit _pay(amount);
      }
    }

    function cancel() onlyOwner onlyTrialPeriod public {
      owner.transfer(address(this).balance);
      cancelled = true;
      emit _cancelled();
    }

    function complete() onlyOwner onlyStarted public {
      employee.transfer(address(this).balance);
      markCompleted = true;
      emit _completed();
    }

}
