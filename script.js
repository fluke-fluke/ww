import { rolesData } from './roles.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ... [Firebase Config เดิมของคุณ] ...
const firebaseConfig = {
    apiKey: "AIzaSyD3votmuYJDxy7--PvFj_qe-vk2axspjqo",
    authDomain: "fir-77b01.firebaseapp.com",
    projectId: "fir-77b01",
    databaseURL: "https://fir-77b01-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let myName = "", currentRoom = "", players = [], selectedRoles = [];

// ฟังก์ชัน Render บทบาทแยกกลุ่ม
function renderRoleSelector() {
    const container = document.getElementById('role-selector');
    if (container.innerHTML !== "") return;

    const groups = [
        { id: 'human', label: '🛡️ ฝ่ายชาวบ้าน', class: 'group-human' },
        { id: 'wolf', label: '🐺 ฝ่ายหมาป่า', class: 'group-wolf' },
        { id: 'other', label: '🔮 ฝ่ายอิสระ', class: 'group-other' }
    ];

    groups.forEach(group => {
        const header = document.createElement('div');
        header.className = `role-group-header ${group.class}`;
        header.innerText = group.label;
        container.appendChild(header);

        rolesData.filter(r => r.team === group.id).forEach(r => {
            const div = document.createElement('div');
            div.className = 'role-item';
            div.innerHTML = `
                <div style="width:100%">
                    <div class="role-top">
                        <span>${r.name}<span class="role-en">(${r.en})</span></span>
                        <span class="${r.p < 0 ? 'p-minus' : 'p-plus'}">${r.p > 0 ? '+' + r.p : r.p}</span>
                    </div>
                </div>`;
            div.onclick = () => {
                div.classList.toggle('selected');
                const idx = selectedRoles.indexOf(r);
                if (idx > -1) selectedRoles.splice(idx, 1);
                else selectedRoles.push(r);
                updateSetupUI();
            };
            container.appendChild(div);
        });
    });
}

// ระบบจัดการสถานะ (มี Logic กามเทพ)
window.updateStatus = (name, newStatus) => {
    onValue(ref(db, `rooms/${currentRoom}`), (snap) => {
        const data = snap.val();
        const updates = {};
        
        // ถ้าตายและมีคู่ (isLinked)
        if (newStatus === 'dead' && data.gameData[name].isLinked) {
            Object.keys(data.gameData).forEach(other => {
                if (data.gameData[other].isLinked && other !== name) {
                    updates[`gameData/${other}/status`] = 'dead';
                }
            });
        }
        
        updates[`gameData/${name}/status`] = newStatus;
        update(ref(db, `rooms/${currentRoom}`), updates);
    }, { onlyOnce: true });
};

// ... [ฟังก์ชันอื่นๆ ของ Lobby, Phase, EndGame เหมือนเดิม] ...
