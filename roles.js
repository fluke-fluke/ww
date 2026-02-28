export const rolesData = [
    // --- ฝ่ายชาวบ้าน (Human Team) ---
    { id: 'v1', team: 'human', name: 'ชาวบ้าน', en: 'Villager', p: 1, desc: 'หาตัวหมาป่าให้เจอและกำจัดทิ้ง' },
    { id: 'v2', team: 'human', name: 'เทพพยากรณ์', en: 'Seer', p: 7, desc: 'ตรวจสอบผู้เล่นว่าเป็นหมาป่าหรือไม่' },
    { id: 'v3', team: 'human', name: 'จอมเวท', en: 'Spellcaster', p: 1, desc: 'ห้ามพูดในวันถัดไป' },
    { id: 'v4', team: 'human', name: 'กามเทพ', en: 'Cupid', p: -3, desc: 'เลือกคู่รัก 2 คน' },
    { id: 'v5', team: 'human', name: 'บอดี้การ์ด', en: 'Bodyguard', p: 3, desc: 'ปกป้องผู้เล่น 1 คน' },
    { id: 'v6', team: 'human', name: 'ญาณทิพย์', en: 'Aura Seer', p: 3, desc: 'ตรวจสอบบทบาทพิเศษ' },
    { id: 'v7', team: 'human', name: 'ขี้เมา', en: 'Drunk', p: 4, desc: 'รู้บทบาทจริงคืนที่ 3' },
    { id: 'v8', team: 'human', name: 'เจ้าชาย', en: 'Prince', p: 3, desc: 'โหวตประหารไม่ตาย' },
    { id: 'v9', team: 'human', name: 'นักบวช', en: 'Priest', p: 3, desc: 'ปกป้องคนจากการตาย 1 ครั้ง' },
    { id: 'v10', team: 'human', name: 'นักสืบเรื่องลี้ลับ', en: 'P.I.', p: 3, desc: 'ตรวจคนข้างๆ ว่ามีหมาป่าไหม' },
    { id: 'v11', team: 'human', name: 'ตัวป่วน', en: 'Troublemaker', p: -3, desc: 'โหวตออกได้ 2 คน' },
    { id: 'v12', team: 'human', name: 'แม่มด', en: 'Witch', p: 4, desc: 'มียาชุบและยาฆ่า' },
    { id: 'v13', team: 'human', name: 'แม่หมอ', en: 'Old Hag', p: 1, desc: 'ไล่คนออกจากหมู่บ้าน 1 วัน' },
    { id: 'v14', team: 'human', name: 'ศิษย์เทพพยากรณ์', en: 'Apprentice Seer', p: 4, desc: 'สืบทอดพลังจากเทพพยากรณ์' },
    { id: 'v15', team: 'human', name: 'นายกเทศมนตรี', en: 'Mayor', p: 2, desc: 'คะแนนโหวตมีค่าเป็น 2' },
    { id: 'v16', team: 'human', name: 'นายพราน', en: 'Hunter', p: 3, desc: 'ตายแล้วยิงคนอื่นได้' },
    { id: 'v17', team: 'human', name: 'ผู้ป่วยติดเชื้อ', en: 'Disease', p: 3, desc: 'หมาป่ากินแล้วคืนถัดไปฆ่าไม่ได้' },
    { id: 'v18', team: 'human', name: 'ผู้รักสันติ', en: 'Pacifist', p: -1, desc: 'ต้องโหวตให้คนรอด' },
    { id: 'v19', team: 'human', name: 'พรายกระซิบ', en: 'Ghost', p: 2, desc: 'ตายคืนแรก สื่อสารได้ 1 ตัวอักษร' },
    { id: 'v20', team: 'human', name: 'ภราดรแห่งเมสัน', en: 'Mason', p: 2, desc: 'รู้จักพวกเดียวกันตั้งแต่คืนแรก' },
    { id: 'v21', team: 'human', name: 'ภูตจำแลง', en: 'Doppelganger', p: -2, desc: 'สวมรอยเป็นคนที่ตาย' },
    { id: 'v22', team: 'human', name: 'ลูกครึ่งหมาป่า', en: 'Lycan', p: -1, desc: 'คนเห็นเป็นหมาป่า' },
    { id: 'v23', team: 'human', name: 'หนุ่มถึก', en: 'Tough Guy', p: 3, desc: 'ถ้าถูกฆ่าจะตายคืนถัดไป' },
    { id: 'v24', team: 'human', name: 'ไอ้ทึ่ม', en: 'Villager Idiot', p: 2, desc: 'ต้องโหวตให้คนตาย' },
    { id: 'e1', team: 'human', name: 'ผู้เผยตัวตน', en: 'Revealer', p: 4, desc: 'ชี้หมาป่าให้คนเห็น' },
    { id: 'e2', team: 'human', name: 'นักสะกดจิต', en: 'Mentalist', p: 6, desc: 'ดูว่า 2 คนอยู่ทีมเดียวกันไหม' },
    { id: 'e3', team: 'human', name: 'พรานหญิง', en: 'Huntress', p: 3, desc: 'ยิงคนได้ 1 ครั้งในคืน' },
    { id: 'e5', team: 'human', name: 'เทพผู้รู้แจ้ง', en: 'Mystic Seer', p: 9, desc: 'รู้บทบาทเป้าหมายทันที' },

    // --- ฝ่ายหมาป่า (Werewolf Team) ---
    { id: 'w1', team: 'wolf', name: 'มนุษย์หมาป่า', en: 'Werewolf', p: -6, desc: 'ฆ่าคนทุกคืน' },
    { id: 'w2', team: 'wolf', name: 'หมาป่าเดียวดาย', en: 'Lone Wolf', p: -5, desc: 'ชนะคนเดียว' },
    { id: 'w3', team: 'wolf', name: 'ลูกหมาป่า', en: 'Wolf Cub', p: -8, desc: 'ตายแล้วคืนถัดไปฆ่าได้ 2' },
    { id: 'w4', team: 'wolf', name: 'สมุนรับใช้', en: 'Minion', p: -6, desc: 'รู้ตัวหมาป่า' },
    { id: 'w5', team: 'wolf', name: 'นางปีศาจ', en: 'Sorcerer', p: -3, desc: 'หาตัวเทพพยากรณ์' },
    { id: 'w6', team: 'wolf', name: 'ผู้ต้องคำสาป', en: 'Cursed', p: -3, desc: 'โดนกัดแล้วเป็นหมาป่า' },
    { id: 'e6', team: 'wolf', name: 'หมาป่าจ่าฝูง', en: 'Alpha Wolf', p: -9, desc: 'เปลี่ยนคนเป็นหมาป่า' },

    // --- ฝ่ายอิสระ (Other Team) ---
    { id: 'o1', team: 'other', name: 'อันธพาล', en: 'Hoodlum', p: 0, desc: 'เลือกเป้าหมายให้ตาย' },
    { id: 'o2', team: 'other', name: 'ยาจก', en: 'Tanner', p: -2, desc: 'ชนะเมื่อถูกประหาร' },
    { id: 'o3', team: 'other', name: 'แวมไพร์', en: 'Vampire', p: -7, desc: 'ฆ่าเหยื่อคืนเว้นคืน' },
    { id: 'o4', team: 'other', name: 'เจ้าลัทธิ', en: 'Cult Leader', p: 1, desc: 'ดึงคนเข้าลัทธิ' },
    { id: 'e4', team: 'other', name: 'มือระเบิด', en: 'Mad Bomber', p: -2, desc: 'ตายแล้วระเบิดข้างๆ' }
];

