pragma solidity 0.4.21;

import "../../contracts/Payroll.sol";


contract PayrollMock is Payroll {
    uint private _mockTime = now;

    function PayrollMock (uint256 _timeframe, uint256 _trialPeriod) Payroll (_timeframe, _trialPeriod) public {}

    function getTimestampPublic() public constant returns (uint256) { return _mockTime; }
    function mockUpdateTimestamp() public { _mockTime = now; }
    function mockSetTimestamp(uint i) public { _mockTime = i; }
    function getTimestamp() internal constant returns (uint256) { return _mockTime; }
}
