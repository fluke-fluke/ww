import { rolesData } from './roles.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyD3votmuYJDxy7--PvFj_qe-vk2axspjqo",
    authDomain: "fir-77b01.firebaseapp.com",
    projectId: "fir-77b01",
    databaseURL: "https://fir-77b01-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let myName = "", currentRoom = "", players = [], selectedRoles = [];

// --- Authentication ---
document.getElementById('btn-create').onclick = async () => {
    myName = document.getElementById('username').value.trim();
    if(!myName) return;
    currentRoom = Math.floor(1000 + Math.random() * 9000).toString();
    await set(ref(db, 'rooms/' + currentRoom), { status: 'waiting', gm: myName, players: {[myName]: true}, phase: 1 });
    initLobby();
};

document.getElementById('btn-join').onclick = async () => {
    myName = document.getElementById('username').value.trim();
    currentRoom = document.getElementById('room-code').value.trim();
    if(!myName || !currentRoom) return;
    await update(ref(db, `rooms/${currentRoom}/players`), {[myName]: true});
    initLobby();
};

function initLobby() {
    document.getElementById('screen-auth').classList.add('hidden');
    document.getElementById('screen-lobby').classList.remove('hidden');
    onValue(ref(db, 'rooms/' + currentRoom), (snap) => {
        const data = snap.val();
        if(!data) return;
        const allNames = Object.keys(data.players || {});
        players = allNames.filter(n => n !== data.gm); // GM ไม่นับเป็นผู้เล่น

        document.getElementById('player-list').innerHTML = allNames.map(p => 
            `<span style="background:#333; padding:5px; margin:2px; border-radius:5px; display:inline-block;">${p} ${p===data.gm?'👑':''}</span>`
        ).join('');

        if(data.gm === myName) {
            document.getElementById('gm-selector-ui').classList.remove('hidden');
            document.getElementById('gm-setup').classList.remove('hidden');
            document.getElementById('wait-msg').classList.add('hidden');
            const sel = document.getElementById('select-new-gm');
            sel.innerHTML = allNames.map(p => `<option value="${p}" ${p===data.gm?'selected':''}>${p}</option>`).join('');
            renderRoleSelector();
        } else {
            document.getElementById('gm-selector-ui').classList.add('hidden');
            document.getElementById('gm-setup').classList.add('hidden');
            document.getElementById('wait-msg').classList.remove('hidden');
        }
        document.getElementById('count-total').innerText = players.length;
        if(data.status !== 'waiting') renderGame(data);
    });
}

window.changeGM = (name) => update(ref(db, `rooms/${currentRoom}`), { gm: name });

// --- Role Setup (Grouped) ---
function renderRoleSelector() {
    const container = document.getElementById('role-selector');
    if(container.innerHTML !== "") return;
    const groups = [
        {id:'human', n:'🛡️ ฝ่ายชาวบ้าน', c:'group-human'},
        {id:'wolf', n:'🐺 ฝ่ายหมาป่า', c:'group-wolf'},
        {id:'other', n:'🔮 ฝ่ายอิสระ', c:'group-other'}
    ];
    groups.forEach(g => {
        const h = document.createElement('div');
        h.className = `role-group-header ${g.c}`;
        h.innerText = g.n;
        container.appendChild(h);
        rolesData.filter(r => r.team === g.id).forEach(r => {
            const d = document.createElement('div');
            d.className = 'role-item';
            d.innerHTML = `
                <div style="width:100%">
                    <div style="display:flex; justify-content:space-between;">
                        <span>${r.name} <small style="color:#666">(${r.en})</small></span>
                        <b style="color:${r.p<0?'var(--w)':'var(--v)'}">${r.p>0?'+'+r.p:r.p}</b>
                    </div>
                    <div style="font-size:0.75em; color:#888;">${r.desc}</div>
                </div>`;
            d.onclick = () => {
                d.classList.toggle('selected');
                const idx = selectedRoles.indexOf(r);
                if(idx > -1) selectedRoles.splice(idx, 1); else selectedRoles.push(r);
                document.getElementById('count-sel').innerText = selectedRoles.length;
                const total = selectedRoles.reduce((s, x) => s + x.p, 0);
                document.getElementById('balance-score').innerText = `แต้มรวม: ${total}`;
                document.getElementById('balance-score').style.color = total < 0 ? 'var(--w)' : 'var(--v)';
            };
            container.appendChild(d);
        });
    });
}

document.getElementById('btn-start-game').onclick = () => {
    if(selectedRoles.length !== players.length) return alert(`เลือก ${players.length} บทบาท`);
    let shuffled = [...selectedRoles].sort(() => Math.random() - 0.5);
    let gameData = {};
    players.forEach((p, i) => { gameData[p] = { role: shuffled[i].name, desc: shuffled[i].desc, status: 'normal', cult: false, isLinked: false }; });
    update(ref(db, 'rooms/' + currentRoom), { status: 'playing', gameData, phase: 1, hasCupid: selectedRoles.some(r=>r.id==='v4'), hasCult: selectedRoles.some(r=>r.id==='o4') });
};

// --- Game Play & Cupid Logic ---
function renderGame(data) {
    document.getElementById('screen-lobby').classList.add('hidden');
    document.getElementById('screen-game').classList.remove('hidden');
    const phases = [{n:"กลางคืน 🌙", c:"night", b:"#1e3799"}, {n:"กลางวัน ☀️", c:"day", b:"#f39c12"}, {n:"โหวต ⚖️", c:"vote", b:"#e74c3c"}];
    document.body.className = phases[data.phase].c;
    const pLabel = document.getElementById('phase-label');
    pLabel.innerText = phases[data.phase].n; pLabel.style.background = phases[data.phase].b;

    if(data.gm === myName) {
        document.getElementById('player-view').classList.add('hidden');
        document.getElementById('gm-view').classList.remove('hidden');
        renderGMTable(data);
    } else {
        const myData = data.gameData[myName];
        if(!myData) return; // Case GM doesn't have data
        document.getElementById('my-role-name').innerText = myData.role;
        document.getElementById('my-role-desc').innerText = myData.desc;
        const sl = document.getElementById('my-status-label');
        if(myData.status==='dead'){ sl.innerText="💀 ตาย"; sl.style.background="#500"; document.body.style.filter="grayscale(1)"; }
        else{ sl.innerText = myData.cult ? "👁️ ลัทธิ" : "🟢 ปกติ"; sl.style.background = myData.cult ? "#4b0082" : "transparent"; document.body.style.filter="none"; }
    }

    if(data.status === 'ended') {
        const rev = document.getElementById('game-reveal'); rev.classList.remove('hidden');
        rev.innerHTML = `<h3>📊 เฉลยบทบาท</h3>` + Object.entries(data.gameData).map(([p, info]) => `<div><b>${p}</b>: ${info.role}</div>`).join('');
    }
}

function renderGMTable(data) {
    const tbody = document.getElementById('gm-table-body'); tbody.innerHTML = "";
    for(let p in data.gameData) {
        const info = data.gameData[p];
        const tr = document.createElement('tr');
        if(info.isLinked) tr.classList.add('couple-active');
        tr.innerHTML = `
            <td class="${info.status!=='normal'?'st-'+info.status:''}">${p} ${info.cult?'👁️':''}</td>
            <td>
                <select class="status-select" onchange="updateStatus('${p}', this.value)">
                    <option value="normal" ${info.status==='normal'?'selected':''}>🟢</option>
                    <option value="dead" ${info.status==='dead'?'selected':''}>💀</option>
                    <option value="muted" ${info.status==='muted'?'selected':''}>🤫</option>
                </select>
                ${data.hasCupid ? `<button class="btn-link" onclick="toggleLink('${p}', ${info.isLinked})">🔗</button>` : ''}
            </td>`;
        tbody.appendChild(tr);
    }
}

window.updateStatus = (name, st) => {
    onValue(ref(db, `rooms/${currentRoom}`), (snap) => {
        const data = snap.val(); const gd = data.gameData;
        const up = {};
        if(st === 'dead' && gd[name].isLinked) {
            for(let o in gd) if(gd[o].isLinked && o !== name) up[`gameData/${o}/status`] = 'dead';
        }
        up[`gameData/${name}/status`] = st;
        update(ref(db, `rooms/${currentRoom}`), up);
    }, { onlyOnce: true });
};
window.toggleLink = (n, cur) => update(ref(db, `rooms/${currentRoom}/gameData/${n}`), { isLinked: !cur });
document.getElementById('btn-next-phase').onclick = () => {
    onValue(ref(db, `rooms/${currentRoom}/phase`), (s) => { update(ref(db, `rooms/${currentRoom}`), { phase: (s.val()+1)%3 }); }, { onlyOnce: true });
};
document.getElementById('btn-end-game').onclick = () => { if(confirm("จบเกม?")) update(ref(db, `rooms/${currentRoom}`), { status: 'ended' }); };
