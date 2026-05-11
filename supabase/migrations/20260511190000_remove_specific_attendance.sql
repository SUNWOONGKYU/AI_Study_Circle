-- 운영자 요청: 1회차(event_id=3) 특정 신청자 삭제
-- 1) 달빛(slot_id=6) 박승훈 (phone=01052883181) — 회원 attendance
-- 2) 햇살(slot_id=28) 선웅규 (phone=01050678306) — 회원 attendance
--
-- 안전장치: 이름 + phone + event + slot 4중 매칭으로 정확히 1건만 삭제

DELETE FROM attendance
WHERE id IN (
    SELECT a.id
    FROM attendance a
    JOIN profiles p ON p.id = a.user_id
    WHERE a.event_id = 3
      AND a.event_slot_id = 6
      AND p.name = '박승훈'
      AND p.phone = '01052883181'
);

DELETE FROM attendance
WHERE id IN (
    SELECT a.id
    FROM attendance a
    JOIN profiles p ON p.id = a.user_id
    WHERE a.event_id = 3
      AND a.event_slot_id = 28
      AND p.name = '선웅규'
      AND p.phone = '01050678306'
);
