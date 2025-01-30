// scripts/main.js
Hooks.on("createChatMessage", async (msg) => {
    if (!msg.isRoll || !msg.rolls.length) return;
  
    const roll = msg.rolls[0];
    if (!roll.formula.includes("d20")) return;
  
    const rollTotal = roll.total;
    const actor = msg.actor;
    if (!actor || !actor.isOwner) return;
  
    const target = Array.from(game.user.targets)[0];
  
    if (rollTotal === 20 && target) {
      applyRandomDebuff(target.actor, "Target", msg);
    } else if (rollTotal === 1) {
      applyRandomDebuff(actor, "Attacker", msg);
    }
  });
  
  async function applyRandomDebuff(actor, role, msg) {
    const conditions = [
      "Clumsy 1", "Enfeebled 1", "Sickened 1", "Stupefied 1", 
      "Frightened 1", "Dazzled", "Off-Guard", "Blinded"
    ];
    const debuff = conditions[Math.floor(Math.random() * conditions.length)];
    ui.notifications.info(`${role} receives: ${debuff}`);
  
    // Retrieve the condition from the Compendium and apply it
    const conditionPack = game.packs.get("pf2e.conditions");
    if (!conditionPack) return;
    
    const conditionEntry = (await conditionPack.getDocuments()).find(c => c.name === debuff);
    if (!conditionEntry) return;
  
    await actor.createEmbeddedDocuments("Item", [conditionEntry.toObject()]);
  
    // Create a chat message to notify players
    ChatMessage.create({
      content: `<strong>${role} is affected by ${debuff} due to a critical roll!</strong>`
    });
  }
  