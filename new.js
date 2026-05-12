<<<<
    async function moveStepByStep(player, steps, speedMs = 200) {
        let isLocal = (player.id === myPlayerId) || !isOnline;
        if (isLocal) isMoving = true;

        let logPrefix = player.isAI ? '🤖' : '';
        for (let i = 0; i < steps; i++) {
            player.pos = (player.pos + 1) % 32;
====
    async function moveStepByStep(player, steps, speedMs = 200) {
        player.isAnimating = true; // 애니메이션 시작 플래그
        let isLocal = (player.id === myPlayerId) || !isOnline;
        if (isLocal) isMoving = true;

        let logPrefix = player.isAI ? '🤖' : '';
        for (let i = 0; i < steps; i++) {
            player.pos = (player.pos + 1) % 32;
>>>>
<<<<
        if (isLocal) {
            isMoving = false;
            if (isOnline) pushOnlineState(); // 이동 완료 후 최종 위치 1회만 전송
        }
    }
====
        player.isAnimating = false; // 애니메이션 종료
        if (isLocal) {
            isMoving = false;
            if (isOnline) pushOnlineState(); // 이동 완료 후 최종 위치 1회만 전송
        }
    }
>>>>