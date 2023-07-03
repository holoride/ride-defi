// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// Imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GenericERC20 is ERC20 {

  /**
   * @notice Constructor
   * @param _name Name of the token
   * @param _symbol Symbol of the token
   */
  constructor (
    string memory _name, 
    string memory _symbol
  ) ERC20(_name, _symbol) {
    // Mint one billion tokens
    _mint(msg.sender, 1_000_000_000 * 10**18);
  }

}
