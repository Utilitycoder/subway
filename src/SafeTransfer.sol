// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";

library SafeTransfer {
    function safeTransfer(IERC20 token, address to, uint256 amount) internal {
        require(address(token) != address(0), "SafeTransfer: token is the zero address");
        require(to != address(0), "SafeTransfer: transfer to the zero address");

        bool sent = token.transfer(to, amount);
        require(sent, "SafeTransfer: Token transfer failed");
    }
}
