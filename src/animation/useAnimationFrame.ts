import { useEffect, useRef } from 'react';

interface AnimationState {
  time: number;
  deltaTime: number;
  isPaused: boolean;
}

type AnimationCallback = (state: AnimationState) => void;

const subscribers = new Set<AnimationCallback>();
let animationState: AnimationState = { time: 0, deltaTime: 0, isPaused: false };
let lastTime = 0;
let rafId: number | null = null;

function tick(currentTime: number) {
  const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
  lastTime = currentTime;

  animationState = {
    time: currentTime / 1000,
    deltaTime,
    isPaused: false,
  };

  subscribers.forEach((callback) => callback(animationState));
  rafId = requestAnimationFrame(tick);
}

function startLoop() {
  if (rafId === null) {
    rafId = requestAnimationFrame(tick);
  }
}

function stopLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

export function useAnimationFrame(callback: AnimationCallback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const wrappedCallback = (state: AnimationState) => callbackRef.current(state);
    subscribers.add(wrappedCallback);

    if (subscribers.size === 1) startLoop();

    return () => {
      subscribers.delete(wrappedCallback);
      if (subscribers.size === 0) stopLoop();
    };
  }, []);
}

export function getAnimationTime() {
  return animationState.time;
}
