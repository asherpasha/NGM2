/* eslint-env browser */
// Bootstrap imports
import 'bootstrap/dist/js/bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as d3 from 'd3';


// App url
const baseUrl = '//bar.utoronto.ca/~asher/ngm2';

// Button
const uploadButton = document.getElementById('upload'); // Upload Button on first page
const submitMap = document.getElementById('submit-map'); // Submit Button on second page

// Drop Down select
const reference = document.getElementById('reference'); // Reference Genomes

// Bootstrap pills
const pillsMapTab = document.getElementById('pills-map-tab'); // Second page
const pillsFineMapTab = document.getElementById('pills-fine-map-tab'); // Third page

// Functions
// Update chromosomes on second page
const updateChromosomes = (response) => {
  // Update session id
  const session = document.getElementById('session-id');
  session.innerText = response.session;

  const chromosomes = document.getElementById('chromosomes');
  const rows = document.createElement('div');
  rows.classList.add('row');

  Object.entries(response.data).forEach(([key, value]) => {
    // Add radio button div
    const radio = document.createElement('div');
    radio.classList.add('col-sm-1');

    // Create radio button
    const radioElm = document.createElement('input');
    radioElm.classList.add('radio');
    radioElm.type = 'radio';
    radioElm.name = 'chromosome-radio';
    radioElm.value = key;
    radioElm.id = key;

    // Create radio button label
    const radioLabel = document.createElement('label');
    radioLabel.for = key;
    radioLabel.innerText = key;

    radio.appendChild(radioElm);
    radio.appendChild(radioLabel);
    rows.appendChild(radio);

    // Add Image div
    const image = document.createElement('div');
    image.classList.add('col-sm-11');

    // Create image
    const imgElem = document.createElement('img');
    imgElem.setAttribute('width', '100%');
    imgElem.setAttribute('height', '100%');
    imgElem.alt = key;
    imgElem.src = `${baseUrl}/tmp/${value}`;

    image.appendChild(imgElem);
    rows.appendChild(image);
  });

  chromosomes.appendChild(rows);
};

// Events
// Upload data
uploadButton.onclick = () => {
  // Enable Chromosome selector
  pillsMapTab.classList.remove('disabled');
  pillsMapTab.click();

  // Get data
  fetch(`${baseUrl}/cgi-bin/process_data.cgi`)
    .then(response => response.json())
    .then((response) => {
      if (response.result === 'success') {
        updateChromosomes(response);
      } else {
        console.log('Failed to fetch data!');
      }
    });

  console.log(`Reference: ${reference.value}`);
};

// Table
const rowTemplate = d => `
    <td>${d.Chromosome}</td>
    <td>${d.Position}</td>
    <td>${d.Ref_Base}</td>
    <td>${d.SNP_Base}</td>
    <td>${d.Dept}</td>
    <td>${d.Discord_chastity}</td>
    <td>${d.Accession}</td>
    <td>${d.Tag}</td>
    <td>${d.Strand}</td>
    <td>${d.Ref_Codon}</td>
    <td>${d.SNP_Codon}</td>
    <td>${d.AA_Change}</td>
    <td>${d.Blosum_100}</td>
  `;

// Select a chromosome
submitMap.onclick = () => {
  // Enable
  pillsFineMapTab.classList.remove('disabled');
  pillsFineMapTab.click();

  // Source for graph: https://bl.ocks.org/EfratVil/92f894ac0ba265192411e73f633a3e2f
  // Source for Table: https://codepen.io/pj_/post/d3-table-with-template-literals

  d3.tsv(`${baseUrl}/cgi-bin/get_snp_data.cgi`).then((data) => {
    const table = d3.select('#fine-map-table')
      .append('table');

    table.attr('class', 'table');

    table.append('thead')
      .selectAll('th')
      .data(data.columns)
      .enter()
      .append('th')
      .text(d => d);

    table.append('tbody')
      .selectAll('tr')
      .data(data)
      .enter()
      .append('tr')
      .html(rowTemplate);
  });
};
