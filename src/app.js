/* eslint-env browser */
// Bootstrap imports
import 'bootstrap/dist/js/bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Button
const uploadButton = document.getElementById('upload'); // Upload Button on first page
const submitMap = document.getElementById('submit-map'); // Submit Button on second page

// Drop Down select
const reference = document.getElementById('reference'); // Reference Genomes

// Bootstrap pills
const pillsMapTab = document.getElementById('pills-map-tab'); // Second page
const pillsFineMapTab = document.getElementById('pills-fine-map-tab'); // Third page

// Upload data
uploadButton.onclick = () => {
  // Enable Chromosome selector
  pillsMapTab.classList.remove('disabled');
  pillsMapTab.click();
  alert(`Reference: ${reference.value}`);
};

// Select a chromosome
submitMap.onclick = () => {
  // Enable
  pillsFineMapTab.classList.remove('disabled');
  pillsFineMapTab.click();
  alert('Fine tune data');
};
