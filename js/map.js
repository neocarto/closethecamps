var map = L.map('map', {
    zoom: 6,
    fullscreenControl: true,
    center: [47.5, 8]
});


var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map designed by <b><a href="https://neocarto.hypotheses.org/" target="_blank">Nicolas LAMBERT</a></b>, 2018. Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'png'
});

Stamen_Watercolor.addTo(map);


//var points = omnivore.csv('data/Calais.csv');
var points = omnivore.csv('data/data_ctc_1fev2018.csv');

var markers;
var on_hold = [];

function attachPopups() {
  // Create popups.
    points.eachLayer(function (layer) {
      var props = layer.feature.properties;

	if (!props.name) {n = "Nom inconnu"} else {n = props.name}
	if (!props.country) {iso = ""} else {iso = props.country}
	var mystyle = [];
	j = 0
	var tab ="";	
	for(var i = 1980; i <= 2018; i++)
	{
	id = "y" + i	
	if (props[id] == "1") {mystyle[j] = "tbl-open"} else {mystyle[j] = "tbl-close"}
	tab += "<td class='"+ mystyle[j] + "'></td>"
	j++;
	}

      

	
				
      layer.bindPopup(
	"<div class='title-center'><b>" + n + "</b> (" + iso + ")</div><hr/>" +
	"<table style='width:250px'><tr><td class ='tbl-left'>1980</td><td class ='tbl-center'><b>Années d'ouverture</b></td><td class = 'tbl-right'>2018</td><table>" +	
	"<table style='width:250px'><tr>"+ tab +"<tr/><table>"	+
	"<div class = 'tbl-center'><b>Violet</b> = ouvert / <b>Gris</b> = fermé ou non renseigné</div>" +
	"<div class = 'tbl-center'><a href='http://closethecamps.org/camp/"+props.id+"' target='_blank'>voir la fiche sur closethecamps.org (si disponible)</a></div>"
	 );
    });
}


points.on('ready', function() {
  markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 30,
  });

  markers.addLayer(points);
  map.addLayer(markers);
  points.eachLayer(attachPopups);
  let my_icon = L.Icon.extend({
    options: {
      iconUrl: "img/dot.png",
      iconSize: [50,16]
    }
  });
  let lyrs = markers.getLayers();
  lyrs.forEach(l => { l.setIcon(new my_icon); });


// Others elements ---------------------------------------------------
d3.select('#compteur').html("Le réseau Migreurop a recensé <span class='emphase'>" + points.getLayers().length + "</span> camps <span class='small'>(actifs au moins 1 an)</span> sur la période <span class='emphase'>1980-2018</span>")



});
// https://github.com/dwilhelm89/LeafletSlider

function resetAllPoints() {
  on_hold.forEach((elem) => {
    let id = elem._leaflet_id;
    points._layers[id] = elem;
  });
  on_hold = [];
}

function foo(year_nb, year_min, year_max) {

  markers.clearLayers();
  resetAllPoints();

	var debutab = year_min - 1977
	var fintab = year_max - 1977
  Object.keys(points._layers).forEach((k) => {
    
	line = Object.values(points._layers[k].feature.properties)
	var count = 0;
	for(var i = debutab; i <= fintab; i++)
	{
	    count = count + Number(line[i]);
	}
        //console.log(count)
   if (count < year_nb) {
      on_hold.push(points._layers[k]);
      points._layers[k] = null;
      delete points._layers[k];
    }
  });

  markers.addLayer(points);
  map.addLayer(markers);
  points.eachLayer(attachPopups);
  let my_icon = L.Icon.extend({
    options: {
      iconUrl: "img/dot.png",
      iconSize: [50,16]
    }
  });
  let lyrs = markers.getLayers();
  lyrs.forEach(l => { l.setIcon(new my_icon); });

}


// Slider ---------------------------------------------------
 

// Others elements ---------------------------------------------------
d3.select('#logo').html("<a href='http://closethecamps.org/' target='_blank' ><img src='img/logo.png' width='300px'></img></a>")

// Formulaire 

$("#newform").append(" Afficher les camps qui ont été ouverts au moins ");

var select = '<select id="form-nb">';
for(var i = 1; i <= 10; i++){		
   if (i == 1){var sel = " selected"} else {sel = ""}
   select += '<option ' + sel + ' value=' + i + '>' + i + '</option>';
   }
$("#newform").append(select);

$("#newform").append(" an(s) ");

var select = '<select id="form-debut">';
for(var i = 1980; i <= 2018; i++){
   if (i == 1980){var sel = " selected"} else {sel = ""}
   select += '<option ' + sel + ' value=' + i + '>' + i + '</option>';
}
$("#newform").append(" de ");

$("#newform").append(select);

$("#newform").append(" à ");

var select = '<select id="form-fin">';
for(var i = 1980; i <= 2018; i++){
   if (i == 2018){var sel = " selected"} else {sel = ""}
   select += '<option ' + sel + ' value=' + i + '>' + i + '</option>';
}
$("#newform").append(select);

$("#newform").append(" inclus.   ");

$("#newform").append("<input type='submit' name='form-submit' id = 'form-submit' value=' Rafraichir la carte'>");

$( "#form-submit" ).click(function( event ) {
	var formnb = document.getElementById('form-nb').value ;
	var formdebut = document.getElementById('form-debut').value ;
	var formfin = document.getElementById('form-fin').value ;
	foo(formnb,formdebut,formfin);

if (formnb == 1){var s = ""} else {var s = "s"}
d3.select('#compteur').html("Le réseau Migreurop a recensé <span class='emphase'>" + points.getLayers().length +"</span> camps <span class='small'>(actifs au moins " + formnb + " an" + s + ")</span> sur la période <span class='emphase'>" + formdebut + "-" + formfin + "<span class='emphase'>" )


});   


// https://github.com/dwilhelm89/LeafletSlider




