// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title RitualTom - one-wallet-one-cat MVP
/// @notice Each wallet can adopt exactly one cat. Feed/play/sleep/clean actions restore 20% and award linear EXP.
/// @dev Pet stats decay by 10% every 1 hour.
contract RitualTom {
    uint256 public constant ACTION_PRICE = 0.0015 ether;
    uint8 public constant ACTION_RECOVERY = 20;
    uint256 public constant EXP_PER_LEVEL = 100;

    // Decay setting:
    // Every 1 hour, each stat loses 10 points.
    // Example: 1 hour = -10%, 2 hours = -20%, 10 hours = 0%.
    uint256 public constant DECAY_INTERVAL = 1 hours;
    uint8 public constant DECAY_PER_INTERVAL = 10;

    address public owner;

    struct Pet {
        string name;
        string color;
        uint256 totalExp;
        uint8 hunger;
        uint8 happiness;
        uint8 energy;
        uint8 cleanliness;
        uint256 adoptedAt;
        uint256 updatedAt;
        bool adopted;
    }

    mapping(address => Pet) private pets;

    event PetAdopted(address indexed user, string name, string color, uint256 adoptedAt);
    event PetAction(address indexed user, string actionType, uint8 restoredPercent, uint256 expGained, uint256 newLevel);
    event PetSynced(address indexed user, uint256 syncedAt);
    event Withdraw(address indexed to, uint256 amount);

    error AlreadyAdopted();
    error NoPetAdopted();
    error EmptyName();
    error EmptyColor();
    error InvalidPayment();
    error NotOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier hasPet() {
        if (!pets[msg.sender].adopted) revert NoPetAdopted();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function adoptPet(string calldata name, string calldata color) external {
        if (pets[msg.sender].adopted) revert AlreadyAdopted();
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(color).length == 0) revert EmptyColor();

        pets[msg.sender] = Pet({
            name: name,
            color: color,
            totalExp: 0,
            hunger: 60,
            happiness: 60,
            energy: 60,
            cleanliness: 60,
            adoptedAt: block.timestamp,
            updatedAt: block.timestamp,
            adopted: true
        });

        emit PetAdopted(msg.sender, name, color, block.timestamp);
    }

    /// @notice Returns your pet with decay preview applied.
    /// @dev This is view-only. It does not write the decayed stats to storage.
    function getMyPet()
        external
        view
        returns (
            Pet memory pet,
            uint256 level,
            uint256 expInLevel,
            uint256 expToNextLevel
        )
    {
        pet = pets[msg.sender];
        if (!pet.adopted) revert NoPetAdopted();

        pet = _previewPetWithDecay(pet);

        level = _levelFromExp(pet.totalExp);
        expInLevel = pet.totalExp % EXP_PER_LEVEL;
        expToNextLevel = EXP_PER_LEVEL;
    }

    function hasAdopted(address user) external view returns (bool) {
        return pets[user].adopted;
    }

    /// @notice Returns a user's pet with decay preview applied.
    /// @dev This is view-only. It does not write the decayed stats to storage.
    function getPet(address user)
        external
        view
        returns (
            Pet memory pet,
            uint256 level,
            uint256 expInLevel,
            uint256 expToNextLevel
        )
    {
        pet = pets[user];
        if (!pet.adopted) revert NoPetAdopted();

        pet = _previewPetWithDecay(pet);

        level = _levelFromExp(pet.totalExp);
        expInLevel = pet.totalExp % EXP_PER_LEVEL;
        expToNextLevel = EXP_PER_LEVEL;
    }

    /// @notice Manually writes decay to storage.
    /// @dev Useful if the frontend has a "Sync On-chain" button.
    function syncPet() external hasPet {
        _applyDecay(msg.sender);
        emit PetSynced(msg.sender, block.timestamp);
    }

    function feed() external payable hasPet {
        _requireActionPayment();
        _applyDecay(msg.sender);

        uint8 restored = _restoreStat(msg.sender, 0);
        _awardExp(msg.sender, restored, "Feed");
    }

    function play() external payable hasPet {
        _requireActionPayment();
        _applyDecay(msg.sender);

        uint8 restored = _restoreStat(msg.sender, 1);
        _awardExp(msg.sender, restored, "Play");
    }

    function sleepPet() external payable hasPet {
        _requireActionPayment();
        _applyDecay(msg.sender);

        uint8 restored = _restoreStat(msg.sender, 2);
        _awardExp(msg.sender, restored, "Sleep");
    }

    function clean() external payable hasPet {
        _requireActionPayment();
        _applyDecay(msg.sender);

        uint8 restored = _restoreStat(msg.sender, 3);
        _awardExp(msg.sender, restored, "Clean");
    }

    function _requireActionPayment() internal view {
        if (msg.value != ACTION_PRICE) revert InvalidPayment();
    }

    /// @dev Applies decay to storage.
    /// Every full DECAY_INTERVAL reduces all stats by DECAY_PER_INTERVAL.
    function _applyDecay(address user) internal {
        Pet storage pet = pets[user];

        if (!pet.adopted) revert NoPetAdopted();

        uint256 decay = _calculateDecay(pet.updatedAt);

        if (decay == 0) {
            return;
        }

        pet.hunger = _decayStat(pet.hunger, decay);
        pet.happiness = _decayStat(pet.happiness, decay);
        pet.energy = _decayStat(pet.energy, decay);
        pet.cleanliness = _decayStat(pet.cleanliness, decay);

        pet.updatedAt = block.timestamp;
    }

    /// @dev Applies decay to a memory copy for read-only display.
    function _previewPetWithDecay(Pet memory pet) internal view returns (Pet memory) {
        uint256 decay = _calculateDecay(pet.updatedAt);

        if (decay == 0) {
            return pet;
        }

        pet.hunger = _decayStat(pet.hunger, decay);
        pet.happiness = _decayStat(pet.happiness, decay);
        pet.energy = _decayStat(pet.energy, decay);
        pet.cleanliness = _decayStat(pet.cleanliness, decay);

        // This makes the returned display timestamp current.
        // Storage is not changed because this is a memory copy.
        pet.updatedAt = block.timestamp;

        return pet;
    }

    function _calculateDecay(uint256 lastUpdatedAt) internal view returns (uint256) {
        if (lastUpdatedAt == 0 || block.timestamp <= lastUpdatedAt) {
            return 0;
        }

        uint256 elapsed = block.timestamp - lastUpdatedAt;
        uint256 intervals = elapsed / DECAY_INTERVAL;

        if (intervals == 0) {
            return 0;
        }

        return intervals * DECAY_PER_INTERVAL;
    }

    function _decayStat(uint8 current, uint256 decay) internal pure returns (uint8) {
        if (decay >= current) {
            return 0;
        }

        return uint8(uint256(current) - decay);
    }

    /// @dev statIndex: 0=hunger, 1=happiness, 2=energy, 3=cleanliness.
    function _restoreStat(address user, uint8 statIndex) internal returns (uint8 restored) {
        Pet storage pet = pets[user];

        if (statIndex == 0) {
            restored = _calcRecovery(pet.hunger);
            pet.hunger += restored;
        } else if (statIndex == 1) {
            restored = _calcRecovery(pet.happiness);
            pet.happiness += restored;
        } else if (statIndex == 2) {
            restored = _calcRecovery(pet.energy);
            pet.energy += restored;
        } else {
            restored = _calcRecovery(pet.cleanliness);
            pet.cleanliness += restored;
        }

        pet.updatedAt = block.timestamp;
    }

    function _calcRecovery(uint8 current) internal pure returns (uint8) {
        if (current >= 100) return 0;

        uint8 missing = 100 - current;

        return missing < ACTION_RECOVERY ? missing : ACTION_RECOVERY;
    }

    function _awardExp(address user, uint8 restoredPercent, string memory actionType) internal {
        Pet storage pet = pets[user];

        uint256 expGained = restoredPercent; // 10% restored = 10 EXP, therefore 1% restored = 1 EXP.

        pet.totalExp += expGained;

        emit PetAction(
            user,
            actionType,
            restoredPercent,
            expGained,
            _levelFromExp(pet.totalExp)
        );
    }

    function _levelFromExp(uint256 totalExp) internal pure returns (uint256) {
        return 1 + (totalExp / EXP_PER_LEVEL);
    }

    function withdraw(address payable to) external onlyOwner {
        uint256 amount = address(this).balance;

        to.transfer(amount);

        emit Withdraw(to, amount);
    }
}