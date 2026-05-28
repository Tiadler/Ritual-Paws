// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RitualPawsCardNFT is ERC721, ERC721URIStorage {
    uint256 private _nextTokenId = 1;

    constructor() ERC721("Ritual Paws Card", "RPWC") {}

    function mintCard(string calldata metadataURI) external returns (uint256 tokenId) {
        tokenId = _nextTokenId;
        _nextTokenId += 1;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
