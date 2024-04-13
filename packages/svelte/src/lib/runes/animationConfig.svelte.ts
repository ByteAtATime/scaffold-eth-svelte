const ANIMATION_TIME = 2_000;

export const createAnimationConfig = (data: () => unknown) => {
  let showAnimation = $state(false);
  let prevData = $state();

  $effect(() => {
    const newData = data();
    if (prevData !== undefined && prevData !== newData) {
      showAnimation = true;
      setTimeout(() => (showAnimation = false), ANIMATION_TIME);
    }
    prevData = newData;
  });

  return () => showAnimation;
};
