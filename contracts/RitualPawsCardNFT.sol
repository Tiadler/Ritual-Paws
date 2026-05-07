// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RitualPawsCardNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    event CardMinted(
        address indexed minter,
        uint256 indexed tokenId,
        string tokenURI
    );

    constructor() ERC721("Ritual Paws Card", "RPAWS") Ownable(msg.sender) {}

    function mintCard(string calldata tokenURI) external returns (uint256) {
        uint256 tokenId = ++nextTokenId;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit CardMinted(msg.sender, tokenId, tokenURI);

        return tokenId;
    }
}