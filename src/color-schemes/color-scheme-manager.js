/**
 * Color Schemes for Resume Builder
 * Following GitHub's design system and accessibility guidelines
 */

const colorSchemes = {
  professional: {
    name: 'professional',
    displayName: 'Professional',
    colors: {
      background: '#ffffff',
      surface: '#fafbfc',
      surfaceSecondary: '#f3f4f6',
      border: '#e1e4e8',
      borderSecondary: '#d0d7de',
      
      textPrimary: '#24292f',
      textSecondary: '#57606a',
      textTertiary: '#656d76',
      textInverse: '#ffffff',
      
      primary: '#0550ae',
      primaryLight: '#0969da',
      primaryDark: '#033d8b',
      secondary: '#6e7781',
      
      success: '#1a7f37',
      warning: '#bf8700',
      error: '#da3633',
      info: '#0550ae',
      
      link: '#0550ae',
      linkHover: '#033d8b',
      buttonBackground: '#0550ae',
      buttonHover: '#033d8b',
      inputBackground: '#ffffff',
      inputBorder: '#e1e4e8',
      inputFocus: '#0550ae',
    }
  },
  
  dark: {
    name: 'dark',
    displayName: 'Dark Mode',
    colors: {
      background: '#0d1117',
      surface: '#161b22',
      surfaceSecondary: '#21262d',
      border: '#30363d',
      borderSecondary: '#21262d',
      
      textPrimary: '#f0f6fc',
      textSecondary: '#c9d1d9',
      textTertiary: '#8b949e',
      textInverse: '#0d1117',
      
      primary: '#58a6ff',
      primaryLight: '#79c0ff',
      primaryDark: '#388bfd',
      secondary: '#8b949e',
      
      success: '#3fb950',
      warning: '#d29922',
      error: '#f85149',
      info: '#58a6ff',
      
      link: '#58a6ff',
      linkHover: '#79c0ff',
      buttonBackground: '#238636',
      buttonHover: '#2ea043',
      inputBackground: '#0d1117',
      inputBorder: '#30363d',
      inputFocus: '#58a6ff',
    }
  }
};

function applyColorScheme(scheme) {
  const root = document.documentElement;
  const colors = colorSchemes[scheme]?.colors || colorSchemes.professional.colors;
  
  // Apply CSS custom properties
  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    root.style.setProperty(`--color-${cssVar}`, value);
  });
  
  // Set data attribute for CSS selectors
  document.body.setAttribute('data-color-scheme', scheme);
  
  // Save preference
  localStorage.setItem('resume-builder-color-scheme', scheme);
}

function detectPreferredScheme() {
  // Check localStorage first
  const saved = localStorage.getItem('resume-builder-color-scheme');
  if (saved && colorSchemes[saved]) {
    return saved;
  }
  
  // Check system preference
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'professional';
}

// Initialize color scheme
document.addEventListener('DOMContentLoaded', () => {
  applyColorScheme(detectPreferredScheme());
});

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ColorSchemeManager = {
    schemes: colorSchemes,
    apply: applyColorScheme,
    detect: detectPreferredScheme
  };
}