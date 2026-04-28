if (window.matchMedia("(pointer: coarse)").matches) {
  throw new Error("Touch device detected, cursor script is skipped.");
}

const starElement = document.createElement("div");
starElement.className = "star-cursor star-cursor--idle";

starElement.innerHTML = `
  <svg class="star-cursor__svg" viewBox="-60 -60 120 120">
    <polygon
      class="star-cursor__shape"
      points="0,-54 22.2,-30.4 51.3,-16.7 35.8,11.6 31.5,44.5 0,29.0 -31.5,44.5 -35.8,11.6 -51.3,-16.7 -22.2,-30.4"
    />
    <circle class="star-cursor__eye star-cursor__eye--left"  cx="-13" cy="-6" r="5"/>
    <circle class="star-cursor__eye star-cursor__eye--right" cx="13"  cy="-6" r="5"/>
    <path class="star-cursor__mouth" d="M -7 9 Q 0 16 7 9"/>
  </svg>
`;

const bubbleElement = document.createElement("div");
bubbleElement.className = "speech-bubble";

bubbleElement.innerHTML = `
  <svg class="speech-bubble__svg">
    <rect class="speech-bubble__rect" x="0" y="0" rx="18" ry="18"/>
    <text class="speech-bubble__text" dominant-baseline="middle"></text>
  </svg>
`;

document.body.appendChild(starElement);
document.body.appendChild(bubbleElement);

const mouthEl = starElement.querySelector(".star-cursor__mouth");
const eyeLeftEl = starElement.querySelector(".star-cursor__eye--left");
const eyeRightEl = starElement.querySelector(".star-cursor__eye--right");

const bubbleSvgEl = bubbleElement.querySelector(".speech-bubble__svg");
const bubbleRectEl = bubbleElement.querySelector(".speech-bubble__rect");
const bubbleTextEl = bubbleElement.querySelector(".speech-bubble__text");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let currentState = "idle";

const smilePath = "M -7 9 Q 0 16 7 9";
const grinPath = "M -9 7 Q 0 18 9 7";
const mouthPath = "M -3.5 10 A 3.5 3.5 0 1 1 3.5 10 A 3.5 3.5 0 1 1 -3.5 10";

document.addEventListener("mousemove", function (e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

const BUBBLE_CHAR_WIDTH = 12;
const BUBBLE_PADDING = 35;
const BUBBLE_HEIGHT = 39;

let typingTimeout = null;

function configureBubble(label) {
  const fullWidth = Math.round(label.length * BUBBLE_CHAR_WIDTH + BUBBLE_PADDING);

  bubbleSvgEl.setAttribute("width", fullWidth);
  bubbleSvgEl.setAttribute("height", BUBBLE_HEIGHT);
  bubbleSvgEl.setAttribute("viewBox", `0 0 ${fullWidth} ${BUBBLE_HEIGHT}`);

  bubbleRectEl.setAttribute("width", fullWidth);
  bubbleRectEl.setAttribute("height", BUBBLE_HEIGHT);

  bubbleTextEl.setAttribute("x", fullWidth / 2);
  bubbleTextEl.setAttribute("y", BUBBLE_HEIGHT / 2);
  bubbleTextEl.setAttribute("text-anchor", "middle");

  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }

  bubbleTextEl.textContent = "";
  const chars = label.split("");
  let i = 0;

  function typeNext() {
    if (i < chars.length) {
      bubbleTextEl.textContent += chars[i];
      i++;
      typingTimeout = setTimeout(typeNext, 40);
    }
  }

  typeNext();
}

function setState(nextState, label) {
  if (nextState === currentState) return;
  currentState = nextState;

  starElement.classList.remove(
    "star-cursor--idle",
    "star-cursor--view",
    "star-cursor--soon"
  );

  eyeLeftEl.setAttribute("r", "5");
  eyeRightEl.setAttribute("r", "5");

  if (nextState === "idle") {
    starElement.classList.add("star-cursor--idle");
    mouthEl.setAttribute("d", smilePath);
    bubbleElement.classList.remove("speech-bubble--show");

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }
    bubbleTextEl.textContent = "";

  } else if (nextState === "view") {
    starElement.classList.add("star-cursor--view");
    mouthEl.setAttribute("d", grinPath);
    configureBubble(label || "View!");
    bubbleElement.classList.add("speech-bubble--show");

  } else if (nextState === "soon") {
    starElement.classList.add("star-cursor--soon");
    mouthEl.setAttribute("d", mouthPath);
    configureBubble(label || "Coming Soon!");
    bubbleElement.classList.add("speech-bubble--show");
  }
}

const BUBBLE_GAP = 12;

function loop() {
  starElement.style.left = mouseX + "px";
  starElement.style.top = mouseY + "px";

  const starRadius = (currentState === "view" || currentState === "soon") ? 39 : 30;
  const bubbleHeight = Number(bubbleSvgEl.getAttribute("height")) || BUBBLE_HEIGHT;

  bubbleElement.style.left = mouseX + "px";
  bubbleElement.style.top = (mouseY - starRadius - bubbleHeight - BUBBLE_GAP) + "px";

  requestAnimationFrame(loop);
}

loop();

document.querySelectorAll("[data-cursor]").forEach(function (el) {
  const cursorType = el.dataset.cursor;
  const cursorLabel = el.dataset.label;

  el.addEventListener("mouseenter", function () { setState(cursorType, cursorLabel); });
  el.addEventListener("mouseleave", function () { setState("idle"); });
});

document.addEventListener("mouseleave", function () {
  starElement.style.opacity = "0";
  bubbleElement.style.opacity = "0";
});

document.addEventListener("mouseenter", function () {
  starElement.style.opacity = "";
  bubbleElement.style.opacity = "";
});

function scheduleBlink() {
  const delay = 2000 + Math.random() * 3000;

  setTimeout(function () {
    if (currentState !== "soon") {
      eyeLeftEl.setAttribute("r", "0.8");
      eyeRightEl.setAttribute("r", "0.8");

      setTimeout(function () {
        eyeLeftEl.setAttribute("r", "5");
        eyeRightEl.setAttribute("r", "5");
      }, 110);
    }

    scheduleBlink();
  }, delay);
}

scheduleBlink();