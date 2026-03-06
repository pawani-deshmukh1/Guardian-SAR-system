let siren = null;
let audioUnlocked = false;

// Unlock audio on first click anywhere
export const unlockAudio = () => {
  if (audioUnlocked) return;

  const dummy = new Audio();
  dummy.play().catch(() => {});
  audioUnlocked = true;
};

document.addEventListener("click", unlockAudio);

/* 🚨 CRITICAL SIREN */
export const playSiren = () => {

  if(!audioUnlocked) return;

  if(siren) return;

  siren = new Audio("/siren.mp3");
  siren.volume = 1;
  siren.play().catch(()=>{});
};

/* ⚠️ WARNING BEEP */
export const playWarning = () => {

  if(!audioUnlocked) return;

  const warning = new Audio("/warning.mp3");
  warning.volume = 0.7;
  warning.play().catch(()=>{});
};

/* 🎯 TARGET LOCK */
export const playTargetLock = () => {

  if(!audioUnlocked) return;

  const lock = new Audio("/targetlock.mp3");
  lock.volume = 0.8;
  lock.play().catch(()=>{});
};

/* 🔇 STOP */
export const stopSiren = () => {

  if(!siren) return;

  siren.pause();
  siren.currentTime = 0;
  siren = null;
};