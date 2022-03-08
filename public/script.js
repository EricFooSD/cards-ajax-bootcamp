// global value that holds info about the current hand.
let currentGame = null;

//
//           DOM Functions
// .....................................

const createInput = (title, id) => {
  const container = document.createElement('div');
  const inputTitle = document.createElement('h3');
  inputTitle.innerHTML = `${title}`;
  const inputField = document.createElement('input');
  inputField.setAttribute('id', `${id}`);
  container.appendChild(inputTitle);
  container.appendChild(inputField);
  return container;
};

const createDOM = (div, attribute) => {
  const element = document.createElement(div);
  element.setAttribute('id', attribute);
  return element;
};

const createCard = (cardInfo) => {
  const suit = document.createElement('div');
  suit.classList.add('suit');
  suit.innerText = cardInfo.symbol;

  const name = document.createElement('div');
  name.classList.add('name', cardInfo.colour);
  name.innerText = cardInfo.name;

  const card = document.createElement('div');
  card.classList.add('card');

  card.appendChild(name);
  card.appendChild(suit);

  return card;
};

/*
 * ========================================================
 *                  DOM ELEMENTS
 * ========================================================
 */

// create game button
const createGameBtn = document.createElement('button');

// getting DIV elements
const gameControl = document.querySelector('#game-controls-container');

const gameContainer = document.querySelector('#game-container');
const playerOneName = document.createElement('h3');
gameContainer.appendChild(playerOneName);

const cardContainer1 = createDOM('div', 'card-container');
gameContainer.appendChild(cardContainer1);

const playerTwoName = document.createElement('h3');
gameContainer.appendChild(playerTwoName);

const cardContainer2 = createDOM('div', 'card-container');
gameContainer.appendChild(cardContainer2);

const scoreContainer = document.createElement('div');
gameContainer.appendChild(scoreContainer);

const loginContainer = document.querySelector('#login-signup');

/*
 * ========================================================
 *                  GAME FUNCTIONS
 * ========================================================
 */

// DOM manipulation function that displays the player's current hand.
const runGame = function (data) {
  // manipulate DOM
  playerOneName.innerHTML = 'Player One\'s Card is';

  const cardElementOne = createCard(data.playerHand.playerOne[0]);
  cardContainer1.appendChild(cardElementOne);

  playerTwoName.innerHTML = 'Player Two\'s Card is';

  const cardElementTwo = createCard(data.playerHand.playerTwo[0]);
  cardContainer2.appendChild(cardElementTwo);

  scoreContainer.innerText = `
    ${data.outcome.message}

    The score now is:
    Player One : ${data.outcome.score.playerOne}
    Player Two : ${data.outcome.score.playerTwo}
  `;
};

// make a request to the server
// to change the deck. set 2 new cards into the player hand.
const dealCards = function () {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;

      // display it to the user
      runGame(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const createGame = function () {
  // Make a request to create a new game
  axios.post('/games')
    .then((response) => {
      // create deal button
      const dealBtn = document.createElement('button');
      dealBtn.addEventListener('click', dealCards);

      const refreshBtn = document.createElement('button');
      refreshBtn.addEventListener('click', dealCards);
      // display the buttons
      dealBtn.innerText = 'Deal';
      gameControl.appendChild(dealBtn);
      refreshBtn.innerText = 'Refresh';
      gameControl.appendChild(refreshBtn);

      // remove create game button
      createGameBtn.remove();

      // set the global value to the new game.
      currentGame = response.data;
      console.log(currentGame);
      // display it out to the user
      runGame(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const initGameMode = function () {
  // manipulate DOM, set up create game button
  // create game btn
  createGameBtn.addEventListener('click', createGame);
  createGameBtn.innerText = 'Create Game';
  document.body.appendChild(createGameBtn);
};

const createloginForm = function () {
  // login form title
  const loginForm = document.createElement('h2');
  loginForm.innerText = 'Log In / Sign Up';
  loginContainer.appendChild(loginForm);

  // login form fields
  loginContainer.appendChild(createInput('Name', 'userName'));
  loginContainer.appendChild(createInput('Password', 'userPassword'));

  // submit button
  const loginBtn = document.createElement('button');
  loginBtn.innerHTML = 'Login';

  loginBtn.addEventListener('click', () => {
    axios
      .post('/login', {
        name: document.getElementById('userName').value,
        password: document.getElementById('userPassword').value,
      })
      .then((response) => {
        console.log(response.data);
        if (response.data === 'LOGGED_IN') {
          loginContainer.remove();
          initGameMode();
        }
      })
      .catch((error) => {
      // handle error
        console.log(error);
      }); });

  loginContainer.appendChild(loginBtn);
};

/*
 * ========================================================
 *                  LOGGED IN CHECK
 * ========================================================
 */

axios.get('/loginStatus')
  .then((response) => {
    if (response.data.isloggedIn) {
      initGameMode();
    } else {
      createloginForm();
    }
  })
  .catch((error) => {
    // handle error
    console.log(error);
  });
