-- 1회차(event=3) 노을(29)에서 오현정 제거 + 달빛(6)에서 김미금 제거
-- attendance(회원) / guest_attendance(게스트) 양쪽 모두 시도

DO $$
DECLARE
    v_deleted INTEGER;
    r RECORD;
BEGIN
    -- 오현정 attendance 삭제 (event 3 전체)
    DELETE FROM attendance a
    USING profiles p
    WHERE a.user_id = p.id
      AND a.event_id = 3
      AND p.name = '오현정';
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RAISE NOTICE '오현정 attendance 삭제: %', v_deleted;

    -- 오현정 guest_attendance 삭제
    DELETE FROM guest_attendance
    WHERE event_id = 3 AND name = '오현정';
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RAISE NOTICE '오현정 guest_attendance 삭제: %', v_deleted;

    -- 김미금 attendance 삭제
    DELETE FROM attendance a
    USING profiles p
    WHERE a.user_id = p.id
      AND a.event_id = 3
      AND p.name = '김미금';
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RAISE NOTICE '김미금 attendance 삭제: %', v_deleted;

    -- 김미금 guest_attendance 삭제 (달빛 6)
    DELETE FROM guest_attendance
    WHERE event_id = 3 AND name = '김미금';
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RAISE NOTICE '김미금 guest_attendance 삭제: %', v_deleted;

    -- 매칭 안 된 경우 진단용: 비슷한 이름 출력
    RAISE NOTICE '--- event 3 guest_attendance 잔여 (이름 확인용) ---';
    FOR r IN SELECT name, event_slot_id FROM guest_attendance WHERE event_id = 3 ORDER BY event_slot_id, name LOOP
        RAISE NOTICE '  guest: name=% slot=%', r.name, r.event_slot_id;
    END LOOP;
END $$;
