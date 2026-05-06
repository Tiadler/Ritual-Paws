# RitualTom DApp MVP

RitualTom is a one-wallet-one-cat pet DApp for Ritual Chain.

## Product rules implemented

- Each wallet can adopt exactly one cat.
- Adoption is one-time only.
- During adoption, the user chooses:
  - cat name
  - cat color
- Pet data is stored on-chain with `mapping(address => Pet)`.
- Food / Play / Sleep / Bath are paid actions.
- Each action costs `0.0015 RITUAL`.
- Each action restores up to `20%` of the related stat.
- EXP is awarded from actual restored percent:
  - 10% restored = 10 EXP
  - 20% restored = 20 EXP
- Level is linear:
  - Level 1: 0-99 EXP
  - Level 2: 100-199 EXP
  - Level 3: 200-299 EXP
  - etc.
- Create Card style:
  - Level 1-19: green card, green-white gradient border
  - Level 20+: purple card, purple-white gradient border
  - Download and Share buttons are placed outside the card at the bottom-right of the modal.

## Important files

```txt
contracts/RitualTom.sol        # Main smart contract
scripts/deploy.cjs             # Deploy script
test/RitualTom.test.cjs        # Contract tests
lib/ritualTom.ts               # Frontend wallet/contract helper
lib/ritualTomAbi.ts            # Minimal ABI for frontend
app/page.tsx                   # Main DApp page
components/PetCard.tsx         # Pet card design
components/PetCardModal.tsx    # Create card modal
```

## Setup

Install dependencies:

```bash
npm install
```

Create env files:

```bash
copy .env.example .env
copy .env.example .env.local
```

On Mac/Linux:

```bash
cp .env.example .env
cp .env.example .env.local
```

Fill these values:

```env
PRIVATE_KEY=0xYOUR_DEV_WALLET_PRIVATE_KEY
RITUAL_RPC=https://rpc.ritualfoundation.org
NEXT_PUBLIC_RITUAL_RPC=https://rpc.ritualfoundation.org
NEXT_PUBLIC_RITUAL_CHAIN_ID=1979
NEXT_PUBLIC_RITUALTOM_ADDRESS=0xYOUR_DEPLOYED_RITUALTOM_CONTRACT
```

Use a fresh dev wallet only. Do not use your main wallet private key.

## Compile

```bash
npm run compile
```

## Test

```bash
npm test
```

## Deploy to Ritual Chain

Make sure your dev wallet has testnet RITUAL, then run:

```bash
npm run deploy:ritual
```

Copy the deployed contract address from terminal and paste it into `.env.local`:

```env
NEXT_PUBLIC_RITUALTOM_ADDRESS=0xDEPLOYED_CONTRACT_ADDRESS
```

## Run frontend

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## User flow

1. Connect MetaMask.
2. Switch/add Ritual Chain automatically.
3. If the wallet has no pet, the app shows the adopt screen.
4. Choose cat name and color.
5. Click `Adopt On-chain`.
6. After adoption, the app reads the pet from the smart contract.
7. Use Food / Play / Sleep / Bath.
8. Each action opens MetaMask and charges `0.0015 RITUAL`.
9. Click `Create Card` to generate a shareable card.

## Next product upgrades

Good next steps:

- Add decay over time, so food/play/sleep/clean slowly drop.
- Add ERC721 pet NFT support if you want transferable pets.
- Add item ownership on-chain.
- Add AI chat with Ritual LLM precompile / agent as v2.
- Add backend or IPFS for chat history and pet memory.

## Static art system

This version includes a fixed static asset pipeline for pet art and wearable items.

Main folder:

```text
public/static/
```

Folder structure:

```text
public/static/Pet/Pet(1).svg ... Pet(10).svg
public/static/ThemeBackgroundRoom/ThemeBackgroundRoom(1).svg ...
public/static/Hat/Hat(1).svg ...
public/static/Glass/Glass(1).svg ...
public/static/Necklace/Necklace(1).svg ...
public/static/Shirt/Shirt(1).svg ...
public/static/Handheld/Handheld(1).svg ...
```

Frontend asset variables live in:

```text
lib/staticAssets.ts
```

The fixed item attachment positions live in the `PET_ITEM_SLOTS` object. Change those values if your final art needs slight alignment tuning.
