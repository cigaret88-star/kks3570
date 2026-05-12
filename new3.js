// 1. 방장의 AI 설정 변경 시 서버에 즉시 동기화하는 함수 추가
function syncAISettings() {
    if (isOnline && isHost && !isOnlineGameStarted) {
        let aiSettings = {};
        for(let i=1; i<=4; i++) {
            aiSettings[i-1] = document.getElementById('ai'+i).checked;
        }
        database.ref('rooms/' + onlineRoomId).update({ aiSettings: aiSettings });
    }
}

// 2. joinOnlineRoom 내 참여자(Guest) 로직 수정
// (중략)
} else {
    const data = snapshot.val();
    const aiSettings = data.aiSettings || {};
    const participants = data.participants || {};
    
    // AI가 체크되지 않은 빈 자리를 찾음
    let targetSlot = -1;
    for(let i=1; i<4; i++) {
        if(!participants[i] && !aiSettings[i]) {
            targetSlot = i;
            break;
        }
    }
    
    // 만약 모든 자리가 AI라면 그냥 빈 자리에 들어감
    if(targetSlot === -1) {
        for(let i=1; i<4; i++) {
            if(!participants[i]) { targetSlot = i; break; }
        }
    }
    
    if(targetSlot === -1) { alert("방이 꽉 찼습니다."); return; }
    
    myPlayerId = targetSlot;
    roomRef.child('participants').child(myPlayerId).set(myName);
    roomRef.update({ playerCount: data.playerCount + 1 });
}