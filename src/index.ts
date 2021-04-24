import * as d3 from "d3";
import { interpolateMagma } from "d3";
import { on } from "node:events";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
import { stats_current, stats_previous, ResultEntry } from "./stats";

const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const getAffectedCases = (comunidad: string, data: any[]) => {
  const entry = data.find((item) => item.name === comunidad);  
  return entry ? entry.value : 0;
};

const calculateBasedOnAffectedCases = (comunidad: string, data: any[]) => {
  const value = getAffectedCases(comunidad, data)
  var max = data.reduce((max, item) => (item.value > max ? item.value : max), 0);
  return value / max * 40;
};
  
const calculateRadiusBasedOnAffectedCases = (
    comunidad: string,
    data: any[]
  ) => {
    return calculateBasedOnAffectedCases(comunidad, data);
  };

const aProjection = d3Composite
  .geoConicConformalSpain()
  .scale(3300)
  .translate([500, 400]);
const geoPath = d3.geoPath().projection(aProjection);

const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  .attr("d", geoPath as any)
  .style("style", "backgroud-color: #e6f4f1");

const updateData = (data: any[]) => {
  svg.selectAll("path").remove();
  svg.selectAll("circle").remove();

  const calculateMaxAffected = (data) => {
    return data.reduce(
      (max, item) => (item.value > max ? item.value : max),
      0
    );
  };
  const maxAffected = calculateMaxAffected(data);

  const colorCommunity = d3
    .scaleThreshold<number, string>()
    .domain([0, maxAffected * 0.1, maxAffected * 0.2, maxAffected * 0.6, maxAffected * 0.7, maxAffected])
    .range([
      "#e6f4f1",
      "#c1d5fa",
      "#93a6ca",
      "#667a9c",
      "#3c5170",
      "#3f4756",
      "#122b47",
    ]);

  const colorCircle = d3
    .scaleThreshold<number, string>()
    .domain([0, 50, 100, 1200, 5000, 50000])
    .range([
      "#6ca550",
      "#b5c362",      
      "#fde181",
      "#ffc3ac",
      "#fc8c77",
      "#bf5847"
    ]);

  const assignColor = (comunidad: string, dataset: ResultEntry[], circle: boolean) => {
    const entry = dataset.find((item) => item.name === comunidad);
    if (circle){
      return entry ? colorCircle(entry.value) : colorCircle(0);
    }
    return entry ? colorCommunity(entry.value) : colorCommunity(0);
  };

  svg
    .selectAll("path")
    .data(geojson["features"])
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", geoPath as any)
    .style("fill", function (d: any) {
      return assignColor(d.properties.NAME_1, data, false)
    })

  svg
    .selectAll("circle")
    .data(latLongCommunities)
    .enter()
    .append("circle")
    //.transition()
    //.duration(500)
    .attr("class", "affected-marker")
    .attr("fill", (d, i) => {
      return assignColor(d.name, data, true);
    })
    .attr("r", (d) => calculateRadiusBasedOnAffectedCases(d.name, data))
    .attr("cx", (d) => aProjection([d.long, d.lat])[0])
    .attr("cy", (d) => aProjection([d.long, d.lat])[1])    
    .on("mouseover", function (e: any, datum:any) {            
        const coords = { x: e.x, y: e.y };
        div.transition().duration(200).style("opacity", 0.9);
        div
          .html(`<span>${datum.name}: ${getAffectedCases(datum.name, data)}</span>`)
          .style("left", `${coords.x}px`)
          .style("top", `${coords.y - 28}px`);
      })
      .on("mouseout", function (datum) {    
        div.transition().duration(500).style("opacity", 0);
      });
};

  document
  .getElementById("Previous")
  .addEventListener("click", function handleResultsApril() {
    updateData(stats_previous);
  });

document
  .getElementById("Actual")
  .addEventListener("click", function handleResultsNovember() {
    updateData(stats_current);
  });

  updateData(stats_previous);