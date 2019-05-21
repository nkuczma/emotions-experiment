'use strict'
import './css/index.css';
const lab = require('lab.js/dist/lab.dev.js');

// Define a component
var experiment = new lab.flow.Sequence({
    content: [
      new lab.html.Screen({
        content: 'The experiment is running!',
      }),
    ],
  })

// Run it
experiment.run();

console.log("I'm alive");
