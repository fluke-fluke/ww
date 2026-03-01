import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { rolesData, eventTable } from "./roles.js";

const app = initializeApp({
    apiKey: "AIzaSyD3votmuYJDxy7--PvFj_qe-vk2axspjqo",
    databaseURL: "https://fir-77b01-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = getDatabase(app);

let myName = "", currentRoom = "", players = [], selectedQty = {};
let drunkShowingTrue = false;

// ─── Auth ───────────────────────────────────────────────────────────────────

document.getElementById('btn-create').onclick = async () => {
    myName = document.getElementById('username').value.trim();
    if (!myName) return alert("ใส่ชื่อด้วย");
    currentRoom = Math.floor(1000 + Math.random() * 9000).toString();
    await set(ref(db, 'rooms/' + currentRoom), {
        status: 'waiting', gm: myName, players: { [myName]: true }, phase: 0
    });
    initLobby();
};

document.getElementById('btn-join').onclick = async () => {
    myName = document.getElementById('username').value.trim();
    currentRoom = document.getElementById('room-code').value.trim();
    if (!myName || !currentRoom) return alert("ข้อมูลไม่ครบ");
    await update(ref(db, `rooms/${currentRoom}/players`), { [myName]: true });
    initLobby();
};

// ─── Lobby ──────────────────────────────────────────────────────────────────

function initLobby() {
    document.getElementById('screen-auth').classList.add('hidden');
    document.getElementById('screen-lobby').classList.remove('hidden');
    document.getElementById('display-room').innerText = currentRoom;

    onValue(ref(db, 'rooms/' + currentRoom), (snap) => {
        const data = snap.val();
        if (!data) return;

        const all = Object.keys(data.players || {});
        players = all.filter(n => n !== data.gm);

        document.getElementById('player-list').innerHTML = all.map(p =>
            `<div class="player-badge">${p}${p === data.gm ? '<span class="gm-badge">GM</span>' : ''}</div>`
        ).join('');
        document.getElementById('count-total').innerText = players.length;

        if (data.gm === myName) {
            document.getElementById('gm-setup').classList.remove('hidden');
            document.getElementById('wait-msg').classList.add('hidden');
            renderRoleSelector(data.lastSelected || {});
            document.getElementById('select-gm').innerHTML =
                '<option value="">-- โอน GM --</option>' +
                players.map(p => `<option value="${p}">${p}</option>`).join('');
        } else {
            document.getElementById('gm-setup').classList.add('hidden');
            document.getElementById('wait-msg').classList.remove('hidden');
        }

        if (data.status === 'playing') renderGame(data);
        else if (data.status === 'ended') renderResult(data);
        else if (data.status === 'waiting') {
            document.body.className = '';
            document.getElementById('screen-game').classList.add('hidden');
            document.getElementById('screen-result').classList.add('hidden');
            document.getElementById('screen-lobby').classList.remove('hidden');
        }
    });
}

window.transferGM = (newGM) => {
    if (newGM && confirm(`โอน GM ให้ ${newGM}?`))
        update(ref(db, 'rooms/' + currentRoom), { gm: newGM });
};

// ─── Role Selector ───────────────────────────────────────────────────────────

function renderRoleSelector(saved) {
    const container = document.getElementById('role-selector');
    if (container.innerHTML !== "") return;
    selectedQty = saved;

    const groups = [
        { id: 'human', n: '🛡️ ฝ่ายมนุษย์' },
        { id: 'wolf',  n: '🐺 ฝ่ายหมาป่า' },
        { id: 'other', n: '🔮 ฝ่ายอิสระ' },
    ];

    groups.forEach(g => {
        const h = document.createElement('div');
        h.className = `role-group-header group-${g.id}`;
        h.innerText = g.n;
        container.appendChild(h);

        rolesData.filter(r => r.team === g.id).forEach(r => {
            const isSpecial = !!r.special;
            const div = document.createElement('div');
            div.className = 'role-item';
            div.innerHTML = `
                <div>
                    <b>${r.name}</b> <small>(${r.en})</small>
                    ${isSpecial ? '<span style="color:var(--drunk);font-size:0.8em;"> ⭐ ไม่นับ slot</span>' : ''}
                    <br><span style="font-size:0.8em; color:${r.p < 0 ? 'var(--w)' : r.p > 0 ? 'var(--v)' : '#aaa'}">
                        ${r.p > 0 ? '+' + r.p : r.p === 0 ? '0' : r.p} แต้ม
                    </span>
                    <br><span style="font-size:0.75em; color:#888;">${r.desc}</span>
                </div>
                <div class="qty-controls">
                    <button class="btn-qty" onclick="window.changeQty('${r.id}', -1, ${isSpecial ? 1 : 999})">-</button>
                    <b id="qty-${r.id}" class="qty-num">${selectedQty[r.id] || 0}</b>
                    <button class="btn-qty" onclick="window.changeQty('${r.id}', 1, ${isSpecial ? 1 : 999})">+</button>
                </div>`;
            container.appendChild(div);
        });
    });

    updateQtyUI();
}

window.changeQty = (id, d, max = 999) => {
    selectedQty[id] = Math.min(max, Math.max(0, (selectedQty[id] || 0) + d));
    document.getElementById(`qty-${id}`).innerText = selectedQty[id];
    updateQtyUI();
};

function updateQtyUI() {
    let t = 0, s = 0;
    for (let id in selectedQty) {
        const role = rolesData.find(r => r.id === id);
        if (!role) continue;
        if (!role.special) t += selectedQty[id];
        s += selectedQty[id] * role.p;
    }
    document.getElementById('count-sel').innerText = t;
    document.getElementById('count-sel').style.color = (t === players.length) ? 'var(--v)' : 'var(--w)';
    document.getElementById('balance-score').innerText = `แต้มสมดุล: ${s}`;
}

// ─── Start Game ──────────────────────────────────────────────────────────────

document.getElementById('btn-start-game').onclick = () => {
    let final = [];
    for (let id in selectedQty) {
        const role = rolesData.find(r => r.id === id);
        if (!role || role.special) continue;
        for (let i = 0; i < selectedQty[id]; i++) final.push(role);
    }
    if (final.length !== players.length)
        return alert(`บทบาทไม่ครบ! (เลือก ${final.length} / ผู้เล่น ${players.length})`);

    const shuffled = final.sort(() => Math.random() - 0.5);
    const useDrunk = (selectedQty['special_drunk'] || 0) > 0;
    const drunkIndex = useDrunk ? Math.floor(Math.random() * players.length) : -1;

    let gameData = {};
    players.forEach((p, i) => {
        const isDrunk = (i === drunkIndex);
        gameData[p] = {
            role:          isDrunk ? 'ขี้เมา'    : shuffled[i].name,
            en:            isDrunk ? 'Drunk'      : shuffled[i].en,
            desc:          isDrunk ? 'เป็นขี้เมาในสองคืนแรก คืนที่สามจะรู้ว่าที่จริงแล้วเป็นอะไร (อาจจะเป็นประธานบริษัท)' : shuffled[i].desc,
            status:        'normal',
            isLinked:      false,
            inCult:        false,
            inHood:        false,
            isDrunk:       isDrunk,
            trueRole:      isDrunk ? shuffled[i].name : '',
            trueEn:        isDrunk ? shuffled[i].en   : '',
            trueDesc:      isDrunk ? shuffled[i].desc : '',
            drunkRevealed: false,
        };
    });

    update(ref(db, 'rooms/' + currentRoom), {
        status: 'playing', gameData, phase: 0,
        lastSelected: selectedQty,
        useEvents: document.getElementById('use-events').checked,
        hasCupid: (selectedQty['v4'] || 0) > 0,
        hasCult:  (selectedQty['o4'] || 0) > 0,
        hasHood:  (selectedQty['o1'] || 0) > 0,
        hasDrunk: useDrunk,
        currentEvent: null, isRolling: false,
    });
};

// ─── Render Game ─────────────────────────────────────────────────────────────

function renderGame(data) {
    document.getElementById('screen-lobby').classList.add('hidden');
    document.getElementById('screen-game').classList.remove('hidden');
    document.body.className = `phase-${data.phase}`;

    const phases = [
        { n: "คืนมืดมิด 🌙", b: "#1e3799" },
        { n: "เช้าวันใหม่ ☀️", b: "#f39c12" },
        { n: "เวลาโหวต ⚖️",   b: "#e74c3c" },
    ];
    document.getElementById('phase-label').innerText = phases[data.phase].n;
    document.getElementById('phase-label').style.background = phases[data.phase].b;

    // Event display
    const evDisplay = document.getElementById('event-display');
    const evText    = document.getElementById('event-text');
    if (data.isRolling) {
        evDisplay.classList.remove('hidden');
        evText.innerHTML = `<span class="rolling">🎲 กำลังทอยลูกเต๋า...</span>`;
    } else if (data.useEvents && data.currentEvent) {
        evDisplay.classList.remove('hidden');
        evText.innerText = eventTable[data.currentEvent] || "ปกติ";
    } else {
        evDisplay.classList.add('hidden');
    }

    if (data.gm === myName) {
        // GM view
        document.getElementById('gm-view').classList.remove('hidden');
        document.getElementById('player-view').classList.add('hidden');
        const showRoll = data.useEvents && data.phase === 1 && !data.currentEvent && !data.isRolling;
        document.getElementById('btn-roll').classList.toggle('hidden', !showRoll);
        renderGMTable(data);
    } else {
        // Player view
        document.getElementById('gm-view').classList.add('hidden');
        document.getElementById('player-view').classList.remove('hidden');
        document.getElementById('my-name').innerText = `👤 ${myName}`;

        const info      = data.gameData[myName];
        const toggleBtn = document.getElementById('btn-toggle-drunk');

        if (info.isDrunk) {
            toggleBtn.classList.remove('hidden');
            if (info.drunkRevealed) {
                toggleBtn.style.display = 'block';
                toggleBtn.innerText = drunkShowingTrue ? '🙈 ซ่อนบทบาทแท้จริง' : '👁️ ดูบทบาทที่แท้จริง';
                if (drunkShowingTrue) {
                    document.getElementById('my-role').innerText = info.trueRole;
                    document.getElementById('my-role').style.color = 'var(--drunk)';
                    document.getElementById('my-desc').innerText = info.trueDesc;
                } else {
                    document.getElementById('my-role').innerText = 'ขี้เมา 🍺';
                    document.getElementById('my-role').style.color = 'var(--drunk)';
                    document.getElementById('my-desc').innerText = info.desc;
                }
            } else {
                toggleBtn.style.display = 'none';
                document.getElementById('my-role').innerText = 'ขี้เมา 🍺';
                document.getElementById('my-role').style.color = 'var(--drunk)';
                document.getElementById('my-desc').innerText = info.desc;
            }
        } else {
            toggleBtn.classList.add('hidden');
            document.getElementById('my-role').innerText = info.role;
            document.getElementById('my-role').style.color = 'var(--v)';
            document.getElementById('my-desc').innerText = info.desc;
        }

        const stMap = {
            normal: { t: "🟢 มีชีวิต", c: "var(--v)" },
            dead:   { t: "💀 ตาย",     c: "var(--w)" },
            muted:  { t: "🤫 ใบ้",     c: "var(--mute)" },
            exiled: { t: "⚖️ เนรเทศ",  c: "var(--exile)" },
        };
        const cur = stMap[info.status] || stMap.normal;
        document.getElementById('my-status').innerText   = cur.t;
        document.getElementById('my-status').style.color = cur.c;
    }
}

// Toggle drunk true role (client-side only)
document.getElementById('btn-toggle-drunk').onclick = () => {
    drunkShowingTrue = !drunkShowingTrue;
    onValue(ref(db, 'rooms/' + currentRoom), snap => renderGame(snap.val()), { onlyOnce: true });
};

// ─── GM Table ────────────────────────────────────────────────────────────────

function renderGMTable(data) {
    let alive = 0, dead = 0, cult = 0;

    document.getElementById('gm-table-body').innerHTML = Object.entries(data.gameData).map(([p, info]) => {
        if (info.status === 'normal' || info.status === 'muted') alive++; else dead++;
        if (info.inCult) cult++;

        const roleDisplay = info.isDrunk
            ? `ขี้เมา <span class="drunk-badge">🍺</span><br><small style="color:var(--drunk)">แท้จริง: ${info.trueRole}</small>`
            : info.role;

        return `<tr class="tr-${info.status} ${info.isLinked ? 'tr-couple' : ''} ${info.inCult ? 'tr-cult' : ''} ${info.isDrunk ? 'tr-drunk' : ''}">
            <td><b>${p}</b>${info.isLinked ? ' 💕' : ''}<br>${roleDisplay}</td>
            <td>
                <select onchange="window.updSt('${p}', this.value)">
                    <option value="normal"  ${info.status === 'normal'  ? 'selected' : ''}>ปกติ</option>
                    <option value="dead"    ${info.status === 'dead'    ? 'selected' : ''}>ตาย</option>
                    <option value="muted"   ${info.status === 'muted'   ? 'selected' : ''}>ใบ้</option>
                    <option value="exiled"  ${info.status === 'exiled'  ? 'selected' : ''}>เนรเทศ</option>
                </select>
            </td>
            <td style="text-align:right;">
                ${data.hasCupid ? `<button onclick="window.updEx('${p}','isLinked',${!info.isLinked})" class="btn-action" style="background:var(--cupid)">🔗</button>` : ''}
                ${data.hasCult  ? `<button onclick="window.updEx('${p}','inCult',${!info.inCult})"   class="btn-action" style="background:var(--cult)">🔮</button>`  : ''}
                ${data.hasHood  ? `<button onclick="window.updEx('${p}','inHood',${!info.inHood})"   class="btn-action" style="background:#e74c3c;${info.inHood ? 'outline:2px solid #fff;' : ''}">🎯</button>` : ''}
                ${info.isDrunk  ? `<button onclick="window.toggleDrunkReveal('${p}',${!info.drunkRevealed})" class="btn-action" style="background:var(--drunk)" title="${info.drunkRevealed ? 'ซ่อน' : 'เปิดเผย'}บทบาทแท้จริง">${info.drunkRevealed ? '🙈' : '👁️'}</button>` : ''}
            </td>
        </tr>`;
    }).join('');

    document.getElementById('cnt-alive').innerText = alive;
    document.getElementById('cnt-dead').innerText  = dead;
    if (data.hasCult) {
        document.getElementById('cnt-cult-box').classList.remove('hidden');
        document.getElementById('cnt-cult').innerText = cult;
    } else {
        document.getElementById('cnt-cult-box').classList.add('hidden');
    }
}

// ─── GM Actions ──────────────────────────────────────────────────────────────

window.toggleDrunkReveal = (p, val) =>
    update(ref(db, `rooms/${currentRoom}/gameData/${p}`), { drunkRevealed: val });

window.updSt = (p, s) => {
    onValue(ref(db, `rooms/${currentRoom}`), snap => {
        const d = snap.val();
        const up = {};
        if (d.gameData[p].isLinked && (s === 'dead' || s === 'normal')) {
            Object.keys(d.gameData).forEach(k => {
                if (d.gameData[k].isLinked) up[`gameData/${k}/status`] = s;
            });
        } else {
            up[`gameData/${p}/status`] = s;
        }
        update(ref(db, `rooms/${currentRoom}`), up);
    }, { onlyOnce: true });
};

window.updEx = (p, k, v) =>
    update(ref(db, `rooms/${currentRoom}/gameData/${p}`), { [k]: v });

window.transferGM = (newGM) => {
    if (newGM && confirm(`โอน GM ให้ ${newGM}?`))
        update(ref(db, 'rooms/' + currentRoom), { gm: newGM });
};

// ─── Phase & Roll ─────────────────────────────────────────────────────────────

document.getElementById('btn-next').onclick = () => {
    onValue(ref(db, `rooms/${currentRoom}`), snap => {
        update(ref(db, `rooms/${currentRoom}`), {
            phase: (snap.val().phase + 1) % 3,
            currentEvent: null,
            isRolling: false,
        });
    }, { onlyOnce: true });
};

document.getElementById('btn-roll').onclick = async () => {
    await update(ref(db, `rooms/${currentRoom}`), { isRolling: true });
    setTimeout(async () => {
        const r = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
        await update(ref(db, `rooms/${currentRoom}`), { currentEvent: r, isRolling: false });
    }, 1500);
};

// ─── Result ───────────────────────────────────────────────────────────────────

function renderResult(data) {
    document.body.className = '';
    document.getElementById('screen-game').classList.add('hidden');
    document.getElementById('screen-result').classList.remove('hidden');

    document.getElementById('result-list').innerHTML = Object.entries(data.gameData).map(([p, info]) => `
        <div style="padding:15px; border-bottom:1px solid #333; display:flex; justify-content:space-between;">
            <div>
                <b>${p}</b><br>
                <small>${info.isDrunk ? `ขี้เมา 🍺 (บทบาทจริง: ${info.trueRole})` : info.role}</small>
            </div>
            <div style="color:${info.status === 'normal' ? 'var(--v)' : 'var(--w)'}">
                ${info.status === 'normal' ? 'รอด ✅' : 'ตาย 💀'}
            </div>
        </div>`).join('');

    if (data.gm === myName) document.getElementById('btn-gm-back').classList.remove('hidden');
}

document.getElementById('btn-end').onclick = () => {
    if (confirm("จบเกม?")) update(ref(db, `rooms/${currentRoom}`), { status: 'ended' });
};

document.getElementById('btn-gm-back').onclick = () =>
    update(ref(db, `rooms/${currentRoom}`), { status: 'waiting' });
