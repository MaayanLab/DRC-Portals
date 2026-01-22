/**
 * Credit to Daniel J.B Clarke -- https://github.com/MaayanLab/FAIRshakeInsignia/blob/master/src/index.js 
 */
import tippy from 'tippy.js'
import * as d3 from 'd3'
import 'tippy.js/dist/tippy.css'; // optional for styling


export function generateInsignia(elId: string, scores: any, metrics: any) {
  var el = document.getElementById(elId)
  if (el !== null) {
    for (var i = 0; i < el.children.length; i++) el.removeChild(el.children[i])
    build_svg(el,
      { scores },
      { tooltips: function (rubric: any, metric: any, score: any) { return `${(score * 100).toFixed(0)}% ${metrics[metric]}` } }
    )
  }
}


function nearest_sq(n: any) {
  // Find the nearest square to build the insignia
  return Math.ceil(Math.sqrt(n))
}

function create_sq(svg: any, props: any) {
  // Add a square to an svg
  // props: svg, x, y, size, strokeSize, fillColor, link, tooltip
  var sq = svg.append('rect')
  sq
    .attr('x', props.x)
    .attr('y', props.y)
    .attr('width', props.size)
    .attr('height', props.size)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', props.strokeSize)
    .attr('fill', props.fillColor)

  if (props.tooltip !== undefined) {
    sq
      .attr('class', 'insignia-tooltip')
      .attr('data-tippy-delay', '0')
      .attr('data-tippy-size', 'large')
      .attr('data-tippy-placement', 'right')
      .attr('data-tippy-theme', 'light')
      .attr('data-container', 'body')
      .attr('title', props.tooltip)
      .attr('data-tippy-content', props.tooltip)
      .attr('cursor', 'pointer')

  }

  if (props.link !== undefined) {
    sq.on('click', function () {
      window.location = props.link
    })
  }

  return sq
}

function build_svg(container: any, scores: any, settings: any) {
  // Construct the insignia with arbitrary scores and summaries
  //
  // params:
  //   container: div/element where the svg element will be appended
  //   scores: {rubric-id: {metrid-id: 0, ...}, ...}
  //   settings (optional): {tooltips: {}, color: d3 range, svg: container, tooltip: boolean}
  //
  // Description:
  // This constructs a nested square where the outer square consists
  // of square blocks corresponding to each score in scores and inner
  // squares corresponding to each average in that particular score.
  //
  //     1<n<=4 summaries in second score
  //       \/
  // |--------|-------|
  // |        |___|___|
  // |        |   |   |
  // |--------|-------|
  // |--------|-------|
  // |__|__|__|       | < 1 summary in 1st and fourth score
  // |  |  |  |       | 
  // |--------|-------|
  //   /\
  // 4<n<=9 summaries in third score
  //
  // Color is linarly chosen between Red (0) and Blue (1).

  // D3 Dependency


  // Default settings
  if (scores === undefined)
    scores = {}
  if (settings === undefined)
    settings = {}

  var tooltips = settings.tooltips
  var links = settings.links

  var color = settings.color !== undefined ? settings.color :
    d3.scaleLinear()
      .domain([0, 1])
      .interpolate(d3.interpolateRgb as any)
      .range([
        d3.rgb(255, 0, 0),
        d3.rgb(0, 0, 255),
      ] as any)

  var svg = settings.svg !== undefined ? settings.svg :
    d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr('viewBox', '0 0 1 1')

  var n_scores = Object.keys(scores).length
  var scores_sq = n_scores > 0 ? nearest_sq(n_scores) : 3
  var abs_unit = 1 / scores_sq
  Object.keys(scores).forEach(function (rubric, i) {
    var score = scores[rubric]
    var n_score = Object.keys(score).length
    var summary_sq = n_score > 0 ? nearest_sq(n_score) : 3
    var abs_x = (i % scores_sq) * abs_unit
    var abs_y = Math.floor(i / scores_sq) * abs_unit
    var local_unit = 1 / (scores_sq * summary_sq)

    Object.keys(score).forEach(function (summary, j) {
      var average = score[summary] === null ? NaN : score[summary]
      var local_x = (j % summary_sq) * local_unit
      var local_y = Math.floor(j / summary_sq) * local_unit

      create_sq(svg, {
        x: abs_x + local_x,
        y: abs_y + local_y,
        size: local_unit,
        strokeSize: abs_unit / 40,
        fillColor: isNaN(average) ? 'darkgray' : color(average),
        tooltip: tooltips !== undefined ? tooltips(rubric, summary, average) : undefined,
        link: links !== undefined ? links(rubric, summary, average) : undefined,
      })
    })

    for (var j = n_score; j < summary_sq * summary_sq; j++) {
      var local_x = (j % summary_sq) * local_unit
      var local_y = Math.floor(j / summary_sq) * local_unit

      create_sq(svg, {
        x: abs_x + local_x,
        y: abs_y + local_y,
        size: local_unit,
        strokeSize: abs_unit / 40,
        fillColor: 'lightgrey',
      })
    }
  })

  for (var i = n_scores; i < scores_sq * scores_sq; i++) {
    var abs_x = (i % scores_sq) * abs_unit
    var abs_y = Math.floor(i / scores_sq) * abs_unit

    create_sq(svg, {
      x: abs_x,
      y: abs_y,
      size: abs_unit,
      strokeSize: abs_unit / 40,
      fillColor: 'lightgrey',
    })
  }

  if (tooltips !== undefined) {
    tippy('.insignia-tooltip')
  }
}

