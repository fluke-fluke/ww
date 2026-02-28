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

let myName = "", currentRoom = "", isHost = false, players = [], selectedRoles = [];

// --- Auth ---
document.getElementById('btn-create').onclick = async () => {
    myName = document.getElementById('username').value.trim();
    if(!myName) return alert("ใส่ชื่อ");
    isHost = true;
    currentRoom = Math.floor(1000 + Math.random() * 9000).toString();
    await set(ref(db, 'rooms/' + currentRoom), { status: 'waiting', gm: myName, players: {[myName]: true}, phase: 1 });
    initLobby();
};

document.getElementById('btn-join').onclick = async () => {
    myName = document.getElementById('username').value.trim();
    currentRoom = document.getElementById('room-code').value.trim();
    if(!myName || !currentRoom) return alert("ข้อมูลไม่ครบ");
    await update(ref(db, `rooms/${currentRoom}/players`), {[myName]: true});
    initLobby();
};

function initLobby() {
    document.getElementById('screen-auth').classList.add('hidden');
    document.getElementById('screen-lobby').classList.remove('hidden');
    document.getElementById('display-room').innerText = currentRoom;

    onValue(ref(db, 'rooms/' + currentRoom), (snap) => {
        const data = snap.val();
        if(!data) return;
        players = Object.keys(data.players || {});
        document.getElementById('player-list').innerHTML = players.map(p => `<span style="background:#333; padding:5px; margin:2px; border-radius:5px; display:inline-block;">${p} ${p===data.gm?'👑':''}</span>`).join('');
        document.getElementById('count-total').innerText = players.length;

        if(data.gm === myName) {
            document.getElementById('gm-setup').classList.remove('hidden');
            document.getElementById('wait-msg').classList.add('hidden');
            renderRoleSelector();
        }
        if(data.status !== 'waiting') renderGame(data);
    });
    onDisconnect(ref(db, `rooms/${currentRoom}/players/${myName}`)).remove();
}

// --- GM Setup ---
function renderRoleSelector() {
    const container = document.getElementById('role-selector');
    if(container.innerHTML !== "") return;
    rolesData.forEach(r => {
        const div = document.createElement('div');
        div.className = 'role-item';
        div.innerHTML = `
            <div style="width:100%">
                <div class="role-top">
                    <span>${r.name}<span class="role-en">(${r.en})</span></span>
                    <span class="${r.p<0?'p-minus':'p-plus'}">${r.p>0?'+'+r.p:r.p}</span>
                </div>
                <div style="font-size:0.8em; color:#888;">${r.desc}</div>
            </div>`;
        div.onclick = () => {
            div.classList.toggle('selected');
            const idx = selectedRoles.indexOf(r);
            if(idx > -1) selectedRoles.splice(idx, 1);
            else selectedRoles.push(r);
            document.getElementById('count-sel').innerText = selectedRoles.length;
            const total = selectedRoles.reduce((s, x) => s + x.p, 0);
            document.getElementById('balance-score').innerText = `แต้มรวม: ${total}`;
            document.getElementById('balance-score').style.color = total < 0 ? 'var(--w)' : 'var(--v)';
        };
        container.appendChild(div);
    });
}

document.getElementById('btn-start-game').onclick = () => {
    if(selectedRoles.length !== players.length) return alert(`เลือกให้ครบ ${players.length} คน`);
    let shuffled = [...selectedRoles].sort(() => Math.random() - 0.5);
    let gameData = {};
    players.forEach((p, i) => { gameData[p] = { role: shuffled[i].name, desc: shuffled[i].desc, status: 'normal', cult: false }; });
    update(ref(db, 'rooms/' + currentRoom), { status: 'playing', gameData, phase: 1, hasCult: selectedRoles.some(r=>r.id==='o4') });
};

// --- Game Play ---
function renderGame(data) {
    document.getElementById('screen-lobby').classList.add('hidden');
    document.getElementById('screen-game').classList.remove('hidden');
    
    const phaseInfo = [
        { n: "กลางคืน 🌙", c: "night", b: "#1e3799" },
        { n: "กลางวัน ☀️", c: "day", b: "#f39c12" },
        { n: "โหวตประหาร ⚖️", c: "vote", b: "#e74c3c" }
    ];
    document.body.className = phaseInfo[data.phase].c;
    const pLabel = document.getElementById('phase-label');
    pLabel.innerText = phaseInfo[data.phase].n;
    pLabel.style.background = phaseInfo[data.phase].b;

    if(data.gm === myName) {
        document.getElementById('player-view').classList.add('hidden');
        document.getElementById('gm-view').classList.remove('hidden');
        renderGMTable(data);
    } else {
        const myData = data.gameData[myName];
        document.getElementById('my-role-name').innerText = myData.role;
        document.getElementById('my-role-desc').innerText = myData.desc;
        const statusLabel = document.getElementById('my-status-label');
        if(myData.status === 'dead') { statusLabel.innerText = "💀 คุณตายแล้ว"; statusLabel.style.background = "#500"; document.body.style.filter = "grayscale(1)"; }
        else if(myData.status === 'muted') { statusLabel.innerText = "🤫 คุณถูกใบ้"; statusLabel.style.background = "var(--mute)"; }
        else if(myData.status === 'exiled') { statusLabel.innerText = "⚖️ คุณถูกเนรเทศ"; statusLabel.style.background = "var(--exile)"; }
        else { statusLabel.innerText = myData.cult ? "👁️ อยู่ในลัทธิ" : "🟢 ปกติ"; statusLabel.style.background = myData.cult ? "#4b0082" : "transparent"; document.body.style.filter = "none"; }
    }

    if(data.status === 'ended') {
        document.getElementById('game-reveal').classList.remove('hidden');
        const list = document.getElementById('reveal-list');
        list.innerHTML = Object.entries(data.gameData).map(([p, info]) => `
            <div class="reveal-row">
                <span class="reveal-name">${p}</span>
                <span class="reveal-role">${info.role}</span>
                <span style="color:${info.status==='dead'?'var(--w)':'var(--v)'}">${info.status==='dead'?'💀':'🟢'}</span>
            </div>`).join('');
        if(isHost) {
            document.getElementById('btn-end-game').innerText = "🔄 เริ่มใหม่";
            document.getElementById('btn-end-game').onclick = () => location.reload();
        }
    }
}

function renderGMTable(data) {
    const tbody = document.getElementById('gm-table-body');
    tbody.innerHTML = "";
    let al = 0, dd = 0, cl = 0;
    for(let p in data.gameData) {
        const info = data.gameData[p];
        if(info.status === 'normal' || info.status === 'muted') al++; else dd++;
        if(info.cult) cl++;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="${info.status!=='normal'?'st-'+info.status:''}">${p} ${info.cult?'👁️':''}</td>
            <td style="font-size:0.75em; opacity:0.6">${info.role}</td>
            <td>
                <select style="width:auto; padding:2px; font-size:0.7em;" onchange="updateStatus('${p}', this.value)">
                    <option value="normal" ${info.status==='normal'?'selected':''}>ปกติ</option>
                    <option value="dead" ${info.status==='dead'?'selected':''}>ตาย</option>
                    <option value="muted" ${info.status==='muted'?'selected':''}>ใบ้</option>
                    <option value="exiled" ${info.status==='exiled'?'selected':''}>เนรเทศ</option>
                </select>
                ${data.hasCult ? `<button onclick="updateCult('${p}', ${info.cult})" style="padding:2px 5px; font-size:0.7em;">👁️</button>` : ''}
            </td>`;
        tbody.appendChild(tr);
    }
    document.getElementById('stat-total').innerText = Object.keys(data.gameData).length;
    document.getElementById('stat-alive').innerText = al;
    document.getElementById('stat-dead').innerText = dd;
    document.getElementById('stat-cult').innerText = cl;
}

window.updateStatus = (p, st) => update(ref(db, `rooms/${currentRoom}/gameData/${p}`), { status: st });
window.updateCult = (p, cur) => update(ref(db, `rooms/${currentRoom}/gameData/${p}`), { cult: !cur });
document.getElementById('btn-next-phase').onclick = () => {
    onValue(ref(db, `rooms/${currentRoom}/phase`), (s) => { update(ref(db, `rooms/${currentRoom}`), { phase: (s.val() + 1) % 3 }); }, { onlyOnce: true });
};
document.getElementById('btn-end-game').onclick = () => { if(confirm("จบเกมและเฉลยบทบาท?")) update(ref(db, `rooms/${currentRoom}`), { status: 'ended' }); };
