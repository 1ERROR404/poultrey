// Custom image resize module for Quill
// Based on quill-image-resize-module

import Quill from 'quill';

const Parchment = Quill.import('parchment');
const ImageBlot = Quill.import('formats/image');

class ImageResize {
  quill: any;
  options: any;
  currentImg: any;
  overlay: HTMLElement | null = null;
  alignmentControls: HTMLElement | null = null;
  handles: HTMLElement[] = [];

  constructor(quill: any, options: any = {}) {
    this.quill = quill;
    this.options = options;
    
    // Listen for the editor to be ready
    this.quill.root.addEventListener('click', this.handleClick.bind(this));
    
    // Create resize overlay to container resize handles
    this.createOverlay();
  }

  createOverlay() {
    // Create overlay div
    this.overlay = document.createElement('div');
    this.overlay.classList.add('image-resize-overlay');
    Object.assign(this.overlay.style, {
      position: 'absolute',
      boxSizing: 'border-box',
      border: '2px dashed #3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      display: 'none',
      zIndex: '998',
      pointerEvents: 'none'
    });
    
    // Create resize handles in 8 positions
    const positions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    positions.forEach(position => {
      const handle = document.createElement('div');
      handle.classList.add('image-resize-handle', `image-resize-handle-${position}`);
      Object.assign(handle.style, {
        position: 'absolute',
        height: '16px',
        width: '16px',
        backgroundColor: 'white',
        border: '2px solid #3b82f6',
        borderRadius: '50%',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        zIndex: '999',
        pointerEvents: 'auto'
      });
      
      // Position the handle
      this.positionHandle(handle, position);
      
      // Add event listener for dragging
      handle.addEventListener('mousedown', this.handleMousedown.bind(this, position));
      
      this.handles.push(handle);
      if (this.overlay) {
        this.overlay.appendChild(handle);
      }
    });
    
    // Add dimension display
    const dimensionDisplay = document.createElement('div');
    dimensionDisplay.classList.add('image-resize-dimension-display');
    Object.assign(dimensionDisplay.style, {
      position: 'absolute',
      top: '-24px',
      left: '0',
      backgroundColor: '#3b82f6',
      color: 'white',
      fontSize: '12px',
      padding: '2px 6px',
      borderRadius: '3px'
    });
    
    // Create a separate container for alignment controls that's not part of the overlay
    this.alignmentControls = document.createElement('div');
    this.alignmentControls.classList.add('image-resize-alignment-controls');
    Object.assign(this.alignmentControls.style, {
      position: 'absolute',
      display: 'none', // Initially hidden
      justifyContent: 'center',
      gap: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '12px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
      zIndex: '9999',
      pointerEvents: 'auto'
    });
    
    // Create alignment buttons (left, center, right)
    const alignments = [
      { name: 'left', icon: '⬅️', tooltip: 'Align left' },
      { name: 'center', icon: '↔️', tooltip: 'Align center' },
      { name: 'right', icon: '➡️', tooltip: 'Align right' }
    ];
    
    alignments.forEach(alignment => {
      const button = document.createElement('button');
      button.classList.add('image-resize-alignment-button');
      button.setAttribute('data-align', alignment.name);
      button.setAttribute('title', alignment.tooltip);
      button.textContent = alignment.icon;
      Object.assign(button.style, {
        backgroundColor: 'white',
        border: '2px solid #3b82f6',
        borderRadius: '6px',
        padding: '8px 12px',
        margin: '0 4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      });
      
      // Add click handler
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setAlignment(alignment.name);
      });
      
      if (this.alignmentControls) {
        this.alignmentControls.appendChild(button);
      }
    });
    
    if (this.overlay) {
      this.overlay.appendChild(dimensionDisplay);
    }
    
    // Add the overlay and alignment controls to the editor container
    if (this.overlay && this.alignmentControls) {
      this.quill.container.appendChild(this.overlay);
      this.quill.container.appendChild(this.alignmentControls);
    }
    
    // Add event listener for clicks outside the image
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  positionHandle(handle: HTMLElement, position: string) {
    switch (position) {
      case 'nw':
        Object.assign(handle.style, { top: '-8px', left: '-8px', cursor: 'nwse-resize' });
        break;
      case 'n':
        Object.assign(handle.style, { top: '-8px', left: 'calc(50% - 8px)', cursor: 'ns-resize' });
        break;
      case 'ne':
        Object.assign(handle.style, { top: '-8px', right: '-8px', cursor: 'nesw-resize' });
        break;
      case 'e':
        Object.assign(handle.style, { top: 'calc(50% - 8px)', right: '-8px', cursor: 'ew-resize' });
        break;
      case 'se':
        Object.assign(handle.style, { bottom: '-8px', right: '-8px', cursor: 'nwse-resize' });
        break;
      case 's':
        Object.assign(handle.style, { bottom: '-8px', left: 'calc(50% - 8px)', cursor: 'ns-resize' });
        break;
      case 'sw':
        Object.assign(handle.style, { bottom: '-8px', left: '-8px', cursor: 'nesw-resize' });
        break;
      case 'w':
        Object.assign(handle.style, { top: 'calc(50% - 8px)', left: '-8px', cursor: 'ew-resize' });
        break;
    }
  }

  handleClick(event: MouseEvent) {
    if (event.target && event.target instanceof HTMLElement) {
      if (event.target.tagName === 'IMG') {
        this.selectImage(event.target as HTMLImageElement);
      }
    }
  }
  
  handleOutsideClick(event: MouseEvent) {
    if (this.currentImg && event.target !== this.currentImg && 
        !this.overlay?.contains(event.target as Node) &&
        !this.alignmentControls?.contains(event.target as Node)) {
      this.hideOverlay();
    }
  }
  
  handleMousedown(position: string, event: MouseEvent) {
    if (!this.currentImg) return;
    
    event.preventDefault();
    
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = this.currentImg.width;
    const startHeight = this.currentImg.height;
    
    const aspectRatio = startWidth / startHeight;
    const maintainAspectRatio = true; // Could be an option
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      switch (position) {
        case 'nw':
          newWidth = startWidth - deltaX;
          newHeight = maintainAspectRatio ? newWidth / aspectRatio : startHeight - deltaY;
          break;
        case 'n':
          newHeight = startHeight - deltaY;
          newWidth = maintainAspectRatio ? newHeight * aspectRatio : startWidth;
          break;
        case 'ne':
          newWidth = startWidth + deltaX;
          newHeight = maintainAspectRatio ? newWidth / aspectRatio : startHeight - deltaY;
          break;
        case 'e':
          newWidth = startWidth + deltaX;
          newHeight = maintainAspectRatio ? newWidth / aspectRatio : startHeight;
          break;
        case 'se':
          newWidth = startWidth + deltaX;
          newHeight = maintainAspectRatio ? newWidth / aspectRatio : startHeight + deltaY;
          break;
        case 's':
          newHeight = startHeight + deltaY;
          newWidth = maintainAspectRatio ? newHeight * aspectRatio : startWidth;
          break;
        case 'sw':
          newWidth = startWidth - deltaX;
          newHeight = maintainAspectRatio ? newWidth / aspectRatio : startHeight + deltaY;
          break;
        case 'w':
          newWidth = startWidth - deltaX;
          newHeight = maintainAspectRatio ? newWidth / aspectRatio : startHeight;
          break;
      }
      
      // Apply minimum dimensions
      newWidth = Math.max(30, newWidth);
      newHeight = Math.max(30, newHeight);
      
      // Update image dimensions
      this.currentImg.width = Math.round(newWidth);
      this.currentImg.height = Math.round(newHeight);
      
      // Update overlay
      this.updateOverlay();
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // Update quill's content with the resized image
      this.updateImageInEditor();
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
  
  selectImage(img: HTMLImageElement) {
    // If there was another image selected, remove its selection
    if (this.currentImg && this.currentImg !== img) {
      this.hideOverlay();
    }
    
    this.currentImg = img;
    this.updateOverlay();
    this.showOverlay();
  }
  
  updateOverlay() {
    if (!this.currentImg || !this.overlay) return;
    
    const rect = this.currentImg.getBoundingClientRect();
    const containerRect = this.quill.container.getBoundingClientRect();
    
    Object.assign(this.overlay.style, {
      left: `${rect.left - containerRect.left}px`,
      top: `${rect.top - containerRect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    
    // Update dimension display
    const dimensionDisplay = this.overlay.querySelector('.image-resize-dimension-display');
    if (dimensionDisplay) {
      dimensionDisplay.textContent = `${Math.round(this.currentImg.width)} × ${Math.round(this.currentImg.height)}`;
    }
    
    // Also update alignment controls position
    if (this.alignmentControls && this.alignmentControls.style.display !== 'none') {
      Object.assign(this.alignmentControls.style, {
        left: `${rect.left - containerRect.left + (rect.width / 2) - 100}px`, // Center horizontally
        top: `${rect.bottom - containerRect.top + 15}px` // Position below image
      });
    }
  }
  
  showOverlay() {
    if (this.overlay) {
      this.overlay.style.display = 'block';
    }
    
    // Also show and position alignment controls
    if (this.alignmentControls && this.currentImg) {
      const rect = this.currentImg.getBoundingClientRect();
      const containerRect = this.quill.container.getBoundingClientRect();
      
      // Position the alignment controls below the image
      Object.assign(this.alignmentControls.style, {
        display: 'flex',
        left: `${rect.left - containerRect.left + (rect.width / 2) - 100}px`, // Center horizontally
        top: `${rect.bottom - containerRect.top + 15}px` // Position below image
      });
    }
  }
  
  hideOverlay() {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
    
    // Also hide alignment controls
    if (this.alignmentControls) {
      this.alignmentControls.style.display = 'none';
    }
    
    this.currentImg = null;
  }
  
  setAlignment(align: string) {
    if (!this.currentImg) return;
    
    try {
      // Find the parent element of the image (usually a <p> tag in Quill)
      let parentElement = this.currentImg.parentElement;
      
      // If we're dealing with a figure or paragraph, apply alignment to it
      if (parentElement?.tagName === 'FIGURE' || parentElement?.tagName === 'P') {
        // Use the parent element as is
      } else {
        // If we don't have a suitable parent, wrap the image in a div
        const wrapper = document.createElement('div');
        this.currentImg.parentNode?.insertBefore(wrapper, this.currentImg);
        wrapper.appendChild(this.currentImg);
        parentElement = wrapper;
      }
      
      if (!parentElement) return;
      
      // Remove any existing alignment classes
      parentElement.classList.remove('ql-align-left', 'ql-align-center', 'ql-align-right', 'ql-align-justify');
      
      // Apply the new alignment classes - important: always add the class, even for left alignment
      // Since we're working specifically with images in a wysiwyg editor, we need to force all alignments
      parentElement.classList.add(`ql-align-${align}`);
      
      // Force Quill to register the change
      this.quill.update();
      
      // Update the overlay position
      this.updateOverlay();
      
      // Highlight the active alignment button
      if (this.alignmentControls) {
        const buttons = this.alignmentControls.querySelectorAll('.image-resize-alignment-button');
        buttons.forEach(btn => {
          // Cast to HTMLElement to access style property
          const button = btn as HTMLElement;
          // Reset styles
          button.style.backgroundColor = 'white';
          button.style.color = '#3b82f6';
          button.style.transform = 'scale(1)';
          button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          
          // Highlight active button
          if (button.getAttribute('data-align') === align) {
            button.style.backgroundColor = '#3b82f6';
            button.style.color = 'white';
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
          }
        });
      }
    } catch (error) {
      console.error('Error setting image alignment:', error);
    }
  }
  
  updateImageInEditor() {
    if (!this.currentImg) return;
    
    try {
      // Get the current src and dimensions
      const src = this.currentImg.getAttribute('src');
      const width = this.currentImg.width;
      const height = this.currentImg.height;
      
      // Find the Quill index of the image
      // We'll use a more reliable approach by finding the image's position in the content
      let index = -1;
      const nodes = this.quill.scroll.domNode.querySelectorAll('img');
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i] === this.currentImg) {
          // Get the Quill index from DOM position
          const leaf = this.quill.getLeaf(this.quill.getSelection()?.index || 0);
          if (leaf) {
            const [blot, offset] = leaf;
            index = this.quill.getIndex(blot) + offset;
          }
          break;
        }
      }
      
      if (index === -1) {
        console.warn('Could not find image position in Quill document');
        return;
      }
      
      // Instead of trying to delete and re-insert the image, which is causing problems,
      // we can simply update the current image's attributes directly
      this.currentImg.setAttribute('width', width.toString());
      this.currentImg.setAttribute('height', height.toString());
      
      // Force Quill to register the change
      this.quill.update();
      
      // Force the overlay to update its position
      this.updateOverlay();
    } catch (error) {
      console.error('Error updating image in editor:', error);
    }
    
    // We've moved away from the delete/insert approach,
    // so we don't need this code anymore as we're modifying the
    // image directly now.
  }
}

// Register the module with Quill
// @ts-ignore - Quill modules typing not fully compatible
Quill.register('modules/imageResize', ImageResize);

export default ImageResize;