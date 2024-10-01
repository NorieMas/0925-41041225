const cardContainer = document.getElementById('cardContainer');
const countdownDisplay = document.getElementById('countdown');

const numberOfPairs = 8; 
const cards = [];
let flippedCards = []; // 用來記錄已翻開的卡片

// 開始遊戲按鈕
document.getElementById('startGame').addEventListener('click', () => {
    generateCards();
    document.getElementById('startGame').style.display = 'none'; 
    document.querySelector('.theme-selection').style.display = 'none'; // 隱藏主題選擇
    document.getElementById('showFronts').style.display = 'inline'; 
    document.getElementById('showBacks').style.display = 'inline'; 
});


// 動態生成卡片（16張，8對）
function generateCards() {
    const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
    const fruitEmojis = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓'];

    for (let i = 0; i < numberOfPairs; i++) {
        for (let j = 0; j < 2; j++) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.index = i;

            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');

            // 根據主題設定正面內容
            if (selectedTheme === 'pirate') {
                const frontImg = document.createElement('img');
                frontImg.src = 'images/onepiece0.png'; // 海盜主題正面圖片
                frontImg.alt = `正面 ${i}`;
                cardFront.appendChild(frontImg);
            } else {
                // 水果主題，正面顯示 ⬛ 符號
                const frontContent = document.createElement('div');
                frontContent.classList.add('fruit-front');
                frontContent.textContent = '⬛'; // 使用 ⬛ 符號作為正面內容
                cardFront.appendChild(frontContent);
            }

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');

            // 根據主題設定背面內容
            if (selectedTheme === 'pirate') {
                const backImg = document.createElement('img');
                backImg.src = `images/onepiece${i + 1}.png`; // 海盜主題背面圖片
                backImg.alt = `背面 ${i}`;
                cardBack.appendChild(backImg);
            } else {
                // 使用水果表情符號作為背面內容
                const backContent = document.createElement('div');
                backContent.classList.add('fruit-back');
                backContent.textContent = fruitEmojis[i]; // 根據索引選擇相應的水果表情
                cardBack.appendChild(backContent);
            }

            card.appendChild(cardFront);
            card.appendChild(cardBack);
            
            card.addEventListener('click', () => {
                handleCardClick(card);
            });

            cards.push(card);
        }
    }

    shuffle(cards);
    cards.forEach(card => {
        cardContainer.appendChild(card);
    });

    cards.forEach(card => {
        card.classList.add('flipped');
    });

    startCountdown(10);
}




// 隨機排列卡片的函數
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 倒計時函數
function startCountdown(seconds) {
    countdownDisplay.textContent = seconds; // 顯示初始時間

    // 禁用所有卡片
    cards.forEach(card => {
        card.classList.add('disabled');
    });

    const interval = setInterval(() => {
        seconds--;
        countdownDisplay.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(interval);
            flipCardsSequentially(); // 倒計時結束後翻回正面
            
            // 延遲1秒後顯示 "翻牌中..."
            setTimeout(() => {
                countdownDisplay.textContent = "翻牌中..."; // 更新顯示內容
                // 再延遲10秒才能啟用卡片
                setTimeout(() => {
                    countdownDisplay.textContent = "遊戲開始！"; // 更新顯示內容
                    cards.forEach(card => {
                        card.classList.remove('disabled');
                    });
                }, 10000); // 延遲10秒
            }, 500); // 延遲1秒
        }
    }, 1000); // 每秒更新一次
}


let matchedCount = 0; // 新增計數器來追蹤配對成功的卡片數量

function handleCardClick(card) {
    if (card.classList.contains('disabled') || card.classList.contains('matched') || flippedCards.length >= 2) {
        return; // 如果卡片禁用、已經配對或已經翻開兩張，則不進行任何操作
    }

    card.classList.add('flipped'); // 翻開卡片
    flippedCards.push(card); // 將翻開的卡片添加到數組

    // 如果已翻開兩張卡片
    if (flippedCards.length === 2) {
        const [firstCard, secondCard] = flippedCards;

        // 檢查是否為同一張卡片
        if (firstCard === secondCard) {
            flippedCards.pop(); // 如果是同一張卡片，從陣列中移除
            return; // 不進行後續的配對檢查
        }

        // 檢查是否為同一對卡片
        if (firstCard.dataset.index === secondCard.dataset.index) {
            // 成功配對
            setTimeout(() => {
                firstCard.classList.add('matched'); // 為配對的卡片添加 matched 類別
                secondCard.classList.add('matched'); // 為配對的卡片添加 matched 類別
                flippedCards = []; // 清空已翻開的卡片

                // 增加配對計數
                matchedCount += 2;

                // 檢查是否完成遊戲
                if (matchedCount === cards.length) {
                    setTimeout(() => {
                        Swal.fire({
                            title: "恭喜！",
                            text: "你完成了遊戲！",
                            icon: "success",
                            confirmButtonText: "重來"
                        }).then(() => {
                            resetGame(); // 呼叫重置遊戲的函數
                        });
                    }, 500); // 等待一段時間再顯示
                }
            }, 1000); // 1秒後再標記為配對成功
        } else {
            // 不同的卡片，稍後翻回正面
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                flippedCards = []; // 清空已翻開的卡片
            }, 1000); // 1秒後翻回正面
        }
    }
}

// 重置遊戲的函數
function resetGame() {
    cardContainer.innerHTML = ''; // 清空卡片容器
    cards.length = 0; // 清空卡片數組
    flippedCards.length = 0; // 清空翻開的卡片數組
    matchedCount = 0; // 重置配對計數
    countdownDisplay.textContent = ''; // 清空倒計時顯示

    // 控制所有遊戲控制按鈕
    document.getElementById('startGame').style.display = 'inline'; // 顯示開始遊戲按鈕
    document.querySelector('.theme-selection').style.display = 'inline'; // 顯示主題選擇
    document.getElementById('showFronts').style.display = 'none'; // 隱藏顯示全部正面按鈕
    document.getElementById('showBacks').style.display = 'none'; // 隱藏顯示全部背面按鈕
}

// 依序翻回正面
async function flipCardsSequentially() {
    for (const card of cards) {
        card.classList.remove('flipped');
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

document.getElementById('showFronts').addEventListener('click', () => {
    cards.forEach(card => {
        card.classList.remove('flipped');
    });
});

document.getElementById('showBacks').addEventListener('click', () => {
    cards.forEach(card => {
        card.classList.add('flipped');
    });
});
