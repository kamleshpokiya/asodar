// Position for the round image (adjust these as percentages or specific coordinates)
// These will be relative to template size
let ROUND_IMAGE_X_PERCENT = 0.5; // 50% from left (center)
let ROUND_IMAGE_Y_PERCENT = 0.408; // 40.8% from top
let ROUND_IMAGE_RADIUS_PERCENT = 0.141; // 14.1% of template width

// Position for the name text (adjust these as percentages)
let NAME_X_PERCENT = 0.5; // 50% from left (center)
let NAME_Y_PERCENT = 0.547; // 54.7% from top

// Debug mode - set to true to see positioning guides
const DEBUG_MODE = false;

let templateImage = null;
let userImage = null;
let userName = '';
let templateWidth = 0;
let templateHeight = 0;

// Get canvas and context
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');

// Load template image
const templateImg = new Image();
templateImg.crossOrigin = 'anonymous';
templateImg.onload = function() {
  templateImage = this;
  // Use template's original dimensions
  templateWidth = this.naturalWidth;
  templateHeight = this.naturalHeight;
  
  // Set canvas to template's original size (for quality)
  canvas.width = templateWidth;
  canvas.height = templateHeight;
  
  // Set display size to be smaller but maintain aspect ratio
  const maxDisplayWidth = 600;
  const maxDisplayHeight = 500;
  const aspectRatio = templateWidth / templateHeight;
  
  let displayWidth = maxDisplayWidth;
  let displayHeight = maxDisplayWidth / aspectRatio;
  
  // If height exceeds max, scale based on height instead
  if (displayHeight > maxDisplayHeight) {
    displayHeight = maxDisplayHeight;
    displayWidth = maxDisplayHeight * aspectRatio;
  }
  
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';
  
  updatePreview();
};
templateImg.src = 'template.png';

// Name input handler
document.getElementById('nameInput').addEventListener('input', function(e) {
  userName = e.target.value;
  updatePreview();
});

// Position adjustment sliders (commented out - controls are hidden)
/*
document.getElementById('imgXSlider').addEventListener('input', function(e) {
  ROUND_IMAGE_X_PERCENT = e.target.value / 100;
  document.getElementById('imgXValue').textContent = e.target.value + '%';
  updatePreview();
});

document.getElementById('imgYSlider').addEventListener('input', function(e) {
  ROUND_IMAGE_Y_PERCENT = e.target.value / 100;
  document.getElementById('imgYValue').textContent = e.target.value + '%';
  updatePreview();
});

document.getElementById('imgSizeSlider').addEventListener('input', function(e) {
  ROUND_IMAGE_RADIUS_PERCENT = e.target.value / 100;
  document.getElementById('imgSizeValue').textContent = e.target.value + '%';
  updatePreview();
});

document.getElementById('nameXSlider').addEventListener('input', function(e) {
  NAME_X_PERCENT = e.target.value / 100;
  document.getElementById('nameXValue').textContent = e.target.value + '%';
  updatePreview();
});

document.getElementById('nameYSlider').addEventListener('input', function(e) {
  NAME_Y_PERCENT = e.target.value / 100;
  document.getElementById('nameYValue').textContent = e.target.value + '%';
  updatePreview();
});
*/

// Image input handler
document.getElementById('imageInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        userImage = this;
        updatePreview();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Update preview function
function updatePreview() {
  if (!templateImage || templateWidth === 0 || templateHeight === 0) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw template image at its original size
  ctx.drawImage(templateImage, 0, 0, templateWidth, templateHeight);
  
  // Calculate positions based on template size
  const roundImageX = templateWidth * ROUND_IMAGE_X_PERCENT;
  const roundImageY = templateHeight * ROUND_IMAGE_Y_PERCENT;
  const roundImageRadius = templateWidth * ROUND_IMAGE_RADIUS_PERCENT;
  
  // Draw user image in round area if available
  if (userImage) {
    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(roundImageX, roundImageY, roundImageRadius, 0, Math.PI * 2);
    ctx.clip();
    
    // Calculate image dimensions to fill the circle while maintaining aspect ratio
    const imgSize = roundImageRadius * 2;
    const imgAspect = userImage.width / userImage.height;
    let drawWidth = imgSize;
    let drawHeight = imgSize;
    
    // Maintain aspect ratio and center perfectly
    if (imgAspect > 1) {
      // Image is wider than tall
      drawHeight = imgSize / imgAspect;
      drawWidth = imgSize;
    } else {
      // Image is taller than wide
      drawWidth = imgSize * imgAspect;
      drawHeight = imgSize;
    }
    
    // Center the image within the circle
    const drawX = roundImageX - drawWidth / 2;
    const drawY = roundImageY - drawHeight / 2;
    
    ctx.drawImage(userImage, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
    
    // Debug: Draw circle outline
    if (DEBUG_MODE) {
      ctx.save();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(roundImageX, roundImageY, roundImageRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  
  // Calculate name position based on template size
  const nameX = templateWidth * NAME_X_PERCENT;
  const nameY = templateHeight * NAME_Y_PERCENT;
  
  // Draw name text if available
  if (userName) {
    ctx.save();
    // Use a font that supports Gujarati characters - scale font size based on template
    const fontSize = Math.max(22, templateWidth * 0.038); // ~3.8% of width, minimum 22px
    ctx.font = `bold ${fontSize}px "Noto Sans Gujarati", "Arial Unicode MS", Arial, sans-serif`;
    ctx.fillStyle = '#FFFFFF'; // White text on dark teal banner
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Measure text to ensure proper centering
    const textMetrics = ctx.measureText(userName);
    ctx.fillText(userName, nameX, nameY);
    ctx.restore();
    
    // Debug: Draw text position marker
    if (DEBUG_MODE) {
      ctx.save();
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(nameX - 20, nameY);
      ctx.lineTo(nameX + 20, nameY);
      ctx.moveTo(nameX, nameY - 20);
      ctx.lineTo(nameX, nameY + 20);
      ctx.stroke();
      ctx.restore();
    }
  }
}

// Download button handler
document.getElementById('downloadBtn').addEventListener('click', function() {
  const link = document.createElement('a');
  link.download = 'generated-image.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

