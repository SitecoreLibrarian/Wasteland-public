async function loadData() {
  const bootLog = document.getElementById('boot-log');
  const lines = [];
  function addLine(h) {
    lines.push(h);
    bootLog.innerHTML = lines.join('<br>') + '<br><span class="cursor">_</span>';
  }
  addLine('WASTELAND OS v2.7 — INITIALIZING...');
  await sleep(300);
  const files = ['monsters','abilities','items','backgrounds','zones'];
  for (const file of files) {
    addLine('Loading <span style="color:var(--amber)">' + file + '.json</span>...');
    await sleep(180 + Math.random() * 120);
    DATA[file] = _INLINE_DATA[file];
    const count = Array.isArray(DATA[file]) ? DATA[file].length + ' records' : Object.keys(DATA[file]).length + ' entries';
    addLine('<span class="ok">✓</span> ' + file + '.json — ' + count);
    await sleep(60);
  }
  await sleep(400);
  addLine('<span class="ok">✓</span> ALL SYSTEMS NOMINAL');
  await sleep(300);
  addLine('Awaiting survivor registration...');
  document.getElementById('boot-start-btn').style.display = 'block';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ═══════════════════════════════════════════════════
//  COMPANION DEFINITIONS
// ═══════════════════════════════════════════════════
const COMPANIONS = [
  {
    id: 'vera', name: 'Vera', icon: '🧙',
    backgroundId: 'medic', background: 'Wasteland Medic',
    flavor: '"You want me to patch that up, or are you waiting for it to get interesting?"',
    description: 'A sharp-tongued medic who has kept more people alive than she cares to remember.',
    stats: { STR:2, AGI:3, INT:5, END:3, LCK:2 },
    abilities: ['field_medic','rad_heal','adrenaline'],
    passiveId: 'medic', passive: 'Triage: Healing abilities restore 25% more HP.',
    weapon: 'scrap_pistol', armor: 'leather_jacket', cost: 60,
    quote: 'Keep your head down.'
  },
  {
    id: 'kruger', name: 'Kruger', icon: '🪖',
    backgroundId: 'soldier', background: 'Ex-Soldier',
    flavor: '"I stopped counting kills at a hundred. Felt like bragging after that."',
    description: 'A former military grunt with a steady hand and a shorter temper.',
    stats: { STR:5, AGI:3, INT:2, END:4, LCK:1 },
    abilities: ['gunslinger','suppressive_fire','burst_fire'],
    passiveId: 'soldier', passive: 'Combat Training: +10% damage with ranged weapons.',
    weapon: 'hunting_rifle', armor: 'combat_vest', cost: 80,
    quote: "I've seen worse."
  },
  {
    id: 'mox', name: 'Mox', icon: '🧟',
    backgroundId: 'mutant', background: 'Wasteland Mutant',
    flavor: '"Normal? That died with the old world. I\'m what came next."',
    description: 'A heavily irradiated mutant who absorbed enough radiation to glow faintly. Immune to poison.',
    stats: { STR:6, AGI:2, INT:2, END:6, LCK:1 },
    abilities: ['mutation_surge','rad_heal','fortify'],
    passiveId: 'mutant', passive: 'Irradiated Hide: +4 natural armor. Immune to poison.',
    weapon: 'vibro_blade', armor: 'rags', cost: 50,
    quote: 'Raaaagh.'
  },
  {
    id: 'silas', name: 'Silas', icon: '🦊',
    backgroundId: 'scavenger', background: 'Scavenger',
    flavor: '"If it\'s not nailed down, it\'s mine. If it is nailed down, give me ten minutes."',
    description: 'A wiry opportunist with light fingers and a nose for valuable junk.',
    stats: { STR:2, AGI:6, INT:3, END:2, LCK:4 },
    abilities: ['scavenge','toxic_blade','gunslinger'],
    passiveId: 'scavenger', passive: "Scavenger's Eye: +20% item drop chance.",
    weapon: 'scrap_pistol', armor: 'leather_jacket', cost: 45,
    quote: 'Ooh. Shiny.'
  },
  {
    id: 'doc_raines', name: 'Doc Raines', icon: '👴',
    backgroundId: 'tech_salvager', background: 'Tech Salvager',
    flavor: '"This isn\'t broken. It\'s... creatively functional."',
    description: 'An aging engineer who can coax miracles out of scrap. Specialises in energy weapons.',
    stats: { STR:1, AGI:3, INT:6, END:2, LCK:3 },
    abilities: ['plasma_shot','emp_blast','overcharge'],
    passiveId: 'tech_salvager', passive: 'Tech Genius: Energy/tech abilities cost 2 less Energy.',
    weapon: 'plasma_rifle', armor: 'combat_vest', cost: 90,
    quote: 'Fascinating.'
  },
  {
    id: 'rook', name: 'Rook', icon: '💀',
    backgroundId: 'raider_reformed', background: 'Reformed Raider',
    flavor: '"I know every dirty trick. I invented most of them."',
    description: 'A brutal ex-raider who traded blood money for a chance at something better.',
    stats: { STR:5, AGI:3, INT:1, END:4, LCK:2 },
    abilities: ['frag_grenade','mutation_surge','toxic_blade'],
    passiveId: 'raider_reformed', passive: 'Ruthless: Critical hits deal 2x damage.',
    weapon: 'combat_shotgun', armor: 'scrap_armor', cost: 70,
    quote: "Let's get bloody."
  },
];

// ═══════════════════════════════════════════════════
//  COMPANION RANDOMIZATION
// ═══════════════════════════════════════════════════
// Called once at startGame() — rolls fresh variants for every run
let rolledCompanions = [];

function rollCompanions() {
  const STAT_KEYS = ['STR','AGI','INT','END','LCK'];
  const allAbilityIds = Object.keys(DATA.abilities?.player || {});

  rolledCompanions = COMPANIONS.map(base => {
    // Shuffle stats: 4 random 1-point transfers, keeping total the same
    const newStats = { ...base.stats };
    for (let i = 0; i < 4; i++) {
      const from = STAT_KEYS[Math.floor(Math.random()*5)];
      const to   = STAT_KEYS[Math.floor(Math.random()*5)];
      if (from !== to && newStats[from] > 1 && newStats[to] < 9) {
        newStats[from]--; newStats[to]++;
      }
    }
    // Keep signature ability (index 0), randomise the other 2
    const signature = base.abilities[0];
    const pool = allAbilityIds.filter(id => id !== signature).sort(() => Math.random() - 0.5);
    const newAbilities = [signature, pool[0], pool[1]];
    // Cost varies +/-20%, rounded to nearest 5
    const newCost = Math.max(20, Math.round(base.cost * (0.80 + Math.random()*0.40) / 5) * 5);
    return { ...base, stats: newStats, abilities: newAbilities, cost: newCost };
  });
}

// ═══════════════════════════════════════════════════
//  CHARACTER CREATION
// ═══════════════════════════════════════════════════
const STATS = [
  { id: 'STR', name: 'Strength',     desc: 'Melee damage and carry weight' },
  { id: 'AGI', name: 'Agility',      desc: 'Accuracy, dodge, and crit chance' },
  { id: 'INT', name: 'Intelligence', desc: 'Ability power and energy pool' },
  { id: 'END', name: 'Endurance',    desc: 'Max HP and damage resistance' },
  { id: 'LCK', name: 'Luck',         desc: 'Critical hits and loot finds' },
];
const TOTAL_POINTS = 15;
const STAT_MIN = 1;
const STAT_MAX = 8;

let cc = { step:0, name:'', background:null, stats:{STR:3,AGI:3,INT:3,END:3,LCK:3}, selectedAbilities:[] };
const STEPS = ['name','background','stats','abilities','gear'];

function showCharCreate() { showScreen('screen-create'); renderCreateStep(); }

function renderCreateStep() {
  const stepInd = document.getElementById('step-indicator');
  stepInd.innerHTML = STEPS.map((_,i) =>
    `<div class="step-dot ${i < cc.step ? 'done' : i === cc.step ? 'active' : ''}"></div>`
  ).join('');

  const content = document.getElementById('create-content');
  const step = STEPS[cc.step];

  if (step === 'name') {
    content.innerHTML = `
      <div class="create-step-title">NAME YOUR SURVIVOR</div>
      <div class="create-section">
        <input class="name-input" id="cc-name" maxlength="24" placeholder="Enter designation..." value="${cc.name}" oninput="cc.name=this.value.trim()">
      </div>
      <div class="create-nav">
        <button class="create-btn primary" onclick="ccNext()">NEXT &#9658;</button>
      </div>`;
    document.getElementById('cc-name').focus();

  } else if (step === 'background') {
    content.innerHTML = `
      <div class="create-step-title">CHOOSE BACKGROUND</div>
      <div class="bg-grid">
        ${DATA.backgrounds.map(bg => `
          <div class="bg-card ${cc.background?.id === bg.id ? 'selected' : ''}" onclick="selectBg('${bg.id}')">
            <div class="bg-card-icon">${bg.icon}</div>
            <div class="bg-card-name">${bg.name}</div>
            <div class="bg-card-desc">${bg.description}</div>
            <div class="bg-card-flavor">${bg.flavor}</div>
            <div class="bg-card-bonuses">
              ${Object.entries(bg.statBonuses).map(([s,v]) => `<span class="bg-bonus-tag">+${v} ${s}</span>`).join('')}
            </div>
          </div>`).join('')}
      </div>
      <div class="create-nav">
        <button class="create-btn" onclick="ccBack()">&#9664; BACK</button>
        <button class="create-btn primary" onclick="ccNext()">NEXT &#9658;</button>
      </div>`;

  } else if (step === 'stats') {
    const used = Object.values(cc.stats).reduce((a,b)=>a+b,0);
    const left = TOTAL_POINTS - used;
    content.innerHTML = `
      <div class="create-step-title">ALLOCATE STATS</div>
      <div class="points-left" style="margin-bottom:12px;">Points remaining: <span>${left}</span></div>
      <div class="stats-grid">
        ${STATS.map(s => {
          const val = cc.stats[s.id];
          const bonus = cc.background?.statBonuses[s.id] || 0;
          return `<div class="stat-row">
            <div class="stat-label">${s.id}</div>
            <div class="stat-full-name">${s.name}</div>
            <div class="stat-full-name" style="color:var(--text-dim)">${s.desc}</div>
            <div class="stat-controls">
              <button class="stat-btn" onclick="adjustStat('${s.id}',-1)" ${val<=STAT_MIN?'disabled':''}>-</button>
              <span class="stat-val">${val}</span>
              <button class="stat-btn" onclick="adjustStat('${s.id}',1)" ${val>=STAT_MAX||left<=0?'disabled':''}>+</button>
            </div>
            ${bonus>0?`<div style="font-size:9px;color:var(--amber-dim);margin-top:4px;">+${bonus} from background</div>`:''}
          </div>`;
        }).join('')}
      </div>
      <div class="create-nav">
        <button class="create-btn" onclick="ccBack()">&#9664; BACK</button>
        <button class="create-btn primary" onclick="ccNext()">NEXT &#9658;</button>
      </div>`;

  } else if (step === 'abilities') {
    const abilityData = DATA.abilities?.player || {};
    const bgAbilities = cc.background?.startingAbilities || [];
    if (cc.selectedAbilities.length === 0 && bgAbilities.length) cc.selectedAbilities = [...bgAbilities];
    const MAX_ABILITIES = 3;
    content.innerHTML = `
      <div class="create-step-title">SELECT ABILITIES</div>
      <div class="ability-selected-count">Selected: <span>${cc.selectedAbilities.length}</span> / ${MAX_ABILITIES} &nbsp;(background abilities pre-selected)</div>
      <div class="ability-grid">
        ${Object.values(abilityData).map(ab => {
          const isSelected = cc.selectedAbilities.includes(ab.id);
          const isFromBg = bgAbilities.includes(ab.id);
          const canAdd = cc.selectedAbilities.length < MAX_ABILITIES || isSelected;
          return `<div class="ability-card ${isSelected?'selected':''} ${canAdd?'available':''}"
            onclick="toggleAbility('${ab.id}',${isFromBg})" style="${isFromBg?'border-color:var(--amber-dim);':''}">
            <div class="ability-icon">${ab.icon}</div>
            <div class="ability-name">${ab.name} ${isFromBg?'&#11088;':''}</div>
            <div class="ability-cost">&#9889; ${ab.cost} EN</div>
            <div class="ability-desc">${ab.description}</div>
          </div>`;
        }).join('')}
      </div>
      <div class="create-nav">
        <button class="create-btn" onclick="ccBack()">&#9664; BACK</button>
        <button class="create-btn primary" onclick="ccNext()">NEXT &#9658;</button>
      </div>`;

  } else if (step === 'gear') {
    const gear = cc.background?.startingGear;
    const weaponData = DATA.items?.weapons?.[gear?.weapon];
    const armorData  = DATA.items?.armor?.[gear?.armor];
    const cons = gear?.consumables || {};
    content.innerHTML = `
      <div class="create-step-title">STARTING LOADOUT</div>
      <div class="create-section">
        <div style="font-size:10px;color:var(--text-dim);letter-spacing:2px;margin-bottom:10px;">Loadout assigned by background. Your starting kit:</div>
        <div class="gear-preview">
          ${weaponData?`<div class="gear-item"><span class="gear-item-icon">${weaponData.icon}</span><div class="gear-item-info"><div class="gear-item-name">${weaponData.name} <span style="color:var(--text-dim);font-size:10px;">[+${weaponData.atkBonus} ATK]</span></div><div class="gear-item-desc">${weaponData.description}</div></div></div>`:''}
          ${armorData?`<div class="gear-item"><span class="gear-item-icon">${armorData.icon}</span><div class="gear-item-info"><div class="gear-item-name">${armorData.name} <span style="color:var(--text-dim);font-size:10px;">[+${armorData.armorBonus} ARMOR]</span></div><div class="gear-item-desc">${armorData.description}</div></div></div>`:''}
          ${Object.entries(cons).map(([k,v])=>{const item=DATA.items?.consumables?.[k];if(!item)return'';return`<div class="gear-item"><span class="gear-item-icon">${item.icon}</span><div class="gear-item-info"><div class="gear-item-name">${item.name} x${v}</div><div class="gear-item-desc">${item.description}</div></div></div>`;}).join('')}
        </div>
      </div>
      <div style="margin-top:12px;font-size:10px;color:var(--amber-dim);letter-spacing:1px;padding:10px;border:1px solid var(--border);">
        &#9672; PASSIVE: ${cc.background?.passiveDescription || '-'}
      </div>
      <div class="create-nav">
        <button class="create-btn" onclick="ccBack()">&#9664; BACK</button>
        <button class="create-btn primary" onclick="startGame()">&#9658; ENTER THE WASTELAND</button>
      </div>`;
  }
}

function selectBg(id) { cc.background = DATA.backgrounds.find(b=>b.id===id); cc.selectedAbilities=[]; renderCreateStep(); }
function adjustStat(stat, delta) {
  const used = Object.values(cc.stats).reduce((a,b)=>a+b,0);
  const left = TOTAL_POINTS - used;
  if (delta>0 && (left<=0||cc.stats[stat]>=STAT_MAX)) return;
  if (delta<0 && cc.stats[stat]<=STAT_MIN) return;
  cc.stats[stat] += delta; renderCreateStep();
}
function toggleAbility(id, isFromBg) {
  if (isFromBg) return;
  if (cc.selectedAbilities.includes(id)) cc.selectedAbilities = cc.selectedAbilities.filter(a=>a!==id);
  else { if (cc.selectedAbilities.length >= 3) return; cc.selectedAbilities.push(id); }
  renderCreateStep();
}
function ccNext() {
  const step = STEPS[cc.step];
  if (step==='name' && !cc.name) { alert('Enter a name.'); return; }
  if (step==='background' && !cc.background) { alert('Choose a background.'); return; }
  if (cc.step < STEPS.length-1) { cc.step++; renderCreateStep(); }
}
function ccBack() { if (cc.step>0) { cc.step--; renderCreateStep(); } }

// ═══════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════
let state = {
  party: [],
  activeIdx: 0,
  enemies: [], targetIdx: 0,
  zone: 1, kills: 0, xp: 0, caps: 0,
  items: {},
  materials: { scrap:0, tech_parts:0, chitin:0, mutant_tissue:0 },
  turn: 'player', busy: false,
  battleXp: 0, battleCaps: 0, battleKills: 0,
  defBuff: false, adrenBuff: false, suppressBuff: false,
};

function activePartyMember() { return state.party[state.activeIdx]; }
function getPlayer() { return state.party[0]; }
Object.defineProperty(state, 'player', { get() { return this.party[0]; } });

function buildMemberFromCompanion(comp) {
  const stats = comp.stats;
  const maxHp = 40 + stats.END * 8;
  const maxEn = 20 + stats.INT * 6;
  const baseArmor = comp.passiveId === 'mutant' ? 4 : 0;
  const weapon = DATA.items?.weapons?.[comp.weapon] || {};
  const armor  = DATA.items?.armor?.[comp.armor]   || {};
  return {
    id: comp.id, name: comp.name, icon: comp.icon,
    background: comp.background, backgroundId: comp.backgroundId,
    stats, hp: maxHp, maxHp, energy: maxEn, maxEn,
    atk: (8 + stats.STR*2) + (weapon.atkBonus||0),
    armor: baseArmor + (armor.armorBonus||0),
    crit: 0.10 + stats.AGI*0.02 + stats.LCK*0.01 + (weapon.critBonus||0),
    abilities: comp.abilities, level: 1,
    passive: comp.passive, passiveId: comp.passiveId,
    weapon, armorGear: armor,
    poisonTurns:0, poisonDmg:0, bleedTurns:0, bleedDmg:0,
    isCompanion: true,
  };
}

function startGame() {
  rollCompanions();
  const bg = cc.background;
  const finalStats = {};
  STATS.forEach(s => finalStats[s.id] = cc.stats[s.id] + (bg.statBonuses[s.id]||0));
  const gear = bg.startingGear;
  const weapon = DATA.items?.weapons?.[gear?.weapon] || {};
  const armor  = DATA.items?.armor?.[gear?.armor]   || {};

  state.party = [{
    id: 'player', name: cc.name, background: bg.name, backgroundId: bg.id, icon: bg.icon,
    stats: finalStats,
    hp: 40+finalStats.END*8, maxHp: 40+finalStats.END*8,
    energy: 20+finalStats.INT*6, maxEn: 20+finalStats.INT*6,
    atk: (8+finalStats.STR*2)+(weapon.atkBonus||0),
    armor: (bg.id==='mutant'?4:0)+(armor.armorBonus||0),
    crit: 0.10+finalStats.AGI*0.02+finalStats.LCK*0.01+(weapon.critBonus||0),
    abilities: cc.selectedAbilities, level: 1,
    passive: bg.passiveDescription, passiveId: bg.id,
    weapon, armorGear: armor,
    poisonTurns:0, poisonDmg:0, bleedTurns:0, bleedDmg:0,
  }];
  state.activeIdx = 0;
  state.items = { stim:0, super_stim:0, power_cell:0, revival_shot:0, rad_away:0 };
  if (gear.consumables) Object.entries(gear.consumables).forEach(([k,v])=>{ state.items[k]=(state.items[k]||0)+v; });
  state.zone=1; state.kills=0; state.xp=0; state.caps=0;

  showScreen('screen-game');
  spawnEnemies(); renderAll();
  log('&#9672; ' + state.party[0].icon + ' ' + state.party[0].name + ' enters the wasteland.', 'system');
  log('Background: ' + state.party[0].background, 'system');
  log('&#8212; Your turn &#8212;', 'system');
}

// ═══════════════════════════════════════════════════
//  RECRUIT
// ═══════════════════════════════════════════════════
function openRecruit() {
  document.getElementById('overlay-camp').classList.remove('open');
  renderRecruitPanel();
  document.getElementById('overlay-recruit').classList.add('open');
}
function closeRecruit() {
  document.getElementById('overlay-recruit').classList.remove('open');
  document.getElementById('overlay-camp').classList.add('open');
}
function renderRecruitPanel() {
  const slotsEl = document.getElementById('recruit-party-slots');
  slotsEl.innerHTML = '<span class="recruit-party-label">SQUAD:&nbsp;</span>';
  for (let i=0;i<4;i++) {
    const m = state.party[i];
    const slot = document.createElement('div');
    slot.className = 'recruit-party-slot '+(m?'filled':'empty');
    slot.textContent = m ? m.icon : '\u25A1';
    slot.title = m ? m.name : 'Empty';
    slotsEl.appendChild(slot);
  }
  const capsSpan = document.createElement('span');
  capsSpan.style.cssText='font-size:10px;color:var(--amber);letter-spacing:2px;margin-left:10px;';
  capsSpan.textContent = state.caps + ' CAPS';
  slotsEl.appendChild(capsSpan);

  const grid = document.getElementById('recruit-grid');
  grid.innerHTML = '';
  const partyFull = state.party.length >= 4;

  rolledCompanions.forEach(comp => {
    const alreadyIn = state.party.some(m=>m.id===comp.id);
    const card = document.createElement('div');
    card.className = 'recruit-card'+(alreadyIn?' recruited':partyFull?' party-full':'');
    const statTags = Object.entries(comp.stats).map(([s,v])=>`<span class="recruit-stat-tag">${s}:${v}</span>`).join('');
    card.innerHTML = `
      ${alreadyIn?'<div class="recruit-status-badge">IN SQUAD</div>':''}
      <div class="recruit-card-header">
        <div class="recruit-card-icon">${comp.icon}</div>
        <div><div class="recruit-card-name">${comp.name}</div><div class="recruit-card-bg">${comp.background}</div></div>
      </div>
      <div class="recruit-card-desc">${comp.description}</div>
      <div style="font-family:'Special Elite',serif;font-size:10px;color:var(--amber-dim);font-style:italic;margin-bottom:8px;">${comp.flavor}</div>
      <div class="recruit-card-stats">${statTags}</div>
      <div class="recruit-card-passive">&#9672; ${comp.passive}</div>
      ${!alreadyIn?`<div class="recruit-cost">&#9672; COST: ${comp.cost} CAPS</div>`:''}
    `;
    if (!alreadyIn && !partyFull) card.onclick = () => recruitCompanion(comp.id);
    grid.appendChild(card);
  });
}
function recruitCompanion(id) {
  const comp = rolledCompanions.find(c=>c.id===id);
  if (!comp) return;
  if (state.party.length>=4) { log('Squad is full.','warn'); return; }
  if (state.caps<comp.cost) { log('Not enough caps to recruit '+comp.name+'. Need '+comp.cost+', have '+state.caps+'.','warn'); renderRecruitPanel(); return; }
  state.caps -= comp.cost;
  const member = buildMemberFromCompanion(comp);
  const lvl = state.party[0].level;
  if (lvl>1) {
    for (let i=1;i<lvl;i++) { member.maxHp+=6; member.maxEn+=4; member.atk+=2; member.armor+=1; member.level=lvl; }
    member.hp=member.maxHp; member.energy=member.maxEn;
  }
  state.party.push(member);
  log('&#9672; ' + comp.icon + ' ' + comp.name + ' joins the squad. "' + comp.quote + '"', 'system');
  updateStats(); renderRecruitPanel(); renderParty();
}

// ═══════════════════════════════════════════════════
//  SPAWN ENEMIES
// ═══════════════════════════════════════════════════
function spawnEnemies() {
  const pool = DATA.monsters.filter(m=>m.zone<=state.zone&&!m.boss);
  const bosses = DATA.monsters.filter(m=>m.boss&&m.zone===state.zone);
  // Attack scales: +2 per zone beyond 1
  const atkBonus = (state.zone - 1) * 2;
  // Boss: HP scales much more aggressively (x2 per zone), attack too
  if (state.kills>0&&state.kills%5===0&&bosses.length) {
    const t=bosses[0];
    const hp = Math.round(t.hp * (1 + state.zone * 0.4));
    const atk = t.attack + atkBonus * 2;
    state.enemies=[{...t,curHp:hp,maxHp:hp,attack:atk,_id:0,stunTurns:0,poisonTurns:0,poisonDmg:0,bleedTurns:0,bleedDmg:0}];
    state.targetIdx=0; resetBattleCounters(); return;
  }
  const maxTypes=Math.min(3,1+Math.floor(state.zone/2));
  const typeCount=Math.floor(Math.random()*maxTypes)+1;
  const templates=pool.slice().sort(()=>Math.random()-0.5).slice(0,typeCount);
  state.enemies=[]; let id=0; const MAX=12;
  templates.forEach(t=>{
    if (state.enemies.length>=MAX) return;
    const remaining=MAX-state.enemies.length;
    let count=t.horde?Math.floor(Math.random()*2)+(typeCount===1?5:typeCount===2?3:2):Math.floor(Math.random()*3)+1;
    count=Math.min(count,remaining);
    const hp=t.hp+state.zone*8;
    const atk=t.attack+atkBonus;
    for(let i=0;i<count;i++) state.enemies.push({...t,curHp:hp,maxHp:hp,attack:atk,_id:id++,stunTurns:0,poisonTurns:0,poisonDmg:0,bleedTurns:0,bleedDmg:0});
  });
  state.enemies.sort(()=>Math.random()-0.5);
  state.enemies.forEach((e,i)=>e._id=i);
  state.targetIdx=0; resetBattleCounters();
}
function resetBattleCounters() { state.battleXp=0;state.battleCaps=0;state.battleKills=0;state.defBuff=false;state.adrenBuff=false;state.suppressBuff=false; }
function liveEnemies() { return state.enemies.filter(e=>e.curHp>0); }
function liveMates()   { return state.party.filter(m=>m.hp>0); }
function getTarget() {
  const t=state.enemies[state.targetIdx];
  if(t&&t.curHp>0) return t;
  const fi=state.enemies.findIndex(e=>e.curHp>0);
  if(fi>=0){state.targetIdx=fi;return state.enemies[fi];}
  return null;
}

// ═══════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════
function renderAll() { renderEnemies(); renderParty(); renderItems(); renderMaterials(); updateStats(); }

function renderEnemies() {
  const container=document.getElementById('enemy-container');
  if(!container) return;
  container.innerHTML='';
  state.enemies.forEach((e,i)=>{
    const dead=e.curHp<=0;
    const targeted=i===state.targetIdx&&!dead;
    const pct=Math.max(0,e.curHp/e.maxHp*100);
    const row=document.createElement('div');
    row.className=`enemy-row${targeted?' targeted':''}${dead?' dead':''}`;
    if(!dead) row.onclick=()=>{state.targetIdx=i;renderEnemies();};
    const statuses=[];
    if(e.stunTurns>0) statuses.push(`<span class="status-badge stunned">STUNNED x${e.stunTurns}</span>`);
    if(e.poisonTurns>0) statuses.push(`<span class="status-badge poisoned">POISONED x${e.poisonTurns}</span>`);
    if(e.bleedTurns>0) statuses.push(`<span class="status-badge bleeding">BLEEDING x${e.bleedTurns}</span>`);
    row.innerHTML=`
      <div class="enemy-target-arrow">${targeted?'&#9658;':''}</div>
      <div class="enemy-emoji">${e.emoji}</div>
      <div class="enemy-info">
        <div class="enemy-name-row"><span class="enemy-name">${e.name}</span><span class="enemy-hp-text">${dead?'DEAD':`${e.curHp}/${e.maxHp}`}</span></div>
        <div class="enemy-hp-bar"><div class="enemy-hp-fill" style="width:${pct}%"></div></div>
        ${statuses.length?`<div class="enemy-status">${statuses.join('')}</div>`:''}
      </div>`;
    container.appendChild(row);
  });
  const live=liveEnemies();
  if(live.length>0){
    const groups={};
    live.forEach(e=>groups[e.name]=(groups[e.name]||0)+1);
    const label=Object.entries(groups).map(([n,c])=>c>1?`${c}x ${n}`:n).join(' · ');
    const summary=document.createElement('div');
    summary.style.cssText='font-size:9px;color:var(--amber-dim);letter-spacing:2px;text-align:center;margin-top:6px;padding-top:6px;border-top:1px solid var(--border);';
    summary.textContent=label.toUpperCase();
    container.appendChild(summary);
  }
}

function renderParty() {
  const container=document.getElementById('party-container');
  if(!container) return;
  container.innerHTML='';
  state.party.forEach((m,idx)=>{
    const dead=m.hp<=0;
    const isActive=idx===state.activeIdx&&state.turn==='player'&&!state.busy&&!dead;
    const hpPct=Math.max(0,m.hp/m.maxHp*100);
    const enPct=Math.max(0,m.energy/m.maxEn*100);
    let tagHtml=dead?'<span class="party-member-tag fallen">FALLEN</span>':isActive?'<span class="party-member-tag acting">ACTING</span>':'<span class="party-member-tag done">WAITING</span>';
    const statuses=[];
    if(m.poisonTurns>0) statuses.push(`<span class="status-badge poisoned">POISON x${m.poisonTurns}</span>`);
    if(m.bleedTurns>0) statuses.push(`<span class="status-badge bleeding">BLEED x${m.bleedTurns}</span>`);
    const row=document.createElement('div');
    row.className=`party-member-row${dead?' dead':''}${isActive?' active acting-member':''}`;
    row.innerHTML=`
      <div class="party-member-header">
        <div><div class="party-member-name">${m.icon} ${m.name}</div><div class="party-member-class">${m.background} · LV.${m.level}</div></div>
        ${tagHtml}
      </div>
      <div class="member-bars">
        <div class="member-bar-row"><span class="member-bar-label">HP</span><div class="member-bar"><div class="member-bar-fill hp" style="width:${hpPct}%"></div></div><span class="member-bar-val">${m.hp}/${m.maxHp}</span></div>
        <div class="member-bar-row"><span class="member-bar-label">EN</span><div class="member-bar"><div class="member-bar-fill en" style="width:${enPct}%"></div></div><span class="member-bar-val">${m.energy}/${m.maxEn}</span></div>
      </div>
      ${statuses.length?`<div class="enemy-status" style="margin-top:4px;">${statuses.join('')}</div>`:''}
      <div style="margin-top:4px;font-size:9px;color:var(--text-dim);letter-spacing:1px;">&#9672; ${m.passive}</div>
    `;
    container.appendChild(row);
  });
}

function renderMaterials() {
  const el = document.getElementById('materials-bar');
  if (!el) return;
  const m = state.materials || {};
  const MATS = [
    { id:'scrap',         icon:'🔩', name:'Scrap' },
    { id:'tech_parts',    icon:'⚙️',  name:'Tech Parts' },
    { id:'chitin',        icon:'🦴', name:'Chitin' },
    { id:'mutant_tissue', icon:'🧫', name:'Mutant Tissue' },
  ];
  el.innerHTML = MATS.map(mat => {
    const qty = m[mat.id] || 0;
    return `<div class="mat-chip${qty===0?' mat-empty':''}">${mat.icon} <span class="mat-name">${mat.name}</span><span class="mat-qty">${qty}</span></div>`;
  }).join('');
}

function renderItems() {
  const el=document.getElementById('items-display');
  if(!el) return; el.innerHTML='';
  const itemDefs=DATA.items?.consumables||{};
  Object.entries(state.items).forEach(([k,v])=>{
    if(v<=0) return;
    const def=itemDefs[k]||{icon:'?',name:k};
    const chip=document.createElement('span');
    chip.className='item-chip'; chip.textContent=`${def.icon} x${v}`; chip.title=def.name;
    el.appendChild(chip);
  });
}

function updateStats() {
  const z=DATA.zones?.find(z=>z.id===state.zone);
  const nameEl=document.getElementById('zone-name');
  if(nameEl) nameEl.textContent=z?.name?.toUpperCase()||`ZONE ${state.zone}`;
  ['kills','xp','caps'].forEach(k=>{ const el=document.getElementById('stat-'+k); if(el) el.textContent=state[k]; });
}

function setButtons(enabled) {
  ['attack','ability','item','flee'].forEach(id=>{ const btn=document.getElementById('btn-'+id); if(btn) btn.disabled=!enabled; });
}

function setTurnBanner(who, memberName) {
  const el=document.getElementById('turn-banner');
  if(!el) return;
  if(who==='player') {
    el.textContent = memberName ? ('◈ '+memberName.toUpperCase()+"'S TURN ◈") : '◈ YOUR TURN ◈';
    el.className='turn-banner player-turn';
  } else {
    el.textContent='◈ ENEMY TURN ◈';
    el.className='turn-banner enemy-turn';
  }
}

function log(msg,cls='') {
  const el=document.getElementById('message-log');
  if(!el) return;
  const div=document.createElement('div');
  div.className='log-line '+cls; div.innerHTML=msg;
  el.insertBefore(div,el.firstChild);
  while(el.children.length>80) el.removeChild(el.lastChild);
}
function flashParty() { const el=document.getElementById('party-container'); if(!el)return; el.classList.add('flash-red'); setTimeout(()=>el.classList.remove('flash-red'),350); }
function flashEnemies() { const el=document.getElementById('enemy-container'); if(!el)return; el.classList.add('shake'); setTimeout(()=>el.classList.remove('shake'),350); }

// ═══════════════════════════════════════════════════
//  PLAYER TURN - MULTI MEMBER
// ═══════════════════════════════════════════════════
function playerAction(action) {
  if(state.busy||state.turn!=='player') return;
  const m=activePartyMember();
  if(!m||m.hp<=0) return;
  state.busy=true; setButtons(false);
  if(action==='attack') doAttack();
  else if(action==='flee') doFlee();
}

function doAttack() {
  const target=getTarget(); const m=activePartyMember();
  if(!target||!m){advancePartyTurn();return;}
  let dmg=Math.floor(Math.random()*8+m.atk)-Math.floor(target.armor/2);
  dmg=Math.max(1,dmg);
  let crit=false;
  if(Math.random()<m.crit){dmg=Math.floor(dmg*(m.passiveId==='raider_reformed'?2.0:1.75));crit=true;}
  if(state.adrenBuff) dmg=Math.floor(dmg*1.3);
  if(m.passiveId==='soldier'&&m.weapon?.type==='ranged') dmg=Math.floor(dmg*1.10);
  target.curHp=Math.max(0,target.curHp-dmg);
  flashEnemies();
  log(m.icon+' '+m.name+' attacks '+target.name+' for <b>'+dmg+'</b>!'+(crit?' &#9733; CRITICAL!':''),'attack');
  renderEnemies();
  setTimeout(()=>handleEnemyHit(target),500);
}

function doFlee() {
  if(Math.random()<0.4){
    log('The squad retreats into the ruins!','system');
    setTimeout(()=>{spawnEnemies();state.busy=false;renderAll();announceEnemies();startPartyTurnSequence();},800);
  } else {
    log('No escape &#8212; pinned down!','warn');
    setTimeout(()=>advancePartyTurn(),500);
  }
}

function handleEnemyHit(target,skipAdvance=false) {
  if(target.curHp<=0&&!target._killCounted){
    target._killCounted=true;
    const caps=target.caps+Math.floor(Math.random()*8);
    const xpGain=target.xp;
    const hasScav=state.party.some(m=>m.passiveId==='scavenger'&&m.hp>0);
    const dropChance=hasScav?0.20:0.12;
    state.kills++;state.battleKills++;state.xp+=xpGain;state.battleXp+=xpGain;state.caps+=caps;state.battleCaps+=caps;
    log(target.emoji+' '+target.name+' eliminated! (+'+xpGain+' XP, +'+caps+' caps)','loot');
    updateStats(); checkLevelUp();
    if(Math.random()<dropChance){
      // Map monster loot tags to actual drops (items or materials)
      const LOOT_TABLE = {
        stim:             { item:'stim',          name:'Stim Pack',      type:'item',     weight:4 },
        power_cell:       { item:'power_cell',    name:'Power Cell',     type:'item',     weight:3 },
        caps:             { item:'caps',           name:'Caps',           type:'caps',     weight:4 },
        rad_cell:         { item:'rad_away',       name:'Rad-Away',       type:'item',     weight:3 },
        ammo:             { item:'power_cell',     name:'Power Cell',     type:'item',     weight:2 },
        scrap:            { item:'scrap',          name:'Scrap',          type:'material', weight:4 },
        tech_parts:       { item:'tech_parts',     name:'Tech Parts',     type:'material', weight:3 },
        chitin:           { item:'chitin',         name:'Chitin',         type:'material', weight:3 },
        mutant_tissue:    { item:'mutant_tissue',  name:'Mutant Tissue',  type:'material', weight:3 },
        rag:              { item:'scrap',          name:'Scrap',          type:'material', weight:2 },
        armor_scrap:      { item:'scrap',          name:'Scrap',          type:'material', weight:2 },
        rare_stim:        { item:'super_stim',     name:'Super Stim',     type:'item',     weight:1 },
        power_armor_piece:{ item:'revival_shot',   name:'Revival Shot',   type:'item',     weight:1 },
        deathclaw_hide:   { item:'chitin',         name:'Chitin',         type:'material', weight:2 },
      };
      // Build weighted pool from this monster's loot tags
      const monLoot = target.loot || [];
      const pool = monLoot.length > 0
        ? monLoot.map(tag => LOOT_TABLE[tag]).filter(Boolean)
        : [LOOT_TABLE.scrap, LOOT_TABLE.stim]; // fallback generic table
      const totalWeight = pool.reduce((a,e)=>a+e.weight, 0);
      let roll = Math.random() * totalWeight;
      const picked = pool.find(e => (roll -= e.weight) <= 0) || pool[pool.length-1];
      if (picked.type === 'caps') {
        const capsGain = 10 + Math.floor(Math.random() * 20);
        state.caps += capsGain; updateStats();
        log('Looted ' + capsGain + ' caps from ' + target.name + '!', 'loot');
      } else if (picked.type === 'material') {
        state.materials[picked.item] = (state.materials[picked.item]||0) + 1;
        log('Salvaged ' + picked.name + ' from ' + target.name + '!', 'loot');
        renderMaterials();
      } else {
        state.items[picked.item] = (state.items[picked.item]||0) + 1;
        log('Looted ' + picked.name + ' from ' + target.name + '!', 'loot');
      }
      renderItems();
    }
  }
  if(!skipAdvance){
    if(liveEnemies().length===0){setTimeout(()=>showVictory(),400);return;}
    const fi=state.enemies.findIndex(e=>e.curHp>0);
    if(fi>=0){state.targetIdx=fi;renderEnemies();}
    advancePartyTurn();
  }
}

function advancePartyTurn() {
  state.adrenBuff=false; state.defBuff=false;
  let next=-1;
  for(let i=state.activeIdx+1;i<state.party.length;i++){if(state.party[i].hp>0){next=i;break;}}
  if(next>=0){
    state.activeIdx=next; state.busy=false;
    const m=state.party[next];
    setTurnBanner('player', state.party.length>1?m.name:null);
    setButtons(true); renderParty();
    log('&#8212; '+m.icon+' '+m.name+'\'s turn &#8212;','system');
  } else {
    endPlayerTurn();
  }
}

function startPartyTurnSequence() {
  let first=state.party.findIndex(m=>m.hp>0);
  if(first<0){checkDeath();return;}
  state.activeIdx=first; state.turn='player'; state.busy=false;
  const m=state.party[first];
  setTurnBanner('player',state.party.length>1?m.name:null);
  setButtons(true); renderAll();
  if(state.party.length>1) log('&#8212; '+m.icon+' '+m.name+'\'s turn &#8212;','system');
  else log('&#8212; Your turn &#8212;','system');
}

// ═══════════════════════════════════════════════════
//  ABILITY SYSTEM
// ═══════════════════════════════════════════════════
function openAbilityMenu() {
  if(state.busy||state.turn!=='player') return;
  const m=activePartyMember();
  if(!m||m.hp<=0) return;
  const grid=document.getElementById('ability-menu-grid');
  const abilityDefs=DATA.abilities?.player||{};
  grid.innerHTML='';
  document.getElementById('heal-target-wrap').style.display='none';
  m.abilities.forEach(abId=>{
    const ab=abilityDefs[abId]; if(!ab) return;
    const canCast=m.energy>=ab.cost;
    const btn=document.createElement('button');
    btn.className='ability-menu-btn'; btn.disabled=!canCast;
    btn.innerHTML=`<div class="amenu-icon">${ab.icon}</div><div class="amenu-name">${ab.name}</div><div class="amenu-cost">&#9889; ${ab.cost} EN</div><div class="amenu-desc">${ab.description}</div>`;
    btn.onclick=()=>selectAbility(ab);
    grid.appendChild(btn);
  });
  document.getElementById('overlay-abilities').classList.add('open');
}
function closeAbilityMenu() {
  document.getElementById('overlay-abilities').classList.remove('open');
  document.getElementById('heal-target-wrap').style.display='none';
}
function selectAbility(ab) {
  const needsPartyTarget=['heal','heal_party','buff_party','sacrifice_heal'].includes(ab.type);
  if(needsPartyTarget){
    document.getElementById('heal-target-wrap').style.display='block';
    const list=document.getElementById('heal-target-list'); list.innerHTML='';
    state.party.forEach(pm=>{
      const btn=document.createElement('button');
      btn.className='heal-target-btn';
      const eligible=ab.type==='heal'||ab.type==='heal_party'?pm.hp>0&&pm.hp<pm.maxHp:ab.type==='buff_party'?pm.hp>0&&pm.energy<pm.maxEn:pm.hp>0;
      btn.disabled=!eligible;
      btn.textContent=pm.icon+' '+pm.name+' ('+pm.hp+'/'+pm.maxHp+' HP)';
      btn.onclick=()=>{closeAbilityMenu();castAbility(ab,pm);};
      list.appendChild(btn);
    });
  } else {
    closeAbilityMenu(); castAbility(ab,null);
  }
}

function castAbility(ab,targetOverride) {
  state.busy=true; setButtons(false);
  const m=activePartyMember();
  m.energy=Math.max(0,m.energy-ab.cost);
  if(m.passiveId==='tech_salvager'&&ab.tags&&ab.tags.some(t=>['tech','energy','intelligence'].includes(t)))
    m.energy=Math.min(m.maxEn,m.energy+2);

  const advanceFn=()=>advancePartyTurn();

  if(ab.type==='dmg'){
    const target=getTarget();if(!target){advanceFn();return;}
    let dmg=Math.floor(Math.random()*(ab.dmg[1]-ab.dmg[0])+ab.dmg[0]);
    dmg=ab.armorPierce?Math.max(1,dmg):Math.max(1,dmg-Math.floor(target.armor/2));
    if(state.adrenBuff) dmg=Math.floor(dmg*1.3);
    target.curHp=Math.max(0,target.curHp-dmg); flashEnemies();
    log(m.icon+' '+ab.icon+' '+ab.name+' hits '+target.name+' for <b>'+dmg+'</b>!','ability');
    renderEnemies(); setTimeout(()=>handleEnemyHit(target),500);

  } else if(ab.type==='dmg_multi'){
    const live=liveEnemies();if(!live.length){advanceFn();return;}
    const hitCount=Math.floor(Math.random()*(ab.hits[1]-ab.hits[0]+1))+ab.hits[0];
    const targets=Array.from({length:hitCount},()=>live[Math.floor(Math.random()*live.length)]);
    log(m.icon+' '+ab.icon+' '+ab.name+' &#8212; '+hitCount+' hits!','ability');
    let delay=0;
    const finalizeDmgMulti=()=>{
      [...new Set(targets)].forEach(tgt=>{if(tgt.curHp<=0)handleEnemyHit(tgt,true);});
      if(liveEnemies().length===0){setTimeout(()=>showVictory(),400);return;}
      const fi=state.enemies.findIndex(e=>e.curHp>0);
      if(fi>=0){state.targetIdx=fi;renderEnemies();}
      advanceFn();
    };
    targets.forEach((t,i)=>{
      setTimeout(()=>{
        if(t.curHp>0){
          let dmg=Math.floor(Math.random()*(ab.dmg[1]-ab.dmg[0])+ab.dmg[0]);
          dmg=Math.max(1,dmg-Math.floor(t.armor/2));
          t.curHp=Math.max(0,t.curHp-dmg); flashEnemies();
          log('  &#8627; '+t.name+': <b>'+dmg+'</b>','ability'); renderEnemies();
        }
        if(i===targets.length-1) setTimeout(finalizeDmgMulti,300);
      },delay); delay+=250;
    });

  } else if(ab.type==='dmg_all'){
    const live=liveEnemies();if(!live.length){advanceFn();return;}
    log(m.icon+' '+ab.icon+' '+ab.name+' &#8212; hits ALL enemies!','ability');
    live.forEach(t=>{let dmg=Math.floor(Math.random()*(ab.dmg[1]-ab.dmg[0])+ab.dmg[0]);dmg=Math.max(1,dmg-Math.floor(t.armor/2));t.curHp=Math.max(0,t.curHp-dmg);log('  &#8627; '+t.name+': <b>'+dmg+'</b>','ability');});
    flashEnemies(); renderEnemies();
    setTimeout(()=>{live.forEach(t=>{if(t.curHp<=0)handleEnemyHit(t,true);});if(liveEnemies().length===0){setTimeout(()=>showVictory(),400);return;}const fi=state.enemies.findIndex(e=>e.curHp>0);if(fi>=0){state.targetIdx=fi;renderEnemies();}advanceFn();},500);

  } else if(ab.type==='dmg_stun'){
    const target=getTarget();if(!target){advanceFn();return;}
    let dmg=Math.floor(Math.random()*(ab.dmg[1]-ab.dmg[0])+ab.dmg[0]);
    dmg=Math.max(1,dmg-Math.floor(target.armor/2));
    target.curHp=Math.max(0,target.curHp-dmg); target.stunTurns=ab.stunTurns;
    const mpDrain=Math.round(target.energy*(ab.mpDrain[0]+Math.random()*(ab.mpDrain[1]-ab.mpDrain[0])));
    target.energy=Math.max(0,(target.energy||0)-mpDrain); flashEnemies();
    log(m.icon+' '+ab.icon+' '+ab.name+' &#8212; '+target.name+' stunned '+ab.stunTurns+' turns! <b>'+dmg+'</b>','ability');
    renderEnemies(); renderParty(); setTimeout(()=>handleEnemyHit(target),500);

  } else if(ab.type==='dmg_poison'){
    const target=getTarget();if(!target){advanceFn();return;}
    let dmg=Math.floor(Math.random()*(ab.dmg[1]-ab.dmg[0])+ab.dmg[0]);
    dmg=Math.max(1,dmg-Math.floor(target.armor/2));
    const turns=Math.floor(Math.random()*(ab.poisonTurns[1]-ab.poisonTurns[0]+1))+ab.poisonTurns[0];
    const poisDmg=Math.max(2,Math.round(target.maxHp*ab.poisonPct));
    target.curHp=Math.max(0,target.curHp-dmg); target.poisonTurns=turns; target.poisonDmg=poisDmg; flashEnemies();
    log(m.icon+' '+ab.icon+' '+ab.name+' &#8212; '+target.name+' poisoned '+turns+' turns! <b>'+dmg+'</b>','ability');
    renderEnemies(); setTimeout(()=>handleEnemyHit(target),500);

  } else if(ab.type==='dmg_self_sacrifice'){
    const target=getTarget();if(!target){advanceFn();return;}
    const hpCost=Math.round(m.maxHp*ab.selfHpCost); m.hp=Math.max(1,m.hp-hpCost);
    let dmg=Math.floor(Math.random()*(ab.dmg[1]-ab.dmg[0])+ab.dmg[0]);
    dmg=Math.max(1,dmg-Math.floor(target.armor/2)); target.curHp=Math.max(0,target.curHp-dmg);
    flashEnemies(); flashParty();
    log(m.icon+' '+ab.icon+' '+ab.name+' &#8212; '+target.name+' takes <b>'+dmg+'</b>! (Self: -'+hpCost+' HP)','ability');
    renderEnemies(); renderParty(); setTimeout(()=>handleEnemyHit(target),500);

  } else if(ab.type==='heal'){
    const ht=targetOverride||m;
    const heal=Math.floor(Math.random()*(ab.heal[1]-ab.heal[0])+ab.heal[0]);
    const bonus=state.party.some(pm=>pm.passiveId==='medic'&&pm.hp>0)?1.25:1;
    const actual=Math.min(ht.maxHp-ht.hp,Math.round(heal*bonus));
    ht.hp=Math.min(ht.maxHp,ht.hp+actual);
    log(m.icon+' '+ab.icon+' '+ab.name+' &#8212; '+ht.name+' recovers <b>'+actual+'</b> HP!','heal');
    renderParty(); setTimeout(advanceFn,600);

  } else if(ab.type==='heal_party'){
    const bonus=state.party.some(pm=>pm.passiveId==='medic'&&pm.hp>0)?1.25:1;
    log(m.icon+' '+ab.icon+' '+ab.name+' &#8212; heals the squad!','heal');
    state.party.forEach(pm=>{
      if(pm.hp<=0) return;
      const heal=Math.round(pm.maxHp*ab.healPct*bonus);
      const actual=Math.min(pm.maxHp-pm.hp,heal);
      pm.hp=Math.min(pm.maxHp,pm.hp+actual);
      if(actual>0) log('  &#8627; '+pm.icon+' '+pm.name+': <b>+'+actual+'</b> HP','heal');
    });
    renderParty(); setTimeout(advanceFn,600);

  } else if(ab.type==='buff_self'){
    const heal=Math.round(m.maxHp*ab.healPct); m.hp=Math.min(m.maxHp,m.hp+heal);
    state.adrenBuff=true;
    log(m.icon+' '+ab.icon+' '+ab.name+' &#8212; +'+heal+' HP, damage boosted!','ability');
    renderParty(); setTimeout(advanceFn,600);

  } else if(ab.type==='buff_party'){
    const ht=targetOverride||m; ht.energy=Math.min(ht.maxEn,ht.energy+ab.energyGain);
    log(m.icon+' '+ab.icon+' '+ab.name+' &#8212; '+ht.name+' +'+ab.energyGain+' Energy!','ability');
    renderParty(); setTimeout(advanceFn,600);

  } else if(ab.type==='buff_defense'){
    state.suppressBuff=true;
    log(m.icon+' '+ab.icon+' '+ab.name+' &#8212; Incoming damage -40%!','ability');
    setTimeout(advanceFn,600);

  } else if(ab.type==='buff_armor'){
    state.defBuff=true;
    log(m.icon+' '+ab.icon+' '+ab.name+' &#8212; Squad armor greatly increased!','ability');
    setTimeout(advanceFn,600);

  } else if(ab.type==='steal'){
    const target=getTarget();if(!target){advanceFn();return;}
    if(Math.random()<ab.successChance){
      const roll=Math.random();
      if(roll<0.55){state.items.stim=(state.items.stim||0)+1;log(m.icon+' '+ab.icon+' Scavenged a Stim Pack from '+target.name+'!','loot');}
      else if(roll<0.85){state.items.power_cell=(state.items.power_cell||0)+1;log(m.icon+' '+ab.icon+' Grabbed a Power Cell!','loot');}
      else{state.items.rad_away=(state.items.rad_away||0)+1;log(m.icon+' '+ab.icon+' Swiped Rad-Away!','loot');}
      renderItems();
    } else log(m.icon+' '+ab.icon+' '+target.name+' spots the attempt.','system');
    setTimeout(advanceFn,600);

  } else if(ab.type==='sacrifice_heal'){
    const ht=targetOverride||m;
    const hpCost=Math.round(m.maxHp*ab.hpCost); m.hp=Math.max(1,m.hp-hpCost);
    const restored=Math.round(ht.maxHp*0.20);
    const actual=Math.min(ht.maxHp-ht.hp,restored);
    ht.hp=Math.min(ht.maxHp,ht.hp+actual);
    log(m.icon+' '+ab.icon+' '+ab.name+' &#8212; sacrificed '+hpCost+' HP, '+ht.name+' gains '+actual+' HP.','ability');
    renderParty(); setTimeout(advanceFn,600);
  } else advanceFn();
}

// ═══════════════════════════════════════════════════
//  ITEMS
// ═══════════════════════════════════════════════════
function useItem() {
  if(state.busy||state.turn!=='player') return;
  const itemDefs=DATA.items?.consumables||{};
  state.busy=true; setButtons(false);
  const injured=state.party.filter(pm=>pm.hp>0&&pm.hp<pm.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);
  const needsEnergy=state.party.filter(pm=>pm.hp>0&&pm.energy<pm.maxEn);
  const m=activePartyMember();

  if(injured.length>0&&(state.items.stim||0)>0){
    const t=injured[0];const heal=Math.min(t.maxHp-t.hp,itemDefs.stim?.heal||35);
    t.hp+=heal;state.items.stim--;
    log(t.icon+' '+t.name+' uses Stim Pack &#8212; <b>+'+heal+' HP</b>.','heal');
  } else if(needsEnergy.length>0&&(state.items.power_cell||0)>0){
    const t=needsEnergy.find(pm=>pm===m)||needsEnergy[0];
    const en=Math.min(t.maxEn-t.energy,itemDefs.power_cell?.energy||25);
    t.energy+=en;state.items.power_cell--;
    log(t.icon+' '+t.name+' uses Power Cell &#8212; <b>+'+en+' EN</b>.','heal');
  } else if((state.items.revival_shot||0)>0){
    const fallen=state.party.filter(pm=>pm.hp<=0);
    if(fallen.length>0){fallen[0].hp=Math.floor(fallen[0].maxHp*0.5);state.items.revival_shot--;log(fallen[0].icon+' '+fallen[0].name+' revived at 50% HP!','heal');}
    else{log('No fallen squad members.','system');state.busy=false;setButtons(true);return;}
  } else if((state.items.rad_away||0)>0){
    state.party.forEach(pm=>{pm.poisonTurns=0;pm.bleedTurns=0;});state.items.rad_away--;
    log('Rad-Away administered &#8212; status effects cleared.','heal');
  } else {
    log('Nothing to use right now.','system'); state.busy=false; setButtons(true); return;
  }
  renderParty(); renderItems();
  setTimeout(()=>advancePartyTurn(),500);
}

// ═══════════════════════════════════════════════════
//  ENEMY TURN
// ═══════════════════════════════════════════════════
function endPlayerTurn() {
  state.suppressBuff=false; state.turn='enemy'; setTurnBanner('enemy'); state.busy=false;
  const live=liveEnemies();
  log('&#8212; '+(live.length===1?live[0].name+' acts':live.length+' hostiles act')+' &#8212;','system');
  setTimeout(enemyTurn,700);
}

function enemyTurn() {
  const live=liveEnemies();
  if(!live.length){startPartyTurnSequence();return;}
  if(!liveMates().length){checkDeath();return;}

  // Status ticks on party
  state.party.forEach(pm=>{
    if(pm.hp<=0) return;
    if(pm.poisonTurns>0){pm.hp=Math.max(0,pm.hp-pm.poisonDmg);pm.poisonTurns--;log('&#9760; '+pm.name+' takes '+pm.poisonDmg+' poison!','warn');flashParty();}
    if(pm.bleedTurns>0){pm.hp=Math.max(0,pm.hp-pm.bleedDmg);pm.bleedTurns--;log(pm.name+' bleeds for '+pm.bleedDmg+'!','warn');flashParty();}
  });
  if(!liveMates().length){renderParty();checkDeath();return;}

  let delay=0;
  live.forEach((e,idx)=>{
    setTimeout(()=>{
      if(!liveMates().length) { if(idx===live.length-1) finalizeEnemyTurn(); return; }
      const aliveTargets=liveMates();
      const p=aliveTargets[Math.floor(Math.random()*aliveTargets.length)];

      if(e.stunTurns>0){
        e.stunTurns--;
        log(e.emoji+' '+e.name+' is STUNNED &#8212; can\'t act! ('+e.stunTurns+' left)','warn');
        renderEnemies();
        if(idx===live.length-1) setTimeout(()=>finalizeEnemyTurn(),400);
        return;
      }
      if(e.poisonTurns>0){e.curHp=Math.max(1,e.curHp-e.poisonDmg);e.poisonTurns--;log('&#9760; '+e.name+' writhes in poison! (-'+e.poisonDmg+' HP)','warn');renderEnemies();if(e.curHp<=1)handleEnemyHit(e,true);}
      if(e.bleedTurns>0){e.curHp=Math.max(1,e.curHp-e.bleedDmg);e.bleedTurns--;log(e.name+' bleeds for '+e.bleedDmg+'!','warn');renderEnemies();}

      const abilDefs=DATA.abilities?.enemy||{};
      const useAbil=e.abilities?.length>0&&Math.random()<0.30;
      if(useAbil){
        const abilId=e.abilities[Math.floor(Math.random()*e.abilities.length)];
        const ab=abilDefs[abilId];
        if(ab){
          if(ab.type==='dmg_all_enemy'){
            state.party.forEach(pm=>{if(pm.hp<=0)return;let dmg=Math.floor(Math.random()*(ab.dmg[1]-ab.dmg[0])+ab.dmg[0]);if(state.suppressBuff)dmg=Math.floor(dmg*0.6);if(state.defBuff)dmg=Math.floor(dmg*0.5);dmg=Math.max(1,dmg-Math.floor(pm.armor/2));pm.hp=Math.max(0,pm.hp-dmg);});
            log(e.emoji+' '+e.name+' uses '+ab.name+' &#8212; hits all!','enemy');flashParty();
          } else if(ab.type==='dmg_multi_enemy'){
            const hits=Math.floor(Math.random()*(ab.hits[1]-ab.hits[0]+1))+ab.hits[0];
            log(e.emoji+' '+e.name+' uses '+ab.name+' &#8212; '+hits+' hits!','enemy');
            for(let h=0;h<hits;h++){const tgt=aliveTargets[Math.floor(Math.random()*aliveTargets.length)];let dmg=Math.floor(Math.random()*(ab.dmg[1]-ab.dmg[0])+ab.dmg[0]);if(state.suppressBuff)dmg=Math.floor(dmg*0.6);if(state.defBuff)dmg=Math.floor(dmg*0.5);dmg=Math.max(1,dmg-Math.floor(tgt.armor/2));tgt.hp=Math.max(0,tgt.hp-dmg);log('  &#8627; '+tgt.name+': <b>'+dmg+'</b>','enemy');}
            flashParty();
          } else if(ab.type==='dmg_poison'){
            let dmg=Math.floor(Math.random()*(ab.dmg[1]-ab.dmg[0])+ab.dmg[0]);if(state.suppressBuff)dmg=Math.floor(dmg*0.6);dmg=Math.max(1,dmg-Math.floor(p.armor/2));p.hp=Math.max(0,p.hp-dmg);
            if(p.passiveId!=='mutant'){p.poisonTurns=ab.poisonTurns;p.poisonDmg=ab.poisonFlat;}
            log(e.emoji+' '+e.name+' uses '+ab.name+' on '+p.name+' for <b>'+dmg+'</b>! '+(p.passiveId==='mutant'?'(Immune)':'Poisoned!'),'enemy');flashParty();
          } else if(ab.type==='dmg_bleed'){
            let dmg=Math.floor(Math.random()*(ab.dmg[1]-ab.dmg[0])+ab.dmg[0]);dmg=Math.max(1,dmg-Math.floor(p.armor/2));p.hp=Math.max(0,p.hp-dmg);p.bleedTurns=ab.bleedTurns;p.bleedDmg=ab.bleedFlat;
            log(e.emoji+' '+e.name+' uses '+ab.name+' on '+p.name+' for <b>'+dmg+'</b>! Bleeding!','enemy');flashParty();
          } else if(ab.type==='buff_self_armor'){
            e.armor=(e.armor||0)+ab.armorBonus;log(e.emoji+' '+e.name+' hardens &#8212; armor +'+ab.armorBonus+'!','enemy');
          } else {
            let dmg=Math.floor(Math.random()*(ab.dmg[1]-ab.dmg[0])+ab.dmg[0]);if(state.suppressBuff)dmg=Math.floor(dmg*0.6);if(state.defBuff)dmg=Math.floor(dmg*0.5);dmg=Math.max(1,dmg-Math.floor(p.armor/2));p.hp=Math.max(0,p.hp-dmg);
            log(e.emoji+' '+e.name+' uses '+ab.name+' on '+p.name+' for <b>'+dmg+'</b>!','enemy');flashParty();
          }
        }
      } else {
        let dmg=Math.floor(Math.random()*6+e.attack)-Math.floor(p.armor/2);
        if(state.suppressBuff)dmg=Math.floor(dmg*0.6);if(state.defBuff)dmg=Math.floor(dmg*0.5);dmg=Math.max(1,dmg);
        p.hp=Math.max(0,p.hp-dmg);
        log(e.emoji+' '+e.name+' attacks '+p.name+' for <b>'+dmg+'</b>!','enemy');flashParty();
      }
      renderParty();
      if(!liveMates().length) { setTimeout(()=>finalizeEnemyTurn(),400); return; }
      if(idx===live.length-1) setTimeout(()=>finalizeEnemyTurn(),400);
    },delay); delay+=320;
  });
}

function finalizeEnemyTurn() {
  state.suppressBuff=false;
  if(!liveMates().length){checkDeath();return;}
  startPartyTurnSequence();
}
function startPlayerTurn() { startPartyTurnSequence(); }

// ═══════════════════════════════════════════════════
//  LEVEL / DEATH / VICTORY
// ═══════════════════════════════════════════════════
function checkLevelUp() {
  const newLevel=Math.floor(state.xp/120)+1;
  state.party.forEach(m=>{
    if(newLevel>m.level){
      m.level=newLevel; m.maxHp+=6; m.hp=Math.min(m.maxHp,m.hp+6);
      m.maxEn+=4; m.energy=Math.min(m.maxEn,m.energy+4); m.atk+=2; m.armor+=1;
      log('&#9733; '+m.icon+' '+m.name+' Level '+m.level+'! +6 HP, +4 EN, +2 ATK, +1 Armor','loot');
    }
  });
  renderParty();
}

function checkDeath() {
  if(liveMates().length>0) return;
  setTimeout(()=>{
    document.getElementById('death-stats').innerHTML=`<div>Zone reached: <span>${state.zone}</span></div><div>Enemies eliminated: <span>${state.kills}</span></div><div>XP earned: <span>${state.xp}</span></div>`;
    document.getElementById('overlay-death').classList.add('open');
  },400);
}

function showVictory() {
  renderAll();
  setTimeout(()=>{
    const lines=["The hostiles are down. Reload and keep moving.","Area clear. Don't get comfortable.","They're all dead. So far, so are you.",state.kills+" kills and counting. The wasteland isn't done with you yet."];
    document.getElementById('victory-sub').textContent=lines[Math.floor(Math.random()*lines.length)];
    const partyEl=document.getElementById('victory-party');
    partyEl.innerHTML=state.party.map(m=>{
      const hpPct=Math.max(0,m.hp/m.maxHp*100);
      const enPct=Math.max(0,m.energy/m.maxEn*100);
      return `<div class="victory-member${m.hp<=0?' fallen':''}">
        <div class="v-name">${m.icon} ${m.name}</div>
        <div class="v-bar-row"><span class="v-bar-label">HP</span><div class="v-bar"><div class="v-bar-fill hp" style="width:${hpPct}%"></div></div><span class="v-bar-val">${m.hp<=0?'FALLEN':m.hp+'/'+m.maxHp}</span></div>
        <div class="v-bar-row"><span class="v-bar-label">EN</span><div class="v-bar"><div class="v-bar-fill en" style="width:${enPct}%"></div></div><span class="v-bar-val">${m.energy+'/'+m.maxEn}</span></div>
      </div>`;
    }).join('');
    document.getElementById('victory-gains').innerHTML=`<div>&#9876; KILLS <span>${state.battleKills}</span></div><div>&#9733; XP <span>+${state.battleXp}</span></div><div>&#9672; CAPS <span>+${state.battleCaps}</span></div><div>TOTAL XP <span>${state.xp}</span></div><div>ZONE <span>${state.zone}</span></div>`;
    document.getElementById('overlay-victory').classList.add('open');
  },300);
}

function nextEncounter() {
  document.getElementById('overlay-victory').classList.remove('open');
  if(state.kills%3===0&&state.zone<5){
    state.zone++;
    const z=DATA.zones?.find(z=>z.id===state.zone);
    log('&#9672; Moving into '+(z?.name||'Zone '+state.zone)+'...','system');
    log(z?.ambience||'','system');
  }
  state.party.forEach(m=>{if(m.hp<=0)return;m.hp=Math.min(m.maxHp,m.hp+8);m.energy=Math.min(m.maxEn,m.energy+6);});
  const z=DATA.zones?.find(z=>z.id===state.zone);
  const trapW=z?.trapWeight||0.15; const scavW=z?.scavengeWeight||0.15;
  const roll=Math.random();
  if(roll<trapW) triggerTrap();
  else if(roll<trapW+scavW) triggerScavenge();
  else{spawnEnemies();renderAll();announceEnemies();startPartyTurnSequence();}
}

function restartGame() {
  document.getElementById('overlay-death').classList.remove('open');
  // Full state reset so stale turn/busy flags don't bleed into the new run
  state = {
    party: [], activeIdx: 0,
    enemies: [], targetIdx: 0,
    zone: 1, kills: 0, xp: 0, caps: 0,
    items: {},
    materials: { scrap:0, tech_parts:0, chitin:0, mutant_tissue:0 },
    turn: 'player', busy: false,
    battleXp: 0, battleCaps: 0, battleKills: 0,
    defBuff: false, adrenBuff: false, suppressBuff: false,
  };
  cc={step:0,name:'',background:null,stats:{STR:3,AGI:3,INT:3,END:3,LCK:3},selectedAbilities:[]};
  showCharCreate();
}

// ═══════════════════════════════════════════════════
//  TRAPS & SCAVENGE
// ═══════════════════════════════════════════════════
const TRAP_EVENTS=[
  {icon:'🕳',title:'PUNJI TRAP',desc:'A concealed pit lined with sharpened rebar.',type:'hp',dmgPct:[0.12,0.22]},
  {icon:'💣',title:'TRIPWIRE MINE',desc:'A pre-war antipersonnel mine triggers underfoot.',type:'hp',dmgPct:[0.15,0.28]},
  {icon:'☢️',title:'RAD VENT',desc:'A cracked pipe vents irradiated steam.',type:'hp',dmgPct:[0.10,0.18]},
  {icon:'🔌',title:'SHOCK WIRE',desc:'A live wire drops from the ceiling and makes contact.',type:'en',drainPct:[0.25,0.45]},
  {icon:'💜',title:'EMP EMITTER',desc:'A military-grade EMP pulse drains your tech systems.',type:'en',drainPct:[0.30,0.50]},
  {icon:'🌡️',title:'CRYOGENIC BURST',desc:'A ruptured cryo-canister flash-freezes your extremities.',type:'mixed',dmgPct:[0.10,0.16],drainPct:[0.15,0.25]},
];
const SCAVENGE_EVENTS=[
  {icon:'📦',title:'SUPPLY CACHE',desc:'Beneath a collapsed wall — a sealed pre-war supply crate.',loot:[{item:'stim',count:[1,3]}]},
  {icon:'🏥',title:'FIELD MEDIC KIT',desc:'An abandoned trauma kit, contents mostly intact.',loot:[{item:'stim',count:[2,4]}]},
  {icon:'⚡',title:'POWER STATION',desc:'A still-running micro-reactor. Your cells charge up.',loot:[{item:'power_cell',count:[2,3]}]},
  {icon:'🧪',title:'CHEM LAB REMNANTS',desc:"A raider chemist's lab, abandoned in a hurry.",loot:[{item:'stim',count:[1,2]},{item:'rad_away',count:[1,2]}]},
  {icon:'💰',title:'RAIDER STASH',desc:'A tin box stuffed with caps and gear behind a false wall.',caps:[30,60],loot:[{item:'stim',count:[1,2]}]},
  {icon:'⭐',title:'RARE FIND',desc:"A pre-war military case. Whatever's inside has never been opened.",loot:[{item:'revival_shot',count:1},{item:'stim',count:2}]},
];

function triggerTrap() {
  const trap=TRAP_EVENTS[Math.floor(Math.random()*TRAP_EVENTS.length)];
  const p=getPlayer(); const zoneMult=1+(state.zone-1)*0.15; const levelMult=1+(p.level-1)*0.07; const scale=zoneMult*levelMult;
  const effects=[];
  if(trap.type==='hp'||trap.type==='mixed'){const dmg=Math.max(1,Math.round(p.maxHp*(trap.dmgPct[0]+Math.random()*(trap.dmgPct[1]-trap.dmgPct[0]))*scale));p.hp=Math.max(1,p.hp-dmg);effects.push('<span style="color:var(--red-bright)">'+p.name+' takes '+dmg+' damage</span>');}
  if(trap.type==='en'||trap.type==='mixed'){const drain=Math.max(1,Math.round(p.maxEn*(trap.drainPct[0]+Math.random()*(trap.drainPct[1]-trap.drainPct[0]))*scale));p.energy=Math.max(0,p.energy-drain);effects.push('<span style="color:var(--blue-bright)">'+p.name+' loses '+drain+' Energy</span>');}
  showEventOverlay(trap,effects,'trap'); renderParty();
}

function triggerScavenge() {
  const event=SCAVENGE_EVENTS[Math.floor(Math.random()*SCAVENGE_EVENTS.length)]; const effects=[];
  if(event.caps){const caps=event.caps[0]+Math.floor(Math.random()*(event.caps[1]-event.caps[0]+1));state.caps+=caps;state.xp+=5;effects.push('<span style="color:var(--amber)">+'+caps+' Caps</span>');updateStats();}
  (event.loot||[]).forEach(l=>{const count=Array.isArray(l.count)?l.count[0]+Math.floor(Math.random()*(l.count[1]-l.count[0]+1)):l.count;if(count>0){state.items[l.item]=(state.items[l.item]||0)+count;const def=DATA.items?.consumables?.[l.item];effects.push('<span style="color:var(--green-bright)">Found '+count+'x '+(def?.name||l.item)+'</span>');}});
  renderItems(); showEventOverlay(event,effects,'scavenge');
}

function showEventOverlay(event,effects,type) {
  document.getElementById('event-icon').textContent=event.icon;
  document.getElementById('event-title').textContent=event.title;
  document.getElementById('event-title').style.color=type==='scavenge'?'var(--amber)':'var(--red-bright)';
  document.getElementById('event-desc').textContent=event.desc;
  document.getElementById('event-effects').innerHTML=effects.join('<br>');
  document.getElementById('overlay-event').classList.add('open');
}
function dismissEvent() { document.getElementById('overlay-event').classList.remove('open'); spawnEnemies(); renderAll(); announceEnemies(); startPartyTurnSequence(); }
function announceEnemies() {
  const live=liveEnemies(); const groups={};
  live.forEach(e=>groups[e.name]=(groups[e.name]||0)+1);
  const parts=Object.entries(groups).map(([n,c])=>c>1?c+'x '+n:'a '+n);
  const desc=parts.length<=1?parts[0]:parts.slice(0,-1).join(', ')+' and '+parts[parts.length-1];
  log((live.length>1?'Group: ':'')+desc+' spotted.','enemy');
}

// ═══════════════════════════════════════════════════
//  CAMP
// ═══════════════════════════════════════════════════
function openCamp() {
  document.getElementById('overlay-victory').classList.remove('open');
  ['rest','search','research','craft','recruit'].forEach(a=>{const b=document.getElementById('camp-btn-'+a);if(b)b.disabled=false;});
  document.getElementById('camp-result').innerHTML='';
  document.getElementById('overlay-camp').classList.add('open');
}
function closeCamp() { document.getElementById('overlay-camp').classList.remove('open'); nextEncounter(); }

function doCamp(action) {
  const resultEl=document.getElementById('camp-result');
  const btn=document.getElementById('camp-btn-'+action);
  if(btn) btn.disabled=true;
  const p=getPlayer(); const lines=[];

  if(action==='rest'){
    lines.push('<b style="color:var(--amber)">The squad bunkers down...</b>');
    state.party.forEach(m=>{
      if(m.hp<=0) return;
      const hpGain=Math.round(m.maxHp*(0.40+Math.random()*0.20));
      const enGain=Math.round(m.maxEn*0.50);
      m.hp=Math.min(m.maxHp,m.hp+hpGain); m.energy=Math.min(m.maxEn,m.energy+enGain);
      m.poisonTurns=0; m.bleedTurns=0;
      lines.push(m.icon+' '+m.name+': <span style="color:var(--hp-color)">+'+hpGain+' HP</span> <span style="color:var(--en-color)">+'+enGain+' EN</span>');
    });
    lines.push('<span style="color:var(--text-dim)">Status effects cleared.</span>');
    renderParty();
  } else if(action==='search'){
    const roll=Math.random(); lines.push('<b style="color:var(--amber)">Searching the area...</b>');
    if(roll<0.12) lines.push('Nothing. Someone got here first.');
    else if(roll<0.50){const c=Math.floor(Math.random()*2)+1;state.items.stim=(state.items.stim||0)+c;lines.push('Found <span style="color:var(--hp-color)">'+c+'x Stim Pack'+(c>1?'s':'')+'.</span>');}
    else if(roll<0.75){state.items.stim=(state.items.stim||0)+1;state.items.power_cell=(state.items.power_cell||0)+1;lines.push('Found <span style="color:var(--hp-color)">1 Stim</span> and <span style="color:var(--en-color)">1 Power Cell.</span>');}
    else if(roll<0.90){state.items.power_cell=(state.items.power_cell||0)+2;lines.push('Found <span style="color:var(--en-color)">2 Power Cells.</span>');}
    else{state.items.revival_shot=(state.items.revival_shot||0)+1;const caps=20+Math.floor(Math.random()*30);state.caps+=caps;lines.push('<b style="color:var(--amber)">Jackpot &#8212;</b> Revival Shot and '+caps+' caps.');}
    renderItems(); updateStats();
  } else if(action==='research'){
    const xpGain=30+state.zone*12+Math.floor(Math.random()*20); state.xp+=xpGain;
    lines.push('<b style="color:var(--amber)">Reviewing intel by firelight...</b>');
    lines.push('Gained <span style="color:var(--amber)">'+xpGain+' XP.</span>');
    if(Math.random()<0.35){const enGain=Math.round(p.maxEn*0.25);p.energy=Math.min(p.maxEn,p.energy+enGain);lines.push('<span style="color:var(--en-color)">+'+enGain+' Energy.</span>');}
    else lines.push('<span style="color:var(--text-dim)">Nothing actionable. But knowledge is power.</span>');
    checkLevelUp(); updateStats(); renderParty();
  } else if(action==='craft'){
    lines.push('<b style="color:var(--amber)">Setting up the chem station...</b>');
    // Recipes: each requires caps + specific materials
    const RECIPES = [
      { type:'stim',         name:'Stim Pack',    color:'var(--hp-color)', capCost:15, mats:{ scrap:2 },                       weight:0.40 },
      { type:'power_cell',   name:'Power Cell',   color:'var(--en-color)', capCost:20, mats:{ scrap:1, tech_parts:1 },          weight:0.35 },
      { type:'rad_away',     name:'Rad-Away',     color:'var(--green)',     capCost:10, mats:{ mutant_tissue:2 },               weight:0.15 },
      { type:'super_stim',   name:'Super Stim',   color:'var(--amber)',     capCost:40, mats:{ scrap:2, mutant_tissue:2 },      weight:0.07 },
      { type:'revival_shot', name:'Revival Shot', color:'var(--amber)',     capCost:80, mats:{ tech_parts:2, chitin:2 },        weight:0.03 },
    ];
    // Pick recipe by weight
    const totalW=RECIPES.reduce((a,r)=>a+r.weight,0);
    let rroll=Math.random()*totalW;
    const recipe=RECIPES.find(r=>(rroll-=r.weight)<=0)||RECIPES[0];
    const count=Math.floor(Math.random()*5)+1;
    const totalCaps=count*recipe.capCost;
    // Check material requirements (scaled by count)
    const matNeeds=Object.entries(recipe.mats).map(([m,n])=>({mat:m,need:n*count,have:state.materials[m]||0}));
    const missingMats=matNeeds.filter(r=>r.have<r.need);
    const matList=matNeeds.map(r=>r.need+'x '+r.mat.replace('_',' ')).join(', ');
    lines.push('Recipe: <b>'+count+'x '+recipe.name+'</b> — costs '+totalCaps+' caps + '+matList+'.');
    if(state.caps<totalCaps){
      lines.push('<b style="color:var(--red-bright)">NOT ENOUGH CAPS</b> — need '+totalCaps+', have '+state.caps+'.');
      if(btn) btn.disabled=false;
    } else if(missingMats.length>0){
      lines.push('<b style="color:var(--red-bright)">MISSING MATERIALS:</b> '+missingMats.map(r=>(r.need-r.have)+'x '+r.mat.replace('_',' ')+' short').join(', ')+'.');
      const dmg=Math.max(1,Math.round(p.maxHp*(0.05+Math.random()*0.10)));
      p.hp=Math.max(1,p.hp-dmg);
      lines.push(p.icon+' Botched experiment — takes <span style="color:var(--red-bright)">'+dmg+' damage.</span>');
      if(btn) btn.disabled=false;
    } else {
      state.caps-=totalCaps;
      matNeeds.forEach(r=>{ state.materials[r.mat]-=r.need; });
      state.items[recipe.type]=(state.items[recipe.type]||0)+count;
      lines.push('Synthesized <span style="color:'+recipe.color+'">'+count+'x '+recipe.name+'</span> for -'+totalCaps+' caps.');
    }
    renderParty(); renderItems(); renderMaterials(); updateStats();
  }
  resultEl.innerHTML=lines.join('<br>');
}

// ═══════════════════════════════════════════════════
//  SCREEN MANAGEMENT + BOOT
// ═══════════════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
window.onload=()=>loadData();
