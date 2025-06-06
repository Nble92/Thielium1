// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTgram is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    constructor(address initialOwner) ERC721("NFTgrams", "ATP") Ownable(initialOwner) {
        tokenCounter = 0;
    }

    function mintNFT(address recipient, string memory tokenURI) public returns (uint256) {
    require(bytes(tokenURI).length > 0, "Empty tokenURI");

    uint256 newItemId = tokenCounter;
    _safeMint(recipient, newItemId);
    _setTokenURI(newItemId, tokenURI);
    tokenCounter++;
    return newItemId;
}


    function _baseURI() internal view virtual override returns (string memory) {
        return "https://api.yourdomain.com/metadata/";
    }
}
