    function applyOnlineState(data) {
        if(!data) return;

        // 0. 게스트 플레이어 배열 초기화 (플레이어가 없을 경우 생성)
        if (data.players && players.length === 0) {
            data.players.forEach((pData) => {
                players.push(Object.assign({}, pData));
            });
            createPieces();
            updatePlayerUI();
            updateBoardVisuals();
        }

        // 0-1. 게임 종료 동기화
        if (data.gameEnded && !window.hasShownEndModal) {
            window.hasShownEndModal = true;
            openCustomModal(`🎉 게임 종료`, "최종 자산 결과입니다.", data.endRankHtml, false, "다시 하기", "", () => { resetGameForEnd(); });
            return;
        }

        // 1. 로그 실시간 동기화
        if (data.actionLogs && data.actionLogs.length > 0) {
            actionLogs = data.actionLogs;
            let box = document.getElementById('history-box');
            if (box) {
                box.innerHTML = actionLogs.map(l => `<div>• ${l}</div>`).join('');
                box.scrollTop = box.scrollHeight;
            }
        }

        // 2. 주사위 굴리기 애니메이션 싱크 (내가 던지는게 아닐 때만)
        if (data.lastDiceRoll && currentTurn !== myPlayerId) {
            const { d1, d2, time, rollerId } = data.lastDiceRoll;
            if (rollerId !== myPlayerId && (!window.lastDiceSyncedTime || window.lastDiceSyncedTime < time)) {
                window.lastDiceSyncedTime = time;
                showRemoteDiceRoll(d1, d2);
            }
        }

        // 3. 말 이동 애니메이션 싱크 (V4.3.1 개선)
        if (data.players) {
            data.players.forEach((pData, idx) => {
                if (players[idx] && idx !== myPlayerId) {
                    const serverPos = pData.pos;
                    // 새로운 이동 명령(moveTime)이 들어왔는지 확인
                    if (pData.lastMoveTime && (!players[idx].appliedMoveTime || players[idx].appliedMoveTime < pData.lastMoveTime)) {
                        players[idx].appliedMoveTime = pData.lastMoveTime;

                        if (pData.lastMoveType === 'jump') {
                            players[idx].pos = serverPos;
                            updatePiecePositions();
                        } else if (pData.moveSteps && !players[idx].isAnimating) {
                            moveStepByStep(players[idx], pData.moveSteps, 200);
                        }
                    }
                }
            });
        }

        // 5. 나머지 데이터 단순 동기화
        if(data.players) {
            data.players.forEach((pData, idx) => {
                if (players[idx]) {
                    // 현재 로컬 위치 보존 (애니메이션 중 끊김 방지)
                    const currentPos = players[idx].pos;
                    const localAppliedTime = players[idx].appliedMoveTime;
                    const localIsAnimating = players[idx].isAnimating;

                    Object.assign(players[idx], pData);

                    // 로컬 전용 상태 복구
                    players[idx].appliedMoveTime = localAppliedTime;
                    players[idx].isAnimating = localIsAnimating;

                    // 내 말이거나, 애니메이션 중이거나, 걷는 중이라면 현재 로컬 위치 유지
                    if (idx === myPlayerId || players[idx].isAnimating || (data.lastMoveType !== 'jump')) {
                        players[idx].pos = currentPos;
                    }
                }
            });
        }

        if(data.boardState) boardState = data.boardState;
        if(data.currentTurn !== undefined) currentTurn = data.currentTurn;
        if(data.currentRound !== undefined) currentRound = data.currentRound;
        if(data.olympicTile !== undefined) olympicTile = data.olympicTile;
        if(data.olympicMult !== undefined) olympicMult = data.olympicMult;

        // 중요: 방장의 게임 설정을 내 화면의 요소들에 동기화
        if(data.buildRule) { document.getElementById('build-rule').value = data.buildRule; buildRule = data.buildRule; }
        if(data.gameMode) { document.getElementById('game-mode').value = data.gameMode; toggleTeamMode(); }
        if(data.maxRounds) { document.getElementById('max-rounds').value = data.maxRounds; maxRounds = data.maxRounds; }
        if(data.initialStartingMoney) {
            initialStartingMoney = data.initialStartingMoney;
            document.getElementById('start-money').value = data.initialStartingMoney / 10000;
        }
        if(data.baseSalary) {
            baseSalary = data.baseSalary;
            document.getElementById('salary-money').value = data.baseSalary / 10000;
        }
        if(data.playerCount) document.getElementById('player-count').value = data.playerCount;

        updatePlayerUI();
        updateBoardVisuals();
        updateRoundUI();
        if (!isMoving) updatePiecePositions();
    }
