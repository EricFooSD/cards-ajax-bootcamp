/*
 * ========================================================
 *
 *                  Card Deck Functions
 *
 * ========================================================
 */

// get a random index from an array given it's size
const getRandomIndex = function (size) {
  return Math.floor(Math.random() * size);
};

// cards is an array of card objects
const shuffleCards = function (cards) {
  let currentIndex = 0;

  // loop over the entire cards array
  while (currentIndex < cards.length) {
    // select a random position from the deck
    const randomIndex = getRandomIndex(cards.length);

    // get the current card in the loop
    const currentItem = cards[currentIndex];

    // get the random card
    const randomItem = cards[randomIndex];

    // swap the current card and the random card
    cards[currentIndex] = randomItem;
    cards[randomIndex] = currentItem;

    currentIndex += 1;
  }

  // give back the shuffled deck
  return cards;
};

const makeDeck = function () {
  // create the empty deck at the beginning
  const deck = [];

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  let suitIndex = 0;
  while (suitIndex < suits.length) {
    // make a variable of the current suit
    const currentSuit = suits[suitIndex];

    // loop to create all cards in this suit
    // rank 1-13
    let rankCounter = 1;
    while (rankCounter <= 13) {
      let cardName = rankCounter;
      // 1, 11, 12 ,13
      if (cardName === 1) {
        cardName = 'A';
      } else if (cardName === 11) {
        cardName = 'J';
      } else if (cardName === 12) {
        cardName = 'Q';
      } else if (cardName === 13) {
        cardName = 'K';
      }

      let icon = suitIndex;
      if (suitIndex === 0) {
        icon = '♥️';
      } else if (suitIndex === 1) {
        icon = '♦️';
      } else if (suitIndex === 2) {
        icon = '♣️';
      } else if (suitIndex === 3) {
        icon = '♠️';
      }

      let cardColor = suitIndex;
      if (suitIndex === 0 || suitIndex === 1) {
        cardColor = 'red';
      } else {
        cardColor = 'black';
      }

      // make a single card object variable
      const card = {
        name: cardName,
        suit: currentSuit,
        rank: rankCounter,
        symbol: icon,
        color: cardColor,
      };

      // add the card to the deck
      deck.push(card);

      rankCounter += 1;
    }
    suitIndex += 1;
  }

  return deck;
};

const decideWinner = (a, b) => {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return 2;
  }
  return 0;
};

const outcomeMsg = (winner) => {
  if (winner === 1) {
    return 'Player One Wins!!!🎉💪🏼';
  }
  if (winner === 2) {
    return 'Player Two Wins!!!🎉💪🏼';
  }
  return 'Game is a Tie';
};

const updateScore = (obj, winner) => {
  if (winner === 1) {
    obj.playerOne += 1;
    return obj;
  }
  if (winner === 2) {
    obj.playerTwo += 1;
    return obj;
  }
  return obj;
};

/*
 * ========================================================
 *
 *                  Controller Functions
 *
 * ========================================================
 */

export default function initGamesController(db) {
  // render the main page
  const index = (request, response) => {
    response.render('games/index');
  };

  // create a new game. Insert a new row in the DB.
  const create = async (request, response) => {
    // deal out a new shuffled deck for this game.
    const cardDeck = shuffleCards(makeDeck());
    const playerHand = {
      playerOne: [cardDeck.pop()],
      playerTwo: [cardDeck.pop()],
    };
    const winner = decideWinner(playerHand.playerOne[0].rank, playerHand.playerTwo[0].rank);
    const currentScore = {
      playerOne: 0,
      playerTwo: 0,
    };

    const outcome = {
      message: outcomeMsg(winner),
      score: updateScore(currentScore, winner),
    };

    const newGame = {
      gameState: {
        cardDeck,
        playerHand,
        outcome,
      },
    };

    try {
      // run the DB INSERT query
      const game = await db.Game.create(newGame);

      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        outcome: game.gameState.outcome,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // deal new cards from the deck.
  const deal = async (request, response) => {
    try {
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);

      // make changes to the object
      const playerHand = {
        playerOne: [game.gameState.cardDeck.pop()],
        playerTwo: [game.gameState.cardDeck.pop()],
      };

      const winner = decideWinner(playerHand.playerOne[0].rank, playerHand.playerTwo[0].rank);

      const outcome = {
        message: outcomeMsg(winner),
        score: updateScore(game.gameState.outcome.score, winner),
      };
      // update the game with the new info
      await game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          playerHand,
          outcome,
        },

      });

      // send the updated game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        outcome: game.gameState.outcome,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    deal,
    create,
    index,
  };
}
