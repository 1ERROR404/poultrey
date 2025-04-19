/**
 * Scrolls smoothly to a section by ID with offset for the fixed header
 * 
 * @param id The ID of the section to scroll to (without the '#' prefix)
 * @param offset Optional additional offset (default: 0)
 */
export function scrollToSection(id: string, offset: number = 0): void {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    const element = document.getElementById(id);
    
    if (element) {
      // Get the element's position
      const rect = element.getBoundingClientRect();
      
      // Calculate scroll position with offset
      // Mobile screens get a smaller offset
      const isMobile = window.innerWidth < 768;
      const headerOffset = isMobile ? 60 : 80;
      const totalOffset = headerOffset + offset;
      
      // Calculate the final position
      const scrollTop = window.pageYOffset + rect.top - totalOffset;
      
      // Scroll to the position
      window.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, 100);
}