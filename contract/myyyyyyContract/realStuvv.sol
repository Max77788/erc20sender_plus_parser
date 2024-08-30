// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PreMintedToken
 * @dev ERC20 token that is pre-minted with a total supply of 100 trillion tokens.
 * The owner can then distribute these tokens by sending specified amounts to specified addresses.
 */
contract SpammyGranny is ERC20, Ownable {

    uint256 private constant INITIAL_SUPPLY = 100000000000000 * 10**18; // 100 trillion tokens with 18 decimals

    /**
     * @dev Constructor that initializes the token with a name, symbol, and pre-mints the initial supply to the owner.
     * @param name The name of the token.
     * @param symbol The symbol of the token.
     */
    constructor(string memory name, string memory symbol) ERC20(name, symbol) Ownable(msg.sender) {
        // Mint the initial supply to the owner's address.
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @notice Sends a specified amount of tokens to the specified address.
     * @dev Only the owner can call this function.
     * @param amount The amount of tokens to send.
     * @param recipient The address to send the tokens to.
     */
    function sendTokens(uint256 amount, address recipient) external onlyOwner {
        require(recipient != address(0), "Recipient address cannot be the zero address.");
        require(amount > 0, "Amount must be greater than 0.");
        require(balanceOf(owner()) >= amount, "Insufficient tokens in owner's account.");

        // Transfer the specified amount of tokens from the owner to the recipient.
        _transfer(owner(), recipient, amount*10**18);
    }

    /**
     * @notice Returns the total supply of the token.
     * @return The total supply of the token.
     */
    function getTotalSupply() external view returns (uint256) {
        return totalSupply();
    }

    /**
     * @notice Returns the balance of tokens owned by a particular address.
     * @param account The address to query the balance of.
     * @return The amount of tokens owned by the specified address.
     */
    function getBalanceOf(address account) external view returns (uint256) {
        return balanceOf(account);
    }
}

