import { rolesData } from './roles.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// !!! เปลี่ยน Config ตรงนี้ให้เป็นของคุณ !!!
const firebaseConfig = {
  apiKey: "AIzaSyD3votmuYJDxy7--PvFj_qe-vk2axspjqo",
  authDomain: "fir-77b01.firebaseapp.com",
  databaseURL: "https://fir-77b01-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fir-77b01",
  storageBucket: "fir-77b01.firebasestorage.app",
  messagingSenderId: "364738165804",
  appId: "1:364738165804:web:248db4d4a74e146999e589",
  measurementId: "G-381MWEWJ9F"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let myName = "", currentRoom = "", players = [], selectedRoles = [];

document.getElementById('btn-create').onclick = async () => {
    myName = document.getElementById('username').value.trim();
    if(!myName) return alert("ใส่ชื่อด้วยจ้า");
    currentRoom = Math.floor(1000 + Math.random() * 9000).toString();
    await set(ref(db, 'rooms/' + currentRoom), { status: 'waiting', gm: myName, players: {[myName]: true}, phase: 1 });
    initLobby();
};

// --- เพิ่มฟังก์ชัน Render แยกกลุ่มบทบาท ---
function renderRoleSelector() {
    const container = document.getElementById('role-selector');
    if (container.innerHTML !== "") return;

    const groups = [
        { id: 'human', label: '🛡️ ฝ่ายชาวบ้าน', class: 'group-human' },
        { id: 'wolf', label: '🐺 ฝ่ายหมาป่า', class: 'group-wolf' },
        { id: 'other', label: '🔮 ฝ่ายอิสระ', class: 'group-other' }
    ];

    groups.forEach(group => {
        const h = document.createElement('div');
        h.className = `role-group-header ${group.class}`;
        h.innerText = group.label;
        container.appendChild(h);

        rolesData.filter(r => r.team === group.id).forEach(r => {
            const div = document.createElement('div');
            div.className = 'role-item';
            div.innerHTML = `<span>${r.name} <small>(${r.en})</small></span> <span class="${r.p<0?'p-minus':'p-plus'}">${r.p>0?'+'+r.p:r.p}</span>`;
            div.onclick = () => {
                div.classList.toggle('selected');
                const idx = selectedRoles.indexOf(r);
                if(idx > -1) selectedRoles.splice(idx, 1); else selectedRoles.push(r);
                updateUI();
            };
            container.appendChild(div);
        });
    });
}
// [โค้ด Logic อื่นๆ ตามคำขอก่อนหน้า...]
