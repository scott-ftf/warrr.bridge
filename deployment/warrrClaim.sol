// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WarrrTransferRecorder is Ownable {
    IERC20 public wARRRToken = IERC20(0xcdaf240c90f989847c56ac9dee754f76f41c5833);
    address public wARRRWithdrawAddress = 0xabf1a0039c3e5741d1c816a1685b455a06e0dad4;

    event TransferRecorded(uint256 indexed amount, string sapling);

    function recordTransfer(string memory sapling) public {
        require(bytes(sapling).length > 0, "Sapling address cannot be empty");
        
        uint256 approvedAmount = wARRRToken.allowance(msg.sender, address(this));
        require(approvedAmount > 0, "No approved wARRR tokens to transfer");
        
        require(wARRRToken.transferFrom(msg.sender, address(this), approvedAmount), "Transfer failed");
        emit TransferRecorded(approvedAmount, sapling);
    }
    function withdrawAll() external onlyOwner {
        uint256 balance = wARRRToken.balanceOf(address(this));
        require(balance > 0, "No wARRR balance to withdraw");
        require(wARRRToken.transfer(wARRRWithdrawAddress, balance), "Withdrawal failed");
    }
}
