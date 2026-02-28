const roleLibrary = [
    // ฝั่งมนุษย์
    { id: 'villager', name: 'ชาวบ้าน', point: 1, team: 'v', desc: 'ไล่ล่าหาตัวมนุษย์หมาป่าให้เจอและกำจัดทิ้ง' },
    { id: 'seer', name: 'เทพพยากรณ์', point: 7, team: 'v', desc: 'ตรวจสอบผู้เล่น 1 คนว่าเป็นมนุษย์หมาป่าหรือไม่' },
    { id: 'spellcaster', name: 'จอมเวท', point: 1, team: 'v', desc: 'สั่งให้ผู้เล่น 1 คนห้ามพูดในวันถัดไป' },
    { id: 'cupid', name: 'กามเทพ', point: -3, team: 'v', desc: 'เลือกคน 2 คนเป็นคู่รักกัน หากคนหนึ่งตาย อีกคนจะตายตาม' },
    { id: 'bodyguard', name: 'บอดี้การ์ด', point: 3, team: 'v', desc: 'ปกป้องผู้เล่น 1 คนจากการถูกกำจัด', note: 'ห้ามเลือกตัวเอง และห้ามเลือกคนเดิมซ้ำ 2 คืนติดกัน' },
    { id: 'aura_seer', name: 'ญาณทิพย์', point: 3, team: 'v', desc: 'ตรวจสอบว่าผู้เล่นเป็นตัวละครพิเศษหรือไม่' },
    { id: 'pi', name: 'นักสืบเรื่องลี้ลับ (P.I.)', point: 3, team: 'v', desc: 'ตรวจสอบผู้เล่นและคนข้างๆ ว่ามีหมาป่าปะปนอยู่หรือไม่ (1 ครั้งต่อเกม)' },
    { id: 'witch', name: 'แม่มด', point: 4, team: 'v', desc: 'ใช้เวทมนตร์ปกป้องหรือกำจัดผู้เล่นได้ (อย่างละ 1 ครั้ง)' },
    { id: 'hunter', name: 'นายพราน', point: 3, team: 'v', desc: 'หากถูกกำจัด สามารถเลือกกำจัดผู้เล่นอีกคนให้ตายตามได้ทันที' },
    { id: 'mayor', name: 'นายกเทศมนตรี', point: 2, team: 'v', desc: 'เสียงโหวตของคุณมีค่าเป็น 2 เสียง' },
    { id: 'prince', name: 'เจ้าชาย', point: 3, team: 'v', desc: 'หากโดนโหวตประหาร จะไม่ตายและต้องเผยบทบาท' },
    { id: 'priest', name: 'นักบวช', point: 3, team: 'v', desc: 'ปกป้องผู้เล่น 1 คนจากการถูกกำจัด (1 ครั้งต่อเกม)' },
    { id: 'lycan', name: 'ลูกครึ่งหมาป่า (Lycan)', point: -1, team: 'v', desc: 'อยู่ฝั่งมนุษย์ แต่เทพพยากรณ์จะเห็นเป็นหมาป่า' },

    // ฝั่งหมาป่า
    { id: 'wolf', name: 'มนุษย์หมาป่า', point: -6, team: 'w', desc: 'เลือกกำจัดผู้เล่น 1 คนในทุกๆ คืน' },
    { id: 'lone_wolf', name: 'หมาป่าเดียวดาย', point: -5, team: 'w', desc: 'ชนะเมื่อเหลือรอดเป็นคนสุดท้ายเท่านั้น' },
    { id: 'wolf_cub', name: 'ลูกหมาป่า', point: -8, team: 'w', desc: 'หากตาย หมาป่าจะฆ่าได้ 2 คนในคืนถัดไป' },
    { id: 'minion', name: 'สมุนรับใช้', point: -6, team: 'w', desc: 'รู้ตัวหมาป่าแต่ไม่ได้ตื่นมาฆ่าด้วยกัน' },
    { id: 'sorcerer', name: 'นางปีศาจ', point: -3, team: 'w', desc: 'ตรวจสอบหาตัวเทพพยากรณ์ในแต่ละคืน' },
    { id: 'cursed', name: 'ผู้ต้องคำสาป', point: -3, team: 'w', desc: 'เริ่มที่ฝั่งมนุษย์ แต่ถ้าหมาป่าเลือกฆ่าจะกลายเป็นหมาป่าแทน' },

    // บทบาทอิสระ/อื่นๆ
    { id: 'hoodlum', name: 'อันธพาล', point: 0, team: 'o', desc: 'เลือกเป้าหมาย 2 คน หากทั้งคู่ตายและคุณรอด คุณชนะ' },
    { id: 'tanner', name: 'ยาจก', point: -2, team: 'o', desc: 'จะชนะทันทีหากถูกโหวตกำจัด' },
    { id: 'vampire', name: 'แวมไพร์', point: -7, team: 'o', desc: 'เลือกกำจัดผู้เล่นที่จะตายในวันถัดไป หมาป่าฆ่าคุณไม่ได้' },
    { id: 'cult_leader', name: 'เจ้าลัทธิ', point: 1, team: 'o', desc: 'ดึงคนเข้าลัทธิ ชนะเมื่อทุกคนที่เหลืออยู่ในลัทธิหมด' },

    // Expansion
    { id: 'revealer', name: 'ผู้เผยตัวตน', point: 4, team: 'v', desc: 'ชี้ตัวหมาป่า ถ้าถูกหมาป่าตาย ถ้าผิดคุณตายแทน' },
    { id: 'mystic_seer', name: 'เทพผู้รู้แจ้ง', point: 9, team: 'v', desc: 'ตรวจสอบได้ทันทีว่าผู้เล่นนั้นมีบทบาทอะไร' },
    { id: 'alpha_wolf', name: 'หมาป่าจ่าฝูง', point: -9, team: 'w', desc: 'เปลี่ยนเหยื่อที่หมาป่าเลือกให้กลายเป็นหมาป่าตัวใหม่ (1 ครั้ง)' }
];

let selectedRolesData = [];
let setupPlayers = [];

function initSetup() {
    const container = document.getElementById('roleSelection');
    roleLibrary.forEach(role => {
        const card = document.createElement('div');
        card.className = 'role-card';
        card.innerHTML = `
            <input type="checkbox" id="chk-${role.id}" onchange="toggleRole('${role.id}')">
            <div class="role-info" onclick="document.getElementById('chk-${role.id}').click()">
                <div class="role-name-row">
                    <span class="role-name">${role.name}</span>
                    <span class="role-point ${role.point < 0 ? 'point-negative' : 'point-positive'}">
                        ${role.point > 0 ? '+' + role.point : role.point}
                    </span>
                </div>
                <div class="role-desc">${role.desc}</div>
                ${role.note ? `<div class="role-note">*${role.note}</div>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

function toggleRole(roleId) {
    const role = roleLibrary.find(r => r.id === roleId);
    const card = document.getElementById(`chk-${roleId}`).parentElement;
    
    if (selectedRolesData.some(r => r.id === roleId)) {
        selectedRolesData = selectedRolesData.filter(r => r.id !== roleId);
        card.classList.remove('selected');
    } else {
        selectedRolesData.push(role);
        card.classList.add('selected');
    }
    updateBalanceScore();
}

function updateBalanceScore() {
    const total = selectedRolesData.reduce((sum, r) => sum + r.point, 0);
    const badge = document.getElementById('balanceScore');
    badge.innerText = `แต้มรวม: ${total}`;
    badge.style.borderColor = total < 0 ? '#ff4b2b' : (total > 0 ? '#4ecca3' : '#ff2e63');
}

// (ส่วนอื่นๆ ของ JS เช่น addPlayerToSetup, startGame คงเดิมตามไฟล์ก่อนหน้า)
function addPlayerToSetup() {
    const input = document.getElementById('playerName');
    const name = input.value.trim();
    if (!name) return;
    setupPlayers.push(name);
    renderSetupPlayers();
    input.value = '';
}

function renderSetupPlayers() {
    const container = document.getElementById('setupPlayerList');
    container.innerHTML = setupPlayers.map((p, i) => `
        <span class="player-badge">${p} <span onclick="setupPlayers.splice(${i},1); renderSetupPlayers();">×</span></span>
    `).join('');
}

function startGame() {
    if (setupPlayers.length < 1) return alert('เพิ่มผู้เล่นก่อนครับ');
    document.getElementById('setup-section').classList.add('hidden');
    document.getElementById('game-section').classList.remove('hidden');
    
    const table = document.getElementById('gamePlayerTable');
    setupPlayers.forEach(name => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="name-text">${name}</span></td>
            <td>
                <select class="status-select">
                    ${selectedRolesData.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
                    <option value="none">อื่นๆ</option>
                </select>
            </td>
            <td><input type="text" class="lover-input" placeholder="..."></td>
            <td><input type="checkbox" class="cult-check" onchange="updateStats()"></td>
            <td><input type="checkbox" class="protect-check"></td>
            <td>
                <select class="status-select" onchange="handleStatus(this)">
                    <option value="alive">🟢 รอด</option>
                    <option value="dead">💀 ตาย</option>
                </select>
            </td>
            <td><button onclick="this.parentElement.parentElement.remove(); updateStats();">×</button></td>
        `;
        table.appendChild(row);
    });
    updateStats();
}

function updateStats() {
    const rows = document.querySelectorAll('#gamePlayerTable tr');
    let alive = 0, dead = 0, cult = 0;
    rows.forEach(r => {
        const status = r.querySelectorAll('select')[1].value;
        if (status === 'alive') alive++; else dead++;
        if (r.querySelector('.cult-check').checked && status === 'alive') cult++;
    });
    document.getElementById('totalCount').innerText = rows.length;
    document.getElementById('aliveCount').innerText = alive;
    document.getElementById('deadCount').innerText = dead;
    document.getElementById('cultCount').innerText = cult;
}

initSetup();
