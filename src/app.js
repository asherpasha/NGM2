/* eslint-env browser */
// Bootstrap imports
import 'bootstrap/dist/js/bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
// import * as d3 from 'd3';

// d3
const d3 = require('d3');

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
    .then((response) => response.json())
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
const rowTemplate = (d) => `
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

  // Source for Table: https://codepen.io/pj_/post/d3-table-with-template-literals

  d3.tsv(`${baseUrl}/cgi-bin/get_snp_data.cgi`).then((data) => {
    // Build the table first
    const table = d3.select('#fine-map-table')
      .append('table');

    table.attr('class', 'table table-striped');

    table.append('thead')
      .selectAll('th')
      .data(data.columns)
      .enter()
      .append('th')
      .text((d) => d);

    table.append('tbody')
      .selectAll('tr')
      .data(data)
      .enter()
      .append('tr')
      .html(rowTemplate);

    // Now build the graph
    // Source for graph: https://blockbuilder.org/aendrew/6216809b022682bb8c247d37b9df32dc
    const svg = d3.select('svg')
      .attr('width', 1130);
    const margin = {
      top: 20, right: 20, bottom: 110, left: 50,
    };
    const margin2 = {
      top: 430, right: 20, bottom: 30, left: 50,
    };
    const height = svg.attr('height') - margin.top - margin.bottom;
    const height2 = svg.attr('height') - margin2.top - margin2.bottom;
    const width = svg.attr('width') - margin.right - margin.left;

    const x = d3.scaleLinear().range([0, width]);
    const x2 = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    const y2 = d3.scaleLinear().range([height2, 0]);

    const xAxis = d3.axisBottom(x).tickSize(0);
    const xAxis2 = d3.axisBottom(x2).tickSize(0);
    const yAxis = d3.axisLeft(y).tickSize(0);

    const brush = d3.brushX()
      .extent([[0, 0], [width, height2]])
      .on('brush', () => {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
        const s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));
        focus.selectAll('.dataPoint')
          .attr('cx', (d) => x(d.Position))
          .attr('cy', (d) => y(d.Discord_chastity));
        focus.select('.x-axis').call(xAxis);
        svg.select('.zoom').call(zoom.transform, d3.zoomIdentity
          .scale(width / (s[1] - s[0]))
          .translate(-s[0], 0));
        const e = d3.event.selection;
        focus.selectAll('.message').filter(() => {
          const xValue = this.getAttribute('cx');
          return e[0] <= xValue && xValue <= e[1];
        });
      });

    const zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', () => {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
        const t = d3.event.transform;
        x.domain(t.rescaleX(x2).domain());
        focus.selectAll('.dataPoint')
          .attr('cx', (d) => x(d.Position))
          .attr('cy', (d) => y(d.Discord_chastity));
        focus.select('.x-axis').call(xAxis);
        context.select('.brush').call(brush.move, x.range().map(t.invertX, t));
      });

    svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    const focus = svg.append('g')
      .attr('class', 'focus')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const context = svg.append('g')
      .attr('class', 'context')
      .attr('transform', `translate(${margin2.left},${margin2.top})`);

    x.domain([0, 25771244]);
    y.domain([0.7, 1.1]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    // append scatter plot to main chart area
    const dataPoint = focus.append('g');
    dataPoint.attr('clip-path', 'url(#clip)');
    dataPoint.selectAll('dataPoint')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dataPoint')
      .attr('r', 4)
      .style('opacity', 0.7)
      .attr('cx', (d) => x(d.Position))
      .attr('cy', (d) => y(d.Discord_chastity));

    focus.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    focus.append('g')
      .attr('class', 'axis axis--y')
      .call(yAxis);

    // Summary Stats
    focus.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Discord Chastity');

    svg.append('text')
      .attr('transform',
        `translate(${(width + margin.right + margin.left) / 2} ,${
          height + margin.top + margin.bottom})`)
      .style('text-anchor', 'middle')
      .text('Position');

    svg.append('rect')
      .attr('class', 'zoom')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(zoom);

    // append scatter plot to brush chart area
    const dataPoint2 = context.append('g');
    dataPoint2.attr('clip-path', 'url(#clip)');
    dataPoint2.selectAll('dataPoint2')
      .data(data)
      .enter().append('circle')
      .attr('class', 'messageContext')
      .attr('r', 3)
      .style('opacity', 0.6)
      .attr('cx', (d) => x2(d.Position))
      .attr('cy', (d) => y2(d.Discord_chastity));

    context.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height2})`)
      .call(xAxis2);

    context.append('g')
      .attr('class', 'brush')
      .call(brush)
      .call(brush.move, x.range());
  });
};
