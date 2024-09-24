document.addEventListener('DOMContentLoaded', (event) => {
    const successSound = document.getElementById('success-sound');
    const failSound = document.getElementById('fail-sound');
    const winSound = document.getElementById('win-sound');
    const tickSound = document.getElementById('tick-sound');
    const backgroundMusic = document.getElementById('background-music');

        // Play background music
        backgroundMusic.play();



        const gameContainer = document.querySelector('.memory-game');
        const matchCountElement = document.getElementById('match-count');
        const timeRemainingElement = document.getElementById('time-remaining');
        const gameOverMessage = document.getElementById('game-over-message');
        const resetButton = document.getElementById('reset-button');
        const confettiContainer = document.getElementById('confetti');
        const winMessage = document.getElementById('win-message');
        const overlay = document.getElementById('overlay');
        const readyButton = document.getElementById('ready-button');
        let cardElements = [];
        let matchCount = 0;
        let timer;
        let timeRemaining = 0;
        let gameActive = false;
        let flippedCards = [];
        let boardLocked = false;
        

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function createCard(term, value) {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.term = term;
            card.dataset.value = value;
            card.innerHTML = `
                <div class="front">${term}</div>
                <div class="back">${value}</div>
            `;
            return card;
        }

        function initGame() {
            gameContainer.innerHTML = '';
            gameOverMessage.textContent = 'Try Again!';
            gameOverMessage.style.display = 'none';
            winMessage.style.opacity = '0';
            winMessage.style.display = 'none';
            gameActive = true;
            matchCount = 0;
            matchCountElement.textContent = matchCount;
            timeRemaining =0;
            timeRemainingElement.textContent = timeRemaining;

            const doubledCardsArray = shuffle([...cardsArray]);
            doubledCardsArray.forEach(card => {
                const cardElement = createCard(card.term, card.value);
                gameContainer.appendChild(cardElement);
            });

            cardElements = document.querySelectorAll('.memory-card');
            cardElements.forEach(card => card.addEventListener('click', flipCard));

            startTimer();
            backgroundMusic.play(); // Ensure background music plays when the game starts
        }

        function initGameMoreCards() {
            gameContainer.innerHTML = '';

            gameActive = true;
            matchCountElement.textContent = matchCount;
            const doubledCardsArray = shuffle([...cardsArray]);
            doubledCardsArray.forEach(card => {
                const cardElement = createCard(card.term, card.value);
                gameContainer.appendChild(cardElement);
            });

            cardElements = document.querySelectorAll('.memory-card');
            cardElements.forEach(card => card.addEventListener('click', flipCard));

        }

        
        function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => {
            if (timeRemaining => 0) {
                timeRemaining++;
                timeRemainingElement.textContent = timeRemaining;
            } else {
                clearInterval(timer);
                endGame();
            }
        }, 1000);
    }

        function endGame() {
            gameActive = false;
            cardElements.forEach(card => card.removeEventListener('click', flipCard));
            gameOverMessage.textContent = `Matches: ${matchCount}`;
        }

        function flipCard() {
            if (!gameActive || boardLocked) return;
            if (this.classList.contains('flip') || flippedCards.includes(this)) return;

            this.classList.add('flip');
            flippedCards.push(this);

            if (flippedCards.length === 2) {
                boardLocked = true;
                setTimeout(checkForMatch, 250);
            }
        }

        function checkForMatch() {
            const [card1, card2] = flippedCards;
            const isMatch = card1.dataset.term === card2.dataset.term || card1.dataset.value === card2.dataset.value;
            if (isMatch) {
                handleMatch(card1, card2);
            } else {
                unflipCards(card1, card2);
            }
        }

        function handleMatch(card1, card2) {
        card1.removeEventListener('click', flipCard);
        card2.removeEventListener('click', flipCard);
        card1.classList.add('swirl');
        card2.classList.add('swirl');
        updateMatchCounter();
        successSound.play();
        setTimeout(() => {
            card1.style.visibility = 'hidden';
            card2.style.visibility = 'hidden';
            resetFlippedCards();
            boardLocked = false;
        }, 500);
    }

    function unflipCards(card1, card2) {
        setTimeout(() => {
            card1.classList.remove('flip');
            card2.classList.remove('flip');
            resetFlippedCards();
            boardLocked = false;
        }, 500);
        failSound.play();
    }

        function resetFlippedCards() {
            flippedCards = [];
        }

        function triggerConfetti() {
            for (let i = 0; i < 100; i++) {
                winSound.play();
                const confettiPiece = document.createElement('div');
                confettiPiece.classList.add('confetti-piece');
                confettiPiece.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
                confettiPiece.style.left = `${Math.random() * 100}vw`;
                confettiPiece.style.animationDuration = `${Math.random() * 3 + 2}s`;
                confettiContainer.appendChild(confettiPiece);
            }
            setTimeout(() => {
                confettiContainer.innerHTML = '';
                winMessage.style.display = 'none';
            }, 3000); // Duration of confetti animation
        }

        const winOverlay = document.getElementById('win-overlay');
        const secretButton = document.getElementById('secret-button');

        function updateMatchCounter() {
            matchCount++;
            matchCountElement.textContent = matchCount;
            document.getElementById('match-count').textContent = matchCount;
            conn.send({
                type: 'match-complete',
                name: selectedTile // Send student name or tile
            });
            if (matchCount === 10) {
                //saveTimerValue(page, timeRemaining);
                clearInterval(timer);
                triggerConfetti();
                initGameMoreCards();
                
            }
        }



        function showWinOverlay() {
            if (timeRemaining < 40) {
                secretButton.style.display = 'block';
            }
            winOverlay.style.display = 'flex';
        }

        resetButton.addEventListener('click', () => {
        winOverlay.style.display = 'none';
        initGame();
        backgroundMusic.play(); // Restart background music
    });

    readyButton.addEventListener('click', () => {
        overlay.style.display = 'none';
        initGame();
    });

        resetButton.addEventListener('click', initGame);

        readyButton.addEventListener('click', () => {
            overlay.style.display = 'none';
            initGame();
        });

        overlay.style.display = 'flex';
});

