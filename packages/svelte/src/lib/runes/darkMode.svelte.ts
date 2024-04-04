import { untrack } from "svelte";
import { browser } from "$app/environment";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

type CreateDarkModeOutput =
  | {
      isDarkMode: boolean;
      toggle: () => void;
      enable: () => void;
      disable: () => void;
    }
  | undefined;

// WHEN CHANGING THIS, REMEMBER TO CHANGE /src/app.html
const LOCAL_STORAGE_THEME_KEY = "scaffold-eth-dark-mode";

const createMediaQuery = (query: string) => {
  let matches = $state(false);

  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener("change", v => (matches = v.matches));
  matches = mediaQuery.matches;

  return {
    get matches() {
      return matches;
    },
  };
};

export function createDarkMode(defaultValue?: boolean): CreateDarkModeOutput {
  if (!browser) return;

  const isDarkOS = createMediaQuery(COLOR_SCHEME_QUERY);
  const prevIsDarkOs = $state({ matches: isDarkOS.matches });

  const initialStorageValue: boolean | null = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) === "true";
  let isDarkMode = $state(Boolean(defaultValue ?? initialStorageValue));

  $effect(() => {
    isDarkMode;

    untrack(() => {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, isDarkMode.toString());
    });
  });

  // set if no init value
  $effect(() => {
    if (initialStorageValue === null) {
      isDarkMode = defaultValue || isDarkOS.matches;
    }
  });

  // update on os color change
  $effect(() => {
    if (isDarkOS.matches !== prevIsDarkOs.matches) {
      prevIsDarkOs.matches = isDarkOS.matches;
      isDarkMode = isDarkOS.matches;
    }
  });

  return {
    get isDarkMode() {
      return isDarkMode;
    },
    toggle: () => (isDarkMode = !isDarkMode),
    enable: () => (isDarkMode = true),
    disable: () => (isDarkMode = false),
  };
}
