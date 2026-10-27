/* balloon-plus.js
 * PG_BL_SHAPE_HTML : ส่วนควบคุม "รูปทรงลูกโป่งใหญ่" ที่แทรกในหน้าลูกโป่ง
 * PG_BL_PLUS       : ฟังก์ชันที่ถูกฉีดเข้า iframe ลูกโป่ง (Function.toString()) ห้ามอ้างตัวแปรนอกฟังก์ชัน
 *   - window.__bsM / window.__bsPiece ถูกเรียกจาก render() ที่ถูกแพตช์ใน index.html
 *   - ปุ่ม PNG โปร่งใส (พร้อมตัดขอบพอดีรูป) สำหรับทำสติกเกอร์
 */
window.PG_BL_SHAPE_HTML =
  '<h2>🫧 รูปทรงลูกโป่งใหญ่ (รองหลังข้อความ)</h2>' +
  '<label>รูปทรง</label>' +
  '<select id="bshape"><option value="none">ไม่ใช้ (ตัวอักษรลูกโป่งอย่างเดียว)</option><option value="circle">⚪ กลม</option><option value="cloud">☁️ เมฆ</option><option value="heart">❤️ หัวใจ</option><option value="star">⭐ ดาว</option></select>' +
  '<div class="row" style="margin-top:8px"><label>สีรูปทรง</label><input type="color" id="bshapeCol" value="#bfe3ff"></div>' +
  '<p style="font-size:12px;color:var(--mut);margin:6px 0 0">ตัวอักษรใช้ “สีหลัก/สีเงา” ด้านบน ส่วนรูปทรงใช้สีนี้ เลือกให้ต่างกันจะอ่านง่ายขึ้น</p>';

window.PG_BL_PLUS = function () {
  const $ = id => document.getElementById(id);
  if (window.__bsM) return;

  /* ขนาดของรูปทรง → ใช้ขยาย canvas ให้พอดีกับข้อความ */
  window.__bsM = function (maxW, nL, lh, size, depth, stk) {
    const el = $('bshape');
    const t = el ? el.value : 'none';
    if (!el || t === 'none') return null;
    const th = nL * lh;
    const K = { circle: 1.5, cloud: 1.58, heart: 1.9, star: 2.2 }[t] || 1.5;
    let bw = maxW * K + size * 1.1, bh = th * K + size * 1.3;
    if (t === 'heart') bh = Math.max(bh, bw * 0.9);
    if (t === 'star') bh = Math.max(bh, bw * 0.82);
    if (t === 'cloud') bh = Math.max(bh, bw * 0.5);
    if (t === 'circle') bh = Math.max(bh, bw * 0.5);
    const m = Math.ceil(depth * 1.5 + stk + size * 0.25);
    const padX0 = size * 1.3 + depth * 2 + stk;
    const H00 = size * 2.6 + depth * 3 + stk * 2 + (nL - 1) * lh;
    const padX = Math.max(padX0, (bw + 2 * m - maxW) / 2);
    const H0 = Math.max(H00, Math.ceil(bh + 2 * m));
    return { t, padX, H0, m };
  };

  /* วาดรูปทรงเป็นชิ้นลูกโป่ง 3D (ใช้ makePiece ของแอปเดิม) */
  window.__bsPiece = function (bs, c) {
    const W = c.W, H0 = c.H0, size = c.size, depth = c.depth;
    const col = $('bshapeCol').value;
    const B = c.hex(col), S = c.hex(c.shadeOf(col));
    const bw = Math.max(20, Math.ceil(W - 2 * bs.m)), bh = Math.max(20, Math.ceil(H0 - 2 * bs.m));
    const x0 = Math.round(W / 2 - bw / 2), y0 = Math.round(H0 / 2 - bh / 2);
    const lw = Math.max(2, size * 0.1), t = bs.t;
    const draw = mc => {
      const cx = bw / 2, cy = bh / 2, rx = bw / 2 - lw, ry = bh / 2 - lw;
      mc.lineWidth = lw; mc.lineJoin = 'round';
      mc.beginPath();
      if (t === 'circle') {
        mc.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      } else if (t === 'cloud') {
        mc.moveTo(cx + rx * 0.78, cy);
        mc.ellipse(cx, cy, rx * 0.78, ry * 0.78, 0, 0, Math.PI * 2);
        const n = 9, r0 = Math.min(rx, ry) * 0.36;
        for (let i = 0; i < n; i++) {
          const a = i / n * Math.PI * 2 - Math.PI / 2;
          const px = cx + Math.cos(a) * rx * 0.62, py = cy + Math.sin(a) * ry * 0.6, r = r0 * (i % 2 ? 1 : 1.12);
          mc.moveTo(px + r, py); mc.arc(px, py, r, 0, Math.PI * 2);
        }
      } else if (t === 'heart') {
        for (let i = 0; i <= 160; i++) {
          const a = i / 160 * Math.PI * 2;
          const x = 16 * Math.pow(Math.sin(a), 3);
          const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
          const px = cx + x / 16 * rx, py = cy + (y - 2.5) / 14.5 * ry;
          if (i) mc.lineTo(px, py); else mc.moveTo(px, py);
        }
        mc.closePath();
      } else if (t === 'star') {
        const cyS = cy + ry * 0.095;
        for (let i = 0; i < 10; i++) {
          const r = i % 2 ? 0.56 : 1, a = -Math.PI / 2 + i * Math.PI / 5;
          const px = cx + Math.cos(a) * r * rx * 1.0, py = cyS + Math.sin(a) * r * ry * 1.0;
          if (i) mc.lineTo(px, py); else mc.moveTo(px, py);
        }
        mc.closePath();
      }
      mc.fill(); mc.stroke();
    };
    const key = ['bshape', t, bw, bh, col, c.mat0, depth.toFixed(2), c.glint ? 1 : 0].join('|');
    return c.makePiece(x0, bw, draw, c.glint ? { x: bw * 0.3, y: bh * 0.24, r: Math.min(bw, bh) * 0.12 } : null,
      { exact: 1, local: 1, h: bh, y0, key, B, S, tt: 0 });
  };

  /* บันทึก/โหลดชุดตั้งค่าของแอปเดิมให้จำรูปทรงด้วย */
  try { if (typeof IDS !== 'undefined') ['bshape', 'bshapeCol'].forEach(i => { if (!IDS.includes(i)) IDS.push(i); }); } catch (e) {}

  /* ช่องโค้ดสี Hex / RGB */
  if (typeof PG_COLOR_FIELDS === 'function') { /* เผื่อถูกฉีดมาแล้ว */ }
  if (window.__pgColorFields) window.__pgColorFields(document);

  /* ปุ่ม PNG โปร่งใส (สติกเกอร์) */
  const exp = $('exportBtn');
  if (exp && !$('pgTransBtn')) {
    const b = document.createElement('button');
    b.id = 'pgTransBtn'; b.className = 'sec'; b.type = 'button';
    b.textContent = '🧩 PNG โปร่งใส';
    b.title = 'ส่งออกพื้นหลังโปร่งใส ตัดขอบพอดีรูป ใช้เป็นสติกเกอร์ได้ทันที';
    exp.insertAdjacentElement('afterend', b);
    /* ปุ่มส่งคำไปสตูดิโอธีม LINE */
    if (!document.getElementById('pgLineThemeBtn')) {
      const lt = document.createElement('button');
      lt.id = 'pgLineThemeBtn'; lt.className = 'sec'; lt.type = 'button';
      lt.textContent = '🎨 ส่งไปทำธีม LINE';
      lt.title = 'นำคำนี้และชุดสีไปทำธีม LINE สไตล์เยลลี่ 3D ทันที';
      lt.style.cssText = 'background:#fff4ed;border:1px solid #fed2c3;color:#b94e2e;font-weight:700;margin-left:4px;';
      b.insertAdjacentElement('afterend', lt);
      lt.onclick = () => {
        const curTxt = (document.getElementById('text') ? document.getElementById('text').value : '').trim() || 'OK';
        const col = document.getElementById('color') ? document.getElementById('color').value : null;
        const col2 = document.getElementById('color2') ? document.getElementById('color2').value : null;
        const font = document.getElementById('font') ? document.getElementById('font').value : null;
        const pack = document.getElementById('pack') ? document.getElementById('pack').value : '';
        const payload = { text: curTxt, color: col, color2: col2, font: font, pack: pack, timestamp: Date.now() };
        try { localStorage.setItem('lineTheme_importedWord', JSON.stringify(payload)); } catch(e){}
        if (window.parent && window.parent !== window) {
          window.parent.location.hash = '#linetheme';
          window.parent.postMessage({ type: 'linetheme:apply-word', payload: payload }, '*');
        } else {
          location.hash = '#linetheme';
        }
      };
    }
    b.onclick = async () => {
      const bg = $('bgOn'), xf = $('xfmt');
      const was = [bg.checked, xf.value];
      bg.checked = false; xf.value = 'orig'; window.__pgTrim = true;
      try { await exportStill(); }
      finally {
        window.__pgTrim = false; bg.checked = was[0]; xf.value = was[1];
        if (typeof go === 'function') go();
      }
    };
  }
  if (typeof go === 'function') go();
};
