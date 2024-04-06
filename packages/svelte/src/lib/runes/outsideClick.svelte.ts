export const createOutsideClick = (
  node: HTMLElement | (() => HTMLElement | undefined) | undefined,
  callback: () => void,
) => {
  $effect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (node) {
        let actualNode: HTMLElement | undefined = undefined;
        if (node instanceof HTMLElement) actualNode = node;
        if (typeof node === "function") actualNode = node();

        if (actualNode && !actualNode.contains(event.target)) callback();
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  });
};
