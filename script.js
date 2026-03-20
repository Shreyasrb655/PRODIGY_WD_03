const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const difficultySelect = document.getElementById("difficulty");
const scoreText = document.getElementById("score");
const themeToggle = document.getElementById("themeToggle");
const winLine = document.getElementById("winLine");

let board = ["","","","","","","","",""];
let gameActive = true;
let playerScore=0, aiScore=0, drawScore=0;

const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

cells.forEach((cell,index)=>{
  cell.addEventListener("click", ()=>{
    if(board[index]!==""||!gameActive) return;

    move(index,"X");
    if(gameActive){
      statusText.textContent="AI Thinking...";
      setTimeout(aiMove,400);
    }
  });
});

function move(i,p){
  board[i]=p;
  cells[i].textContent=p;
  cells[i].classList.add(p);
  checkWinner(p);
}

function aiMove(){
  let level=difficultySelect.value;
  let moveIndex;

  if(level==="easy"){
    moveIndex=randomMove();
  }else if(level==="medium"){
    moveIndex=Math.random()<0.5?randomMove():minimax(board,"O").index;
  }else{
    moveIndex=minimax(board,"O").index;
  }

  move(moveIndex,"O");
}

function randomMove(){
  let empty=board.map((v,i)=>v===""?i:null).filter(v=>v!==null);
  return empty[Math.floor(Math.random()*empty.length)];
}

function checkWinner(player){
  for(let cond of winConditions){
    let[a,b,c]=cond;
    if(board[a]&&board[a]===board[b]&&board[a]===board[c]){
      highlight(cond);
      drawLine(cond);

      gameActive=false;
      player==="X"?playerScore++:aiScore++;

      statusText.textContent=player==="X"?"🎉 You Win!":"🤖 AI Wins!";
      updateScore();
      return;
    }
  }

  if(!board.includes("")){
    gameActive=false;
    drawScore++;
    statusText.textContent="Draw!";
    updateScore();
    return;
  }

  statusText.textContent=player==="X"?"AI Thinking...":"Your Turn";
}

function updateScore(){
  scoreText.textContent=`You: ${playerScore} | AI: ${aiScore} | Draw: ${drawScore}`;
}

function highlight(cond){
  cond.forEach(i=>cells[i].style.background="rgba(0,255,0,0.4)");
}

/* WIN LINE */
function drawLine([a,b,c]){
  const pos=[
    [50,50],[150,50],[250,50],
    [50,150],[150,150],[250,150],
    [50,250],[150,250],[250,250]
  ];

  let[x1,y1]=pos[a];
  let[x3,y3]=pos[c];

  let len=Math.hypot(x3-x1,y3-y1);
  let angle=Math.atan2(y3-y1,x3-x1)*(180/Math.PI);

  winLine.style.width=len+"px";
  winLine.style.left=x1+"px";
  winLine.style.top=y1+"px";
  winLine.style.transform=`rotate(${angle}deg) scaleX(1)`;
}

/* RESTART */
restartBtn.onclick=()=>{
  board=["","","","","","","","",""];
  gameActive=true;
  winLine.style.transform="scaleX(0)";

  cells.forEach(c=>{
    c.textContent="";
    c.classList.remove("X","O");
    c.style.background="rgba(255,255,255,0.2)";
  });

  statusText.textContent="Your Turn";
};

/* THEME */
themeToggle.onclick=()=>{
  document.body.classList.toggle("light");
};

/* MINIMAX */
function minimax(newBoard,player){
  let empty=newBoard.map((v,i)=>v===""?i:null).filter(v=>v!==null);

  if(checkWin(newBoard,"X")) return {score:-10};
  if(checkWin(newBoard,"O")) return {score:10};
  if(empty.length===0) return {score:0};

  let moves=[];

  for(let i of empty){
    let move={index:i};
    newBoard[i]=player;

    let result=minimax(newBoard,player==="O"?"X":"O");
    move.score=result.score;

    newBoard[i]="";
    moves.push(move);
  }

  let best;

  if(player==="O"){
    let max=-Infinity;
    moves.forEach((m,i)=>{if(m.score>max){max=m.score;best=i;}});
  }else{
    let min=Infinity;
    moves.forEach((m,i)=>{if(m.score<min){min=m.score;best=i;}});
  }

  return moves[best];
}

function checkWin(board,p){
  return winConditions.some(c=>c.every(i=>board[i]===p));
}