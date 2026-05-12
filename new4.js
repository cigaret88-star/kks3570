    function joinOnlineRoom() {
        const id = document.getElementById('room-id').value.trim();
        const myName = document.getElementById('n1').value.trim();
        if(!id) { alert("방 번호를 입력해주세요."); return; }
        if(!myName) { alert("닉네임을 P1 칸에 입력해주세요."); return; }

        onlineRoomId = id;
        const roomRef = database.ref('rooms/' + id);

        roomRef.once('value').then((snapshot) => {
            if(!snapshot.exists()) {
                isHost = true;
                myPlayerId = 0;
                isOnline = true;
                
                // [수정] 방을 만들 때 현재 화면의 AI 체크 상태를 읽어옴
                let initialAiSettings = {};
                for(let j=1; j<=4; j++) { initialAiSettings[j-1] = document.getElementById('ai'+j).checked; }

                roomRef.set({
                    id: id,
                    playerCount: 1,
                    gameStarted: false,
                    participants: { 0: myName },
                    aiSettings: initialAiSettings // 현재 UI 상태 반영
                });

                // 방장은 이후에도 AI 체크박스 변경 시 서버에 실시간 동기화
                for(let i=1; i<=4; i++) {
                    document.getElementById('ai'+i).addEventListener('change', () => {
                        if(isOnline && isHost && !isOnlineGameStarted) {
                            let currentAi = {};
                            for(let j=1; j<=4; j++) { currentAi[j-1] = document.getElementById('ai'+j).checked; }
                            roomRef.update({ aiSettings: currentAi });
                        }
                    });
                }

                alert("방을 생성했습니다. 다른 플레이어를 기다려주세요.");
            } else {
                const data = snapshot.val();
                if(data.gameStarted) { alert("이미 진행 중인 게임입니다."); return; }
                
                const aiSettings = data.aiSettings || {};
                const participants = data.participants || {};
                
                // [수정] AI가 아닌 빈 자리를 찾는 로직 최적화
                let targetSlot = -1;
                for(let i=1; i<4; i++) {
                    // 서버에 해당 인덱스 참여자가 없고, AI로 설정되지 않은 경우
                    if(!participants[i] && aiSettings[i] === false) {
                        targetSlot = i;
                        break;
                    }
                }
                
                // 만약 모든 자리가 AI라면 어쩔 수 없이 첫 번째 빈 자리에 들어감
                if(targetSlot === -1) {
                    for(let i=1; i<4; i++) { if(!participants[i]) { targetSlot = i; break; } }
                }

                if(targetSlot === -1) { alert("방이 꽉 찼습니다."); return; }

                isOnline = true;
                myPlayerId = targetSlot;

                // 내 닉네임을 서버에 등록
                roomRef.child('participants').child(myPlayerId).set(myName);
                roomRef.update({ playerCount: data.playerCount + 1 });

                alert((myPlayerId + 1) + "번 플레이어로 참여했습니다. 방장이 시작할 때까지 대기하세요.");
            }
            // ... (이후 리스너 로직은 동일)