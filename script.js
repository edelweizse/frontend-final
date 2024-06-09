document.addEventListener('DOMContentLoaded', function() {
  setElementBackgroundImages();
  loadContent('./components/startgame.html');
  document.addEventListener('keydown', handleKeyPress);
})

function loadContent(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      document.getElementById('middle-area').innerHTML = xhr.responseText;
      setElementBackgroundImages();
      if(typeof callback === 'function'){
        callback();
      }
      if (url.includes('finish.html')) {
        displayFinalTime(); 
      } else if (url.includes('startgame.html')) {
        resetTimer();
      }
    }
  };
  xhr.send();
}

function setElementBackgroundImages() {
  document.querySelectorAll(".spell-bar-item").forEach(function(item) {
    const img = item.getAttribute("data-img");
    if (img) {
        item.style.backgroundImage = `url(${img})`;
    }
  });

  document.querySelectorAll(".spells-item").forEach(function(item) {
    const img = item.getAttribute("data-img");
    if (img) {
      item.style.backgroundImage = `url(${img})`;
    }
  });

  document.querySelectorAll(".cspell-img").forEach(function(item) {
    const img = item.getAttribute("data-img");
    if (img) {
      item.style.backgroundImage = `url(${img})`;
    }
  });

  document.querySelectorAll(".rank-ico").forEach(function(item) {
    const img = item.getAttribute("data-img");
    if (img) {
      item.style.backgroundImage = `url(${img})`;
    }
  });


  document.querySelectorAll(".sphere").forEach(function(item) {
    const img = item.getAttribute("data-img");
    if (img) {
      const correctImgPath = img.replace('./', '../');
      item.style.backgroundImage = `url(${correctImgPath})`; 
    } else {
      item.style.backgroundImage = 'none';
    }
});
}

const invokerSpells = {
  cold_snap: "qqq",
  emp: "www",
  sun_strike: "eee",
  ghost_walk: "qqw",
  tornado: "wwq",
  ice_wall: "qqe",
  alacrity: "wwe",
  chaos_meteor: "eew",
  forge_spirit: "qee",
  deafening_blast: "qwe"
};

const rankImages = {
  "herald": "../images/ranks/herald.webp",
  "guardian": "../images/ranks/guardian.webp",
  "crusader": "../images/ranks/crusader.webp",
  "archon": "../images/ranks/archon.webp",
  "legend": "../images/ranks/legend.webp",
  "ancient": "../images/ranks/ancient.webp",
  "divine": "../images/ranks/divine.webp",
  "immortal": "../images/ranks/immortal.webp"
};

let currentSpell = null;
const maxSpheres = 3;
const maxSpellBarItems = 2; 
let sphereQueue = Array(maxSpheres).fill(null);
let spellBarQueue = Array(maxSpellBarItems).fill(null);
let spellsCast = [];
let isGameActive = false;
let timerElement;
let startTime;
let timerInterval;
window.resetTimer = resetTimer;

function initializeTimer() {
  timerElement = document.getElementById("timer");
  if (timerInterval){clearInterval(timerInterval);}
  resetTimer();
  startTimer();
  generateRandomSpell();
  isGameActive = true;
}

function generateRandomSpell() {
  const availableSpells = Object.keys(invokerSpells).filter(spell => !spellsCast.includes(spell));

  if (availableSpells.length === 0) {
    stopTimer();
    loadContent('./components/finish.html');
    return;
  }

  const randomIndex = Math.floor(Math.random() * availableSpells.length);
  currentSpell = availableSpells[randomIndex];

  document.querySelector('.cspell-img').dataset.img = `./images/spells/${currentSpell}.png`;
  setElementBackgroundImages();
  const displaySpellName = currentSpell.replace(/_/g, ' ');
  document.getElementById('cspell-text').innerText = displaySpellName;}

function handleKeyPress(event) {
  if (!isGameActive) return; 
  const key = event.key.toLowerCase();
  if (['q', 'w', 'e'].includes(key)) {
    sphereQueue.push(key);
    sphereQueue.shift();
    updateSpheres(sphereQueue);
  } else if (key === 'r') {
    castSpell();
  }
}


function castSpell() {
  const orbCounts = { q: 0, w: 0, e: 0 };
  sphereQueue.forEach(orb => {
      if (orb) {
        orbCounts[orb]++;
      }
  });
  for (const [spellName, spellCombo] of Object.entries(invokerSpells)) {
    const spellOrbCounts = { q: 0, w: 0, e: 0 };
    spellCombo.split('').forEach(orb => spellOrbCounts[orb]++);

    if (orbCounts.q === spellOrbCounts.q && orbCounts.w === spellOrbCounts.w && orbCounts.e === spellOrbCounts.e) {
      const castSpellName = spellName;
      if (castSpellName === spellBarQueue[1]) {
        [spellBarQueue[0], spellBarQueue[1]] = [spellBarQueue[1], spellBarQueue[0]];
        updateSpellBar(spellBarQueue);
      } else {
          spellBarQueue.push(castSpellName);
          spellBarQueue.shift();
          updateSpellBar(spellBarQueue);
        }
        if (castSpellName === currentSpell) {
          spellsCast.push(currentSpell);
          if (spellsCast.length === Object.keys(invokerSpells).length) {
            isGameActive = false;
            stopTimer();
            loadContent('./components/finish.html');
            } else {
              generateRandomSpell();
            }
        }
      return;
    }
  }
}

function updateSpheres(queue) {
  const spheres = document.querySelectorAll('.sphere');
  for (let i = 0; i < maxSpheres; i++) {
    console.log(queue[i]);
    spheres[i].dataset.img = queue[i] ? `./images/spheres/${queue[i]}.png` : null;
  }
  setElementBackgroundImages();
}

function updateSpellBar(queue) {
  const spellBarItems = document.querySelectorAll('.spell-bar-item[text="d"], .spell-bar-item[text="f"]');
  for (let i = maxSpellBarItems - 1; i >= 0; i--) {  
    spellBarItems[i].dataset.img = queue[maxSpellBarItems - 1 - i] ? `./images/spells/${queue[maxSpellBarItems - 1 - i]}.png` : null;
  }
  setElementBackgroundImages();
}

function startTimer() {
  sphereQueue = Array(maxSpheres).fill(null);
  spellBarQueue = Array(maxSpellBarItems).fill(null);
  spellsCast = [];
  updateSpheres(sphereQueue);
  updateSpellBar(spellBarQueue);
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1); 
}

function stopTimer() {
  clearInterval(timerInterval);
  isGameActive = false;
}

function resetTimer() {
  stopTimer();
  const timerElement = document.getElementById("timer");
  timerElement.textContent = "00.00";
}

function updateTimer() {
  const elapsedTime = Date.now() - startTime;
  const totalSeconds = elapsedTime / 1000;
  const seconds = Math.floor(totalSeconds);
  const milliseconds = Math.floor((totalSeconds - seconds) * 100);

  const formattedSeconds = seconds.toString().padStart(2, "0");
  const formattedMilliseconds = milliseconds.toString().padStart(2, "0");

  timerElement.textContent = `${formattedSeconds}.${formattedMilliseconds}`;
}

function updateTimer() {
  const elapsedTime = Date.now() - startTime;
  const totalSeconds = elapsedTime / 1000;
  const seconds = Math.floor(totalSeconds);
  const milliseconds = Math.floor((totalSeconds - seconds) * 100);

  const formattedSeconds = seconds.toString().padStart(2, "0");
  const formattedMilliseconds = milliseconds.toString().padStart(2, "0");

  timerElement.textContent = `${formattedSeconds}.${formattedMilliseconds}`;
}

function displayFinalTime() {
  const finalTime = timerElement.textContent;
  if (timerElement) {
    const timerParagraph = document.getElementById('timer');
    if (timerParagraph) {
      timerParagraph.textContent = finalTime;
    }
  }
  updateRankImage(finalTime);
}

function updateRankImage(finalTime) {
  const [seconds, milliseconds] = finalTime.split('.').map(Number);
  const totalSeconds = seconds+(milliseconds/100);
  let rank;
  console.log(totalSeconds)

  if (totalSeconds <= 7) {
    rank = "immortal";
  } else if (totalSeconds <= 8) {
    rank = "divine";
  } else if (totalSeconds <= 9) {
    rank = "ancient";
  } else if (totalSeconds <= 10) {
    rank = "legend";
  } else if (totalSeconds <= 15) {
    rank = "archon";
  } else if (totalSeconds <= 20) {
    rank = "crusader";
  } else if (totalSeconds <= 25) {
    rank = "guardian";
  } else {
    rank = "herald";
  }

  const rankElement = document.getElementById('rank');
  if (rankElement) {
    rankElement.style.backgroundImage = `url(${rankImages[rank]})`;
  }
}

const rankData = [
  { rank: "Herald", maxTime: "25+", icon: "./images/ranks/herald.webp " },
  { rank: "Guardian", maxTime: "25>", icon: "./images/ranks/guardian.webp " },
  { rank: "Crusader", maxTime: "20>", icon: "./images/ranks/crusader.webp " },
  { rank: "Archon", maxTime: "15>", icon: "./images/ranks/archon.webp " },
  { rank: "Legend", maxTime: "10>", icon: "./images/ranks/legend.webp " },
  { rank: "Ancient", maxTime: "9>", icon: "./images/ranks/ancient.webp " },
  { rank: "Divine", maxTime: "8>", icon: "./images/ranks/divine.webp " },
  { rank: "Immortal", maxTime: "7>", icon: "./images/ranks/immortal.webp " }  
];


function createRankTable() {
  const tableBody = document.querySelector('#rankTable tbody');

  rankData.forEach(rankItem => {
    const row = tableBody.insertRow();
    const rankCell = row.insertCell();
    const timeCell = row.insertCell();

    const rankIcon = document.createElement('img');
    rankIcon.src = rankItem.icon;
    rankIcon.alt = `${rankItem.rank} Icon`;
    rankIcon.classList.add('rank-icon');

    rankCell.appendChild(rankIcon);
    rankCell.innerHTML += rankItem.rank;

    timeCell.textContent = rankItem.maxTime;
});
}