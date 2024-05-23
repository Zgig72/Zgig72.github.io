const isTeacher = window.location.pathname.includes('teacher');
const gameBoard = document.getElementById('game-board');
let pc;
let dataChannel;
let matches = 0;
let firstCard, secondCard;
let lockBoard = false;

const cards = [
  'A', 'A', 'B', 'B', 'C', 'C', 'D', 'D',
  'E', 'E', 'F', 'F', 'G', 'G', 'H', 'H'
];

const servers = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    }
  ]
};

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

function createBoard() {
  shuffle(cards);
  cards.forEach((card) => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.value = card;
    cardElement.addEventListener('click', flipCard);
    gameBoard.appendChild(cardElement);
  });
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flipped');
  this.textContent = this.dataset.value;

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.value === secondCard.dataset.value;
  if (isMatch) {
    disableCards();
  } else {
    unflipCards();
  }
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  matches += 1;
  if (isTeacher) {
    document.getElementById('matches').textContent = matches;
    broadcastMatch();
  }
  resetBoard();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    firstCard.textContent = '';
    secondCard.textContent = '';
    resetBoard();
  }, 1000);
}

function resetBoard() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

function broadcastMatch() {
  if (dataChannel) {
    dataChannel.send(JSON.stringify({ type: 'match', matches }));
  }
}

let ws;

async function setupConnection() {
  pc = new RTCPeerConnection(servers);

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate, role: isTeacher ? 'teacher' : 'student', code: document.getElementById('code').textContent }));
    }
  };

  pc.ondatachannel = (event) => {
    dataChannel = event.channel;
    dataChannel.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'match') {
        matches = data.matches;
        alert(`Total matches made: ${matches}`);
      }
    };
  };

  if (isTeacher) {
    dataChannel = pc.createDataChannel('game');
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: 'offer', offer, code: document.getElementById('code').textContent }));
  }
}

function initializeWebSocket() {
  ws = new WebSocket('ws://localhost:8080');

  ws.onopen = () => {
    if (isTeacher) {
      document.getElementById('host-button').onclick = () => {
        ws.send(JSON.stringify({ type: 'host' }));
      };
    } else {
      document.getElementById('join-button').onclick = () => {
        const code = document.getElementById('join-code').value;
        ws.send(JSON.stringify({ type: 'join', code }));
      };
    }
  };

  ws.onmessage = async (message) => {
    const data = JSON.parse(message.data);
    if (data.type === 'host') {
      document.getElementById('code').textContent = data.code;
      document.getElementById('host-code').style.display = 'block';
    } else if (data.type === 'join' && data.success) {
      setupConnection();
    } else if (data.type === 'join' && !data.success) {
      alert(data.message);
    } else if (data.type === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      ws.send(JSON.stringify({ type: 'answer', answer, code: document.getElementById('join-code').value }));
    } else if (data.type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.type === 'candidate') {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };
}

createBoard();
initializeWebSocket();
