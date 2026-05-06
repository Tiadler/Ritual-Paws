const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('RitualTom MVP', function () {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const RitualTom = await ethers.getContractFactory('RitualTom');
    const ritualTom = await RitualTom.deploy();
    await ritualTom.waitForDeployment();
    return { ritualTom, owner, alice, bob };
  }

  it('lets each wallet adopt exactly one cat', async function () {
    const { ritualTom, alice, bob } = await deployFixture();

    await ritualTom.connect(alice).adoptPet('Mimi', 'black');
    await ritualTom.connect(bob).adoptPet('Bong', 'cream');

    const [alicePet] = await ritualTom.connect(alice).getMyPet();
    const [bobPet] = await ritualTom.connect(bob).getMyPet();

    expect(alicePet.name).to.equal('Mimi');
    expect(alicePet.color).to.equal('black');
    expect(bobPet.name).to.equal('Bong');
    expect(bobPet.color).to.equal('cream');

    await expect(ritualTom.connect(alice).adoptPet('Second', 'orange')).to.be.revertedWithCustomError(ritualTom, 'AlreadyAdopted');
  });

  it('charges 0.0015 RITUAL per action, restores 20%, and gives EXP from restored percent', async function () {
    const { ritualTom, alice } = await deployFixture();
    const price = await ritualTom.ACTION_PRICE();

    await ritualTom.connect(alice).adoptPet('Mimi', 'black');
    await ritualTom.connect(alice).feed({ value: price });

    let [pet, level, expInLevel] = await ritualTom.connect(alice).getMyPet();
    expect(pet.hunger).to.equal(80);
    expect(pet.totalExp).to.equal(20);
    expect(level).to.equal(1);
    expect(expInLevel).to.equal(20);

    await ritualTom.connect(alice).feed({ value: price });
    ;[pet, level, expInLevel] = await ritualTom.connect(alice).getMyPet();
    expect(pet.hunger).to.equal(100);
    expect(pet.totalExp).to.equal(40);
    expect(level).to.equal(1);
    expect(expInLevel).to.equal(40);
  });

  it('levels linearly every 100 exp', async function () {
    const { ritualTom, alice } = await deployFixture();
    const price = await ritualTom.ACTION_PRICE();

    await ritualTom.connect(alice).adoptPet('Mimi', 'black');
    await ritualTom.connect(alice).feed({ value: price });
    await ritualTom.connect(alice).play({ value: price });
    await ritualTom.connect(alice).sleepPet({ value: price });
    await ritualTom.connect(alice).clean({ value: price });
    await ritualTom.connect(alice).play({ value: price });

    const [, level, expInLevel] = await ritualTom.connect(alice).getMyPet();
    expect(level).to.equal(2);
    expect(expInLevel).to.equal(0);
  });

  it('rejects wrong action payment', async function () {
    const { ritualTom, alice } = await deployFixture();
    await ritualTom.connect(alice).adoptPet('Mimi', 'black');

    await expect(ritualTom.connect(alice).feed({ value: ethers.parseEther('0.001') })).to.be.revertedWithCustomError(ritualTom, 'InvalidPayment');
  });
});
