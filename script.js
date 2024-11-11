let deck = [];
const suits = ["♠", "♥", "♣", "♦"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
let playerHand = [], dealerHand = [], playerScore = 0, dealerScore = 0;
let chips = 100, bet = 0;
const playerScoreDisplay = document.getElementById("player-score");
const dealerScoreDisplay = document.getElementById("dealer-score");
const message = document.getElementById("message");

document.addEventListener('DOMContentLoaded', function() {
    updateMessage("Placez votre mise pour commencer la partie!");
});

function initializeDeck() {
  deck = [];
  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({ suit, value });
    });
  });
  deck.sort(() => Math.random() - 0.5); // Shuffle the deck
}

function calculateScore(hand) {
  let score = 0, aceCount = 0;
  hand.forEach(card => {
    if (card.value === "A") aceCount++;
    score += card.value === "A" ? 11 : ["J", "Q", "K"].includes(card.value) ? 10 : +card.value;
  });
  while (score > 21 && aceCount > 0) {
    score -= 10;
    aceCount--;
  }
  return score;
}

function dealCard(hand, sectionId) {
  if (deck.length === 0) {
    initializeDeck(); // Reinitialize deck if empty
  }
  const card = deck.pop();
  hand.push(card);
  const cardDiv = document.createElement("div");
  cardDiv.className = "card";
  cardDiv.setAttribute("data-suit", card.suit);
  cardDiv.innerText = `${card.value}${card.suit}`;
  document.getElementById(sectionId).appendChild(cardDiv);
}

function startNewGame() {
  document.getElementById("player-cards").innerHTML = "";
  document.getElementById("dealer-cards").innerHTML = "";
  playerHand = [];
  dealerHand = [];
  playerScore = 0;
  dealerScore = 0;
  
  document.getElementById("player-score").textContent = "";
  document.getElementById("dealer-score").textContent = "";
  
  document.getElementById("current-bet").textContent = "0";
  document.getElementById("bet-amount").value = "10";
  
  document.getElementById("bet-btn").disabled = false;
  document.getElementById("bet-amount").disabled = false;
  document.getElementById("hit-btn").disabled = true;
  document.getElementById("stand-btn").disabled = true;
  document.getElementById("double-down-btn").disabled = true;
  document.getElementById("split-btn").disabled = true;
  
  updateMessage("Placez votre mise pour commencer la partie!");
}

function placeBet() {
  const betAmount = parseInt(document.getElementById("bet-amount").value);
  if (isNaN(betAmount) || betAmount < 1) {
    updateMessage("Please enter a valid bet amount!");
    return;
  }
  if (chips >= betAmount) {
    bet = betAmount;
    chips -= betAmount;
    document.getElementById("current-bet").textContent = bet;
    document.getElementById("chip-count").textContent = chips;
    document.getElementById("bet-btn").disabled = true;
    document.getElementById("bet-amount").disabled = true;
    
    dealCard(playerHand, "player-cards");
    dealCard(playerHand, "player-cards");
    dealCard(dealerHand, "dealer-cards");
    updateScores();
    
    document.getElementById("hit-btn").disabled = false;
    document.getElementById("stand-btn").disabled = false;
    document.getElementById("double-down-btn").disabled = false;
    
    updateMessage("À vous de jouer! Choisissez de tirer une carte, rester, ou doubler");
  } else {
    updateMessage("Not enough chips!");
  }
}

function updateScores() {
  playerScore = calculateScore(playerHand);
  dealerScore = calculateScore(dealerHand);
  playerScoreDisplay.textContent = `Score: ${playerScore}`;
  dealerScoreDisplay.textContent = `Score: ${dealerScore}`;
  
  if (playerHand.length > 2 || playerScore > 21) {
    document.getElementById("double-down-btn").disabled = true;
  }
}

function hit() {
  dealCard(playerHand, "player-cards");
  updateScores();
  document.getElementById("double-down-btn").disabled = true;
  
  if (playerScore > 21) {
    endGame("Perdu! Vous avez dépassé 21. Le croupier gagne!");
  } else {
    updateMessage("Tirer une autre carte ou rester?");
  }
}

function stand() {
  while (dealerScore < 17) {
    dealCard(dealerHand, "dealer-cards");
    updateScores();
  }
  
  determineWinner();
}

function determineWinner() {
  let result;
  if (dealerScore > 21) {
    result = "Le croupier a dépassé 21! Vous gagnez!";
  } else if (playerScore > dealerScore) {
    result = "Vous gagnez!";
  } else if (dealerScore > playerScore) {
    result = "Le croupier gagne!";
  } else {
    result = "Égalité!";
  }
  
  endGame(result);
  updateMessage(result + " Commencer une nouvelle partie?");
}

function doubleDown() {
  if (chips >= bet) {
    chips -= bet;
    bet *= 2;
    document.getElementById("chip-count").textContent = chips;
    document.getElementById("current-bet").textContent = bet;
    
    dealCard(playerHand, "player-cards");
    updateScores();
    
    if (playerScore > 21) {
      endGame("Bust! You went over 21. Dealer wins!");
    } else {
      stand();
    }
  } else {
    updateMessage("Not enough chips to double down!");
  }
}

document.getElementById("hit-btn").addEventListener("click", hit);
document.getElementById("stand-btn").addEventListener("click", stand);
document.getElementById("double-down-btn").addEventListener("click", doubleDown);
document.getElementById("new-game-btn").addEventListener("click", startNewGame);
document.getElementById("bet-btn").addEventListener("click", placeBet);

function endGame(result) {
  message.textContent = result;
  
  // Gestion des gains
  if (result.includes("gagnez")) {
    chips += bet * 2; // Retourne la mise initiale plus les gains
  } else if (result.includes("Égalité")) {
    chips += bet; // Retourne la mise initiale en cas d'égalité
  }
  // En cas de perte, la mise est déjà perdue (déduite lors du bet)
  
  // Mise à jour de l'affichage des jetons
  document.getElementById("chip-count").textContent = chips;
  
  // Désactive les boutons de jeu
  document.getElementById("hit-btn").disabled = true;
  document.getElementById("stand-btn").disabled = true;
  document.getElementById("double-down-btn").disabled = true;
  document.getElementById("split-btn").disabled = true;
}

function updateMessage(text, type = 'info') {
  const messageEl = document.getElementById('message');
  messageEl.className = `alert alert-light py-1 px-2 small`;
  messageEl.textContent = text;
}

function adjustBet(amount) {
  const betInput = document.getElementById("bet-amount");
  let currentBet = parseInt(betInput.value);
  currentBet += amount;
  
  currentBet = Math.max(1, Math.min(currentBet, chips));
  betInput.value = currentBet;
}